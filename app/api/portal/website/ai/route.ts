import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, isAdminEnvConfigured } from '@/lib/supabase/admin'

// Site Studio AI — rewrite a website section from a plain-language instruction.
//
// POST { business_id, section, instruction } → { proposed: { text }, summary, usage }
// GET  ?business_id=xxx                      → { usage: { used, limit, exempt } }
//
// Usage is metered per client per calendar month in portal_ai_edits
// (scripts/site_studio_ai.sql). Clients with portal_clients.billing_exempt
// (Janeth) are unlimited. If the metering table hasn't been created yet the
// feature still works — it just doesn't enforce the cap (beta behavior).

const DEFAULT_MONTHLY_LIMIT = 30

async function getUsage(clientId: string): Promise<{ used: number; metered: boolean }> {
  if (!isAdminEnvConfigured()) return { used: 0, metered: false }
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const { count, error } = await adminClient()
    .from('portal_ai_edits')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .gte('created_at', monthStart.toISOString())
  if (error) return { used: 0, metered: false } // table not created yet — don't block the feature
  return { used: count || 0, metered: true }
}

async function resolveCaller(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  // RLS scopes both queries to the signed-in user
  const [{ data: client }, { data: business }] = await Promise.all([
    supabase.from('portal_clients').select('*').eq('user_id', user.id).single(),
    supabase.from('portal_businesses').select('id, business_name, industry, description').eq('id', businessId).single(),
  ])
  if (!client || !business) {
    return { error: NextResponse.json({ error: 'Business not found' }, { status: 404 }) }
  }
  const exempt = (client as Record<string, unknown>).billing_exempt === true
  return { supabase, user, client, business, exempt }
}

export async function GET(request: NextRequest) {
  const businessId = new URL(request.url).searchParams.get('business_id')
  if (!businessId) return NextResponse.json({ error: 'business_id required' }, { status: 400 })
  const caller = await resolveCaller(businessId)
  if ('error' in caller) return caller.error
  const { used } = await getUsage(caller.client.id)
  return NextResponse.json({ usage: { used, limit: DEFAULT_MONTHLY_LIMIT, exempt: caller.exempt } })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business_id, section, instruction } = body as {
      business_id?: string
      section?: string
      instruction?: string
    }
    if (!business_id || !section || !instruction?.trim()) {
      return NextResponse.json({ error: 'business_id, section, and instruction required' }, { status: 400 })
    }

    const caller = await resolveCaller(business_id)
    if ('error' in caller) return caller.error
    const { supabase, client, business, exempt } = caller

    const { used, metered } = await getUsage(client.id)
    if (!exempt && metered && used >= DEFAULT_MONTHLY_LIMIT) {
      return NextResponse.json({
        error: `You've used all ${DEFAULT_MONTHLY_LIMIT} AI edits this month. Use the Talk to Emilio button to add more.`,
        usage: { used, limit: DEFAULT_MONTHLY_LIMIT, exempt },
      }, { status: 402 })
    }

    const { data: current } = await supabase
      .from('portal_website_content')
      .select('content')
      .eq('business_id', business_id)
      .eq('section', section)
      .maybeSingle()
    const currentText = (current?.content as Record<string, unknown> | null)?.text as string | undefined

    const anthropic = new Anthropic()
    const reply = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: [
        'You are the copy editor behind Montero Site Studio, which lets small-business owners edit sections of their own website with plain-language requests.',
        'Rewrite the given section according to the instruction. Preserve facts (names, phone numbers, addresses, prices, hours) unless the instruction changes them. Match the business\'s voice. Return publish-ready content — no placeholders, no notes to the client inside the content.',
        'Length guidance: hero = a headline plus one or two lines; about = one or two short paragraphs; services/testimonials/contact = concise; footer = minimal.',
        'Respond with ONLY a JSON object, no code fences, in this exact shape:',
        '{"text": "<the full rewritten section content>", "summary": "<one sentence, addressed to the client, describing what changed and why>"}',
      ].join('\n'),
      messages: [{
        role: 'user',
        content: [
          `Business: ${business.business_name}${business.industry ? ` (${business.industry})` : ''}`,
          business.description ? `About the business: ${business.description}` : null,
          `Website section: ${section}`,
          `Current content:\n${currentText || '(empty — write it from scratch)'}`,
          `Client's instruction: ${instruction}`,
        ].filter(Boolean).join('\n\n'),
      }],
    })

    if (reply.stop_reason === 'refusal') {
      return NextResponse.json({ error: "That request can't be completed. Try rephrasing your instruction." }, { status: 422 })
    }

    const raw = reply.content[0]?.type === 'text' ? reply.content[0].text : ''
    let proposed: { text?: string; summary?: string } = {}
    try {
      // Tolerate accidental code fences or leading prose around the JSON
      const jsonStart = raw.indexOf('{')
      const jsonEnd = raw.lastIndexOf('}')
      proposed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
    } catch {
      return NextResponse.json({ error: 'The AI editor returned an unreadable result. Try again.' }, { status: 502 })
    }
    if (!proposed.text) {
      return NextResponse.json({ error: 'The AI editor returned an empty result. Try again.' }, { status: 502 })
    }

    // Meter the edit (service role; ignore failure if the table doesn't exist yet)
    if (isAdminEnvConfigured()) {
      await adminClient().from('portal_ai_edits').insert({
        client_id: client.id,
        business_id,
        section,
        instruction: instruction.slice(0, 1000),
        input_tokens: reply.usage?.input_tokens || 0,
        output_tokens: reply.usage?.output_tokens || 0,
      }).then(() => undefined, () => undefined)
    }

    return NextResponse.json({
      proposed: { text: proposed.text },
      summary: proposed.summary || '',
      usage: { used: exempt ? used : used + 1, limit: DEFAULT_MONTHLY_LIMIT, exempt },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI edit failed'
    console.error('[portal/website/ai]', msg)
    return NextResponse.json({ error: 'The AI editor hit an error. Try again.' }, { status: 500 })
  }
}
