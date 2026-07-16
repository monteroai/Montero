import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT_BASE = `You are the in-portal AI assistant for MONTERO, a managed-service AI automation platform for small businesses.

You help the signed-in account owner understand and operate their portal. They are not technical — speak in plain English. Avoid jargon (no "API", "webhook", "n8n workflow ID", "RLS"). When you reference an automation, use its friendly name. When the account owner runs multiple businesses, scope your answer to the business currently selected unless they explicitly ask about another one.

You have access to:
- Their account profile (owner name, email, admin status)
- All businesses they manage (only the currently active one is detailed)
- Every automation set up for the active business, with status (running, off, error)
- Recent activity for the active business: calls answered, forms submitted, emails received, chat messages
- Any flagged items the system thinks need their attention

When asked about something you don't know, say so plainly and tell them how to find it (e.g. "Check the Activity tab" or "Use the 'Talk to Emilio' button below this chat").

New requests and ideas — IMPORTANT:
- When the client asks for something the portal doesn't do yet (a new Instagram page, a new service, a new automation, anything outside the current tabs), treat it as a VALUABLE idea, never a dead end. Respond warmly: tell them it's a great request, that the Montero team will look at it personally and follow up quickly, and encourage them to tap the "Talk to Emilio" button below this chat with one line describing it so it reaches the team flagged as high priority.
- Never say "we can't do that." Say the team handles it directly while the self-serve version is built.

Style:
- Warm, direct, brief. 1-3 short paragraphs max unless they ask for detail.
- No marketing fluff. No exclamation points. No "Great question!"
- If they ask you to do something the portal can't do yet, say so and offer the closest available action.
- Never invent automations, statuses, or activity. Only reference what's in the context block below.
- Never reveal API keys, internal IDs, raw database rows, or implementation details.

Contact info — STRICT RULES:
- The ONLY support contact is the email "ai@montero.cool" (the AI brand inbox routed to the Montero team).
- NEVER invent personal emails like "emilio@…" or any other variant. Emilio's name appears in your context, but his personal email is NOT public. If you need to point the client at a human, say "Use the Talk to Emilio button below this chat" — that's the escalation flow built into the portal.
- If asked for a phone number or any other contact channel, say you don't have one and direct them to the Talk to Emilio button or ai@montero.cool.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : []
    const activeBusinessId: string | undefined = body.active_business_id || undefined
    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Get account
    const { data: client } = await supabase
      .from('portal_clients')
      .select('id, owner_name, primary_email, is_admin, onboarding_complete')
      .eq('user_id', user.id)
      .single()

    // Get all businesses
    let businesses: Array<Record<string, unknown>> = []
    if (client) {
      const { data } = await supabase
        .from('portal_businesses')
        .select('id, business_name, industry, business_phone, business_email, description')
        .eq('client_id', client.id)
        .eq('is_archived', false)
        .order('sort_order')
      businesses = data || []
    }

    // ADMIN: may select ANY client's business in the header switcher — resolve
    // the active business across all clients and read its data with the
    // service role (RLS would hide other clients' rows from the user session).
    // Non-admins stay hard-scoped to their own businesses: nothing changes.
    const isAdmin = Boolean(client?.is_admin)
    let adminAllBusinesses: Array<Record<string, unknown>> = []
    let foreignOwner: string | null = null
    if (isAdmin) {
      const { data } = await adminClient()
        .from('portal_businesses')
        .select('id, business_name, industry, business_phone, business_email, description, client_id, portal_clients(owner_name)')
        .eq('is_archived', false)
      adminAllBusinesses = data || []
    }

    let activeBusiness = businesses.find(b => b.id === activeBusinessId) || null
    if (!activeBusiness && isAdmin && activeBusinessId) {
      const foreign = adminAllBusinesses.find(b => b.id === activeBusinessId)
      if (foreign) {
        activeBusiness = foreign
        const oc = foreign.portal_clients as { owner_name?: string } | null
        foreignOwner = oc?.owner_name || 'another client'
      }
    }
    if (!activeBusiness) activeBusiness = businesses[0] || null

    // For active business: fetch automations + recent activity
    const db = isAdmin ? adminClient() : supabase
    let automations: Array<Record<string, unknown>> = []
    let interactions: Array<Record<string, unknown>> = []
    if (activeBusiness) {
      const [{ data: a }, { data: i }] = await Promise.all([
        db
          .from('portal_automations')
          .select('friendly_name, description, category, active, last_status, last_run')
          .eq('business_id', activeBusiness.id)
          .order('sort_order'),
        db
          .from('portal_interactions')
          .select('type, summary, flagged, flag_reason, created_at')
          .eq('business_id', activeBusiness.id)
          .order('created_at', { ascending: false })
          .limit(15),
      ])
      automations = a || []
      interactions = i || []
    }

    // Build context block
    const ctx: string[] = []
    if (client) {
      ctx.push(`<account>`)
      ctx.push(`Owner: ${client.owner_name}`)
      if (client.primary_email) ctx.push(`Email: ${client.primary_email}`)
      ctx.push(`Onboarding complete: ${client.onboarding_complete ? 'yes' : 'no'}`)
      if (client.is_admin) ctx.push(`Role: ADMIN (Montero internal)`)
      ctx.push(`</account>`)
    }

    if (businesses.length > 0) {
      ctx.push(`<businesses_count>${businesses.length}</businesses_count>`)
      ctx.push(`<all_businesses>`)
      for (const b of businesses) {
        const tag = b.id === activeBusiness?.id ? ' [ACTIVE]' : ''
        ctx.push(`- ${b.business_name}${tag}${b.industry ? ` (${b.industry})` : ''}`)
      }
      ctx.push(`</all_businesses>`)
    } else {
      ctx.push(`<businesses>No businesses set up yet.</businesses>`)
    }

    if (isAdmin && adminAllBusinesses.length > 0) {
      ctx.push(`<admin_platform_businesses note="visible to you ONLY because this account is Montero admin — clients never see other clients' businesses">`)
      for (const b of adminAllBusinesses) {
        const oc = b.portal_clients as { owner_name?: string } | null
        const tag = b.id === activeBusiness?.id ? ' [ACTIVE]' : ''
        ctx.push(`- ${b.business_name}${tag}${b.industry ? ` (${b.industry})` : ''} — owner: ${oc?.owner_name || 'unknown'}`)
      }
      ctx.push(`</admin_platform_businesses>`)
    }

    if (foreignOwner) {
      ctx.push(`<admin_viewing_as note="The ACTIVE business belongs to client ${foreignOwner}, not to the admin asking. Answer using that business's data below, exactly as that client's own assistant would — this is the admin previewing the client's experience. The client cannot see this conversation.">`)
      ctx.push(`</admin_viewing_as>`)
    }

    if (activeBusiness) {
      ctx.push(`<active_business>`)
      ctx.push(`Name: ${activeBusiness.business_name}`)
      if (activeBusiness.industry) ctx.push(`Industry: ${activeBusiness.industry}`)
      if (activeBusiness.business_phone) ctx.push(`Phone: ${activeBusiness.business_phone}`)
      if (activeBusiness.business_email) ctx.push(`Email: ${activeBusiness.business_email}`)
      if (activeBusiness.description) ctx.push(`Description: ${activeBusiness.description}`)
      ctx.push(`</active_business>`)

      if (automations.length > 0) {
        ctx.push(`<automations_for_active_business>`)
        for (const a of automations) {
          const status = a.active ? (a.last_status === 'error' ? 'ERROR' : 'running') : 'off'
          ctx.push(`- ${a.friendly_name} [${status}] — ${a.description || ''}`)
        }
        ctx.push(`</automations_for_active_business>`)
      } else {
        ctx.push(`<automations_for_active_business>None configured yet.</automations_for_active_business>`)
      }

      if (interactions.length > 0) {
        const flaggedFirst = [...interactions].sort((a, b) => Number(b.flagged) - Number(a.flagged))
        ctx.push(`<recent_activity_for_active_business>`)
        for (const i of flaggedFirst.slice(0, 10)) {
          const flag = i.flagged ? ` [FLAGGED: ${i.flag_reason || 'review'}]` : ''
          ctx.push(`- [${i.type}] ${i.summary}${flag}`)
        }
        ctx.push(`</recent_activity_for_active_business>`)
      } else {
        ctx.push(`<recent_activity_for_active_business>No activity yet.</recent_activity_for_active_business>`)
      }
    }

    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: SYSTEM_PROMPT_BASE, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: `Current portal context:\n${ctx.join('\n')}` },
    ]

    const anthropic = new Anthropic()
    const reply = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: systemBlocks,
      messages: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
    })

    const text = reply.content[0]?.type === 'text' ? reply.content[0].text : ''
    return NextResponse.json({ reply: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Chat failed'
    console.error('[portal/chat]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
