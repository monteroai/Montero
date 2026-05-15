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

  // TODO: send email to ai@montero.cool via Resend once that's wired up.
  return NextResponse.json({ ok: true })
}
