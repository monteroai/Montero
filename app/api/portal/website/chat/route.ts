import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, isAdminEnvConfigured } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/portal/email'
import { WEBSITE_SECTIONS } from '@/lib/portal/constants'

// Site Studio chat â€” the client edits their website by talking to it.
//
// POST { business_id, messages: [{role, content}] }
//   â†’ { reply, updates: [{section, new_text}], escalated, usage }
//
// Two abilities, hard-scoped:
//  1. update_section_text â€” TEXT ONLY. Sanitized server-side (tags stripped,
//     length capped). Applied to portal_website_content, logged as an
//     auto-approved change request, metered in portal_ai_edits, and emailed
//     to the team so the live static site gets synced.
//  2. escalate_to_team â€” anything that is not a simple text change (images,
//     colors, layout, new pages/sections) is emailed to ai@montero.cool and
//     flagged in the activity feed. Nothing else can touch the site.

const TEAM_EMAIL = process.env.ESCALATION_EMAIL || 'ai@montero.cool'
const DEFAULT_MONTHLY_LIMIT = 30
const MAX_TOOL_ROUNDS = 5

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'update_section_text',
    description:
      'Replace the text content of one website section. TEXT ONLY â€” plain words, line breaks allowed. Use for wording changes, fixing typos, updating hours/prices/phone numbers, rewriting copy. Never use for anything visual.',
    input_schema: {
      type: 'object',
      properties: {
        section: { type: 'string', enum: [...WEBSITE_SECTIONS], description: 'Which section to update' },
        new_text: { type: 'string', description: 'The complete new text for the section (replaces the old text entirely)' },
      },
      required: ['section', 'new_text'],
    },
  },
  {
    name: 'escalate_to_team',
    description:
      'Send a request to the Montero team for any change that is NOT a simple text edit: images, photos, logos, colors, fonts, layout, animations, new sections or pages, forms, links/navigation, SEO, or anything technical. The team makes these changes manually.',
    input_schema: {
      type: 'object',
      properties: {
        request_summary: { type: 'string', description: "Clear description of what the client wants changed, specific enough for the team to act on without asking again. Include which page/section if known." },
      },
      required: ['request_summary'],
    },
  },
]

const SYSTEM_PROMPT = `You are Site Studio, the website editor inside the MONTERO client portal. The signed-in business owner talks to you to change their website. They are not technical â€” plain English, no jargon.

STRICT SCOPE â€” read carefully:
- You can do exactly ONE thing yourself: change the TEXT of the six website sections (hero, about, testimonials, services, contact, footer) using update_section_text.
- EVERYTHING else â€” images, photos, logos, colors, fonts, layout, spacing, animations, new sections, new pages, buttons, links, navigation, forms, embeds, code, SEO â€” you cannot do. For those, use escalate_to_team and tell the client the Montero team received their request and will handle it (usually within a business day).
- If a request mixes both (e.g. "new photo and better headline"), do the text part yourself and escalate the rest â€” in the same turn.
- Never output HTML, CSS, code, or markup in section text. Plain text with line breaks only.
- Preserve facts (names, numbers, addresses, prices, hours) unless the client explicitly changes them.
- If the instruction is ambiguous about which section, look at the current content below and pick the obviously-matching one; ask only if genuinely unclear.
- Text changes go live after a quick sync by our team, usually same day. Say "I've made that change â€” it'll be live on your site shortly" rather than promising instant.

Style: warm, brief, confident. 1-3 sentences per reply. No exclamation points, no "Great question!". Confirm what you changed in plain words.`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function sanitizeText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')                      // strip any markup
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // control chars (keep newlines/tabs)
    .replace(/(javascript|data|vbscript):/gi, '')
    .slice(0, 3000)
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const businessId: string | undefined = body.business_id
    const history: ChatMessage[] = Array.isArray(body.messages) ? body.messages : []
    if (!businessId || history.length === 0) {
      return NextResponse.json({ error: 'business_id and messages required' }, { status: 400 })
    }

    // Ownership via RLS
    const [{ data: client }, { data: business }] = await Promise.all([
      supabase.from('portal_clients').select('*').eq('user_id', user.id).single(),
      supabase.from('portal_businesses').select('id, business_name, industry, description, website_url').eq('id', businessId).single(),
    ])
    if (!client || !business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    const exempt = (client as Record<string, unknown>).billing_exempt === true

    // Monthly cap (skipped for exempt clients; degrades to unmetered pre-SQL)
    let used = 0
    let metered = false
    if (isAdminEnvConfigured()) {
      const monthStart = new Date()
      monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)
      const { count, error } = await adminClient()
        .from('portal_ai_edits')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .gte('created_at', monthStart.toISOString())
      if (!error) { used = count || 0; metered = true }
    }
    if (!exempt && metered && used >= DEFAULT_MONTHLY_LIMIT) {
      return NextResponse.json({
        reply: `You've used all ${DEFAULT_MONTHLY_LIMIT} AI edits this month. Use the Talk to Emilio button and we'll take care of your changes directly.`,
        updates: [], escalated: false,
        usage: { used, limit: DEFAULT_MONTHLY_LIMIT, exempt },
      })
    }

    // Current section content for grounding
    const { data: sections } = await supabase
      .from('portal_website_content')
      .select('section, content')
      .eq('business_id', businessId)
    const sectionBlock = WEBSITE_SECTIONS.map(s => {
      const row = sections?.find(r => r.section === s)
      const text = (row?.content as Record<string, unknown> | undefined)?.text
      return `<section name="${s}">\n${typeof text === 'string' && text ? text : '(empty)'}\n</section>`
    }).join('\n')

    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      {
        type: 'text',
        text: `Business: ${business.business_name}${business.industry ? ` (${business.industry})` : ''}\n${business.description ? `About: ${business.description}\n` : ''}Live site: ${business.website_url || 'not set'}\n\nCurrent website content:\n${sectionBlock}`,
      },
    ]

    const anthropic = new Anthropic()
    const messages: Anthropic.MessageParam[] = history.slice(-16).map(m => ({ role: m.role, content: m.content }))
    const updates: Array<{ section: string; new_text: string; old_text: string }> = []
    let escalated = false
    let reply = ''

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1500,
        system: systemBlocks,
        tools: TOOLS,
        messages,
      })

      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      const text = response.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('\n').trim()
      if (text) reply = text

      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) break

      messages.push({ role: 'assistant', content: response.content })
      const results: Anthropic.ToolResultBlockParam[] = []

      for (const tu of toolUses) {
        if (tu.name === 'update_section_text') {
          const input = tu.input as { section?: string; new_text?: string }
          const section = String(input.section || '')
          const newText = sanitizeText(String(input.new_text || ''))
          if (!(WEBSITE_SECTIONS as readonly string[]).includes(section) || !newText) {
            results.push({ type: 'tool_result', tool_use_id: tu.id, content: 'Invalid section or empty text â€” nothing changed.', is_error: true })
            continue
          }
          const oldRow = sections?.find(r => r.section === section)
          const oldText = String((oldRow?.content as Record<string, unknown> | undefined)?.text || '')

          const admin = adminClient()
          const { error: upErr } = await admin
            .from('portal_website_content')
            .upsert(
              { business_id: businessId, section, content: { text: newText }, updated_at: new Date().toISOString() },
              { onConflict: 'business_id,section' },
            )
          if (upErr) {
            results.push({ type: 'tool_result', tool_use_id: tu.id, content: `Save failed: ${upErr.message}`, is_error: true })
            continue
          }
          await admin.from('portal_change_requests').insert({
            business_id: businessId,
            section,
            old_content: { text: oldText },
            new_content: { text: newText, source: 'ai-chat' },
            status: 'approved',
            reviewer_note: 'Auto-approved: text-only Site Studio edit',
            reviewed_at: new Date().toISOString(),
          }).then(() => undefined, () => undefined)
          await admin.from('portal_ai_edits').insert({
            client_id: client.id,
            business_id: businessId,
            section,
            instruction: history[history.length - 1]?.content?.slice(0, 1000) || '',
          }).then(() => undefined, () => undefined)

          updates.push({ section, new_text: newText, old_text: oldText })
          results.push({ type: 'tool_result', tool_use_id: tu.id, content: `Section "${section}" updated.` })
        } else if (tu.name === 'escalate_to_team') {
          const input = tu.input as { request_summary?: string }
          const summary = String(input.request_summary || '').slice(0, 2000)
          const admin = adminClient()
          await admin.from('portal_interactions').insert({
            business_id: businessId,
            type: 'chat',
            summary: `Website change request: ${summary}`,
            flagged: true,
            flag_reason: 'Site Studio â€” needs manual change',
          }).then(() => undefined, () => undefined)
          const emailRes = await sendEmail({
            to: TEAM_EMAIL,
            subject: `[Site Studio] ${business.business_name}: manual change requested`,
            text: `Client: ${client.owner_name} (${client.primary_email || 'no email'})\nBusiness: ${business.business_name}\nLive site: ${business.website_url || 'not set'}\n\nRequest:\n${summary}`,
          })
          escalated = true
          results.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: emailRes.ok
              ? 'Request sent to the Montero team.'
              : 'Request logged for the Montero team (it appears in their flagged activity feed).',
          })
        } else {
          results.push({ type: 'tool_result', tool_use_id: tu.id, content: 'Unknown tool.', is_error: true })
        }
      }

      messages.push({ role: 'user', content: results })
    }

    // One digest email per turn so the live static site gets synced
    if (updates.length > 0) {
      await sendEmail({
        to: TEAM_EMAIL,
        subject: `[Site Studio] ${business.business_name}: ${updates.length} text change${updates.length > 1 ? 's' : ''} to sync`,
        text: [
          `Client: ${client.owner_name} (${client.primary_email || 'no email'})`,
          `Business: ${business.business_name}`,
          `Live site: ${business.website_url || 'not set'}`,
          '',
          ...updates.map(u => `SECTION: ${u.section}\n--- OLD ---\n${u.old_text || '(empty)'}\n--- NEW ---\n${u.new_text}\n`),
          'Applied in the portal (auto-approved). Sync the live static site with the NEW text above.',
        ].join('\n'),
      }).then(() => undefined, () => undefined)
    }

    const newUsed = exempt ? used : used + updates.length
    return NextResponse.json({
      reply: reply || (updates.length ? 'Done â€” the change is saved and will be live on your site shortly.' : 'How can I help with your website?'),
      updates: updates.map(u => ({ section: u.section, new_text: u.new_text })),
      escalated,
      usage: { used: newUsed, limit: DEFAULT_MONTHLY_LIMIT, exempt },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Chat failed'
    console.error('[portal/website/chat]', msg)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
