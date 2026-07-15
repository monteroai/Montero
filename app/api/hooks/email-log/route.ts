import { NextResponse, type NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// POST /api/hooks/email-log — write-only logging hook for system-sent emails.
//
// Called by client n8n workflows right after they send an email, so every
// outgoing (and later, incoming) message shows up in the portal Activity feed
// for both the client and the admin. Auth is a shared secret header; the
// secret only allows *inserting an email log row* — it can read nothing.
//
//   headers: x-email-log-secret: <EMAIL_LOG_SECRET>
//   body: {
//     business_id: string          // portal_businesses.id
//     direction: 'out' | 'in'
//     to: string
//     from?: string
//     subject: string
//     html?: string                // full rendered body, shown in preview UI
//     text?: string
//     source?: string              // e.g. 'n8n:SMC - Consulting Intake'
//     lead_name?: string
//   }

export async function POST(request: NextRequest) {
  const secret = process.env.EMAIL_LOG_SECRET
  if (!secret || request.headers.get('x-email-log-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const business_id = str(body.business_id)
  const direction = body.direction === 'in' ? 'in' : 'out'
  const to = str(body.to)
  const subject = str(body.subject)
  if (!business_id || !to || !subject) {
    return NextResponse.json({ error: 'business_id, to, and subject are required' }, { status: 400 })
  }

  const supabase = adminClient()

  // Confirm the business exists so a bad/stale id can't create orphan rows.
  const { data: biz } = await supabase
    .from('portal_businesses')
    .select('id')
    .eq('id', business_id)
    .maybeSingle()
  if (!biz) return NextResponse.json({ error: 'Unknown business_id' }, { status: 400 })

  const from = str(body.from)
  const lead_name = str(body.lead_name)
  const summary = direction === 'in'
    ? `Email received: ${subject}`
    : `Email sent to ${to}: ${subject}`
  const detail = [
    `Direction: ${direction === 'in' ? 'Received' : 'Sent'}`,
    from ? `From: ${from}` : null,
    `To: ${to}`,
    `Subject: ${subject}`,
    lead_name ? `Lead: ${lead_name}` : null,
    body.source ? `Via: ${str(body.source)}` : null,
  ].filter(Boolean).join('\n')

  const { data: row, error } = await supabase
    .from('portal_interactions')
    .insert({
      business_id,
      type: 'email',
      summary,
      detail,
      raw_data: {
        direction,
        to,
        from: from || null,
        subject,
        html: str(body.html) || null,
        text: str(body.text) || null,
        source: str(body.source) || null,
        lead_name: lead_name || null,
      },
      flagged: direction === 'in',
      flag_reason: direction === 'in' ? 'reply_received' : null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, interaction_id: row.id })
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t || undefined
}
