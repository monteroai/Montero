// POST /api/portal/chat/escalate
//   Body: { messages: ChatMessage[], active_business_id?: string, note?: string }
//
// Client-triggered escalation. Records the conversation as a flagged
// portal_interactions row so Emilio sees it under Activity (filter: flagged).
// In a future iteration this will also email ai@montero.cool via Resend —
// for now the dashboard's flagged-activity view is the system of record.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Default "from" is Resend's shared testing domain — works without domain
// verification. Once Montero has DNS set up for a real sender like
// "ai@montero.cool", swap RESEND_FROM_EMAIL in Netlify env vars.
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'Montero <onboarding@resend.dev>'
const ESCALATION_RECIPIENT = process.env.ESCALATION_EMAIL || 'ai@montero.cool'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://montero.cool'

async function sendEscalationEmail(args: {
  clientName: string
  clientEmail: string | null
  businessName: string | null
  lastMessage: string
  conversation: ChatMessage[]
  noteFromClient: string | null
}): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: 'RESEND_API_KEY not set' }

  // Escape minimal HTML for safety — messages are user-provided
  const esc = (s: string) => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

  const conversationHtml = args.conversation.map(m => `
    <div style="margin: 14px 0; padding: 12px 14px; border-radius: 10px; background: ${m.role === 'user' ? '#eef4ff' : '#f8fafc'};">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
        ${m.role === 'user' ? esc(args.clientName) : 'Montero Assistant'}
      </div>
      <div style="font-size: 14px; color: #1e293b; white-space: pre-wrap;">${esc(m.content)}</div>
    </div>
  `).join('')

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B2B5E; font-size: 20px; margin: 0 0 4px;">New escalation from a client</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">Sent via the portal's chat bubble — Talk to Emilio button.</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 100px;">From</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;"><strong>${esc(args.clientName)}</strong> ${args.clientEmail ? `&lt;${esc(args.clientEmail)}&gt;` : ''}</td></tr>
        ${args.businessName ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Business</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${esc(args.businessName)}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Last said</td><td style="padding: 6px 0; font-size: 14px; color: #1e293b;">"${esc(args.lastMessage)}"</td></tr>
      </table>

      ${args.noteFromClient ? `<p style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 14px; margin: 20px 0; font-size: 14px; color: #1e293b;"><strong>Note from client:</strong> ${esc(args.noteFromClient)}</p>` : ''}

      <h3 style="color: #1B2B5E; font-size: 15px; margin: 24px 0 8px;">Full conversation</h3>
      ${conversationHtml}

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 13px; color: #64748b;">
        <a href="${SITE_URL}/portal/activity?filter=flagged" style="color: #2563eb; text-decoration: none; font-weight: 600;">View in admin dashboard →</a>
      </p>
    </div>
  `

  const subject = `[Montero] ${args.clientName}: ${args.lastMessage.slice(0, 60)}${args.lastMessage.length > 60 ? '…' : ''}`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [ESCALATION_RECIPIENT],
        subject,
        html,
        reply_to: args.clientEmail || undefined,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown')
      console.error('[escalate] Resend failed:', res.status, body)
      return { sent: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` }
    }
    return { sent: true }
  } catch (e) {
    console.error('[escalate] Resend network error:', e)
    return { sent: false, reason: (e as Error).message }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { messages?: ChatMessage[]; active_business_id?: string; note?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const messages = Array.isArray(body.messages) ? body.messages : []
  const note = (body.note || '').trim()
  if (messages.length === 0 && !note) {
    return NextResponse.json({ error: 'Nothing to escalate — write a message first.' }, { status: 400 })
  }

  // Find the client + business this came from
  const { data: client } = await supabase
    .from('portal_clients')
    .select('id, owner_name, primary_email')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!client) return NextResponse.json({ error: 'No client account' }, { status: 404 })

  let businessId = body.active_business_id
  if (!businessId) {
    const { data: b } = await supabase
      .from('portal_businesses')
      .select('id')
      .eq('client_id', client.id)
      .eq('is_archived', false)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    businessId = b?.id
  }

  // Build the summary line + full conversation detail
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || note
  const summary = `Help request from ${client.owner_name || client.primary_email || 'client'}: ${lastUserMsg.slice(0, 140)}${lastUserMsg.length > 140 ? '…' : ''}`
  const detail = [
    note ? `Note: ${note}\n` : '',
    'Conversation:',
    ...messages.map(m => `[${m.role}] ${m.content}`),
  ].filter(Boolean).join('\n')

  // We need to insert into portal_interactions — RLS only allows reads for the
  // owner, inserts via "true" check (intended for service-role webhooks). Use
  // admin client so the insert always lands even if RLS policies are tightened.
  let admin
  try {
    admin = adminClient()
  } catch {
    // Service-role not configured — fall back to user session insert. The RLS
    // policy on portal_interactions allows INSERT with check (true) so this
    // usually still works; if not, surface a clear error.
    admin = supabase
  }

  const { error } = await admin.from('portal_interactions').insert({
    client_id: client.id,  // legacy column, kept populated until we drop it
    business_id: businessId,
    type: 'chat',
    summary,
    detail,
    flagged: true,
    flag_reason: 'client_escalation',
    raw_data: { client_id: client.id, user_email: user.email, messages },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Best-effort email notification — never blocks the response. The DB row is
  // the source of truth; email is a notification on top.
  //
  // We respect admin preferences: if the admin recipient has unchecked
  // Settings → Notifications → Flagged Issues, skip the email but still log
  // the row in portal_interactions. (Find recipient + check pref via service
  // role so it works even before RLS admin policies are set up.)
  const businessName = businessId ? await fetchBusinessName(supabase, businessId) : null

  let emailResult: { sent: boolean; reason?: string } = { sent: false, reason: 'skipped' }
  try {
    const a = adminClient()
    const { data: adminRow } = await a
      .from('portal_clients')
      .select('user_id, onboarding_data')
      .eq('is_admin', true)
      .limit(1)
      .maybeSingle()
    const adminPrefs = (adminRow?.onboarding_data as Record<string, unknown> | null)?.notification_prefs as Record<string, unknown> | undefined
    // Default to ON if the pref hasn't been set yet
    const flaggedIssuesEnabled = adminPrefs?.flagged_issues !== false

    if (!flaggedIssuesEnabled) {
      emailResult = { sent: false, reason: 'admin disabled Flagged Issues notifications' }
    } else {
      emailResult = await sendEscalationEmail({
        clientName: client.owner_name || client.primary_email || user.email || 'Client',
        clientEmail: client.primary_email || user.email || null,
        businessName,
        lastMessage: lastUserMsg,
        conversation: messages,
        noteFromClient: note || null,
      })
    }
  } catch (e) {
    console.error('[escalate] notification pipeline error:', (e as Error).message)
    emailResult = { sent: false, reason: 'pipeline error' }
  }

  return NextResponse.json({ ok: true, email_sent: emailResult.sent, email_reason: emailResult.reason })
}

async function fetchBusinessName(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string): Promise<string | null> {
  const { data } = await supabase.from('portal_businesses').select('business_name').eq('id', businessId).maybeSingle()
  return data?.business_name || null
}
