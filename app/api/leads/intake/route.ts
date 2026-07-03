import { NextResponse, type NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/portal/email'

// Public webhook for lead-form submissions from client sites.
//
// Today only the Smile Consulting site posts here. As new client sites come
// online, add their source_form → business_id mapping in FORM_TO_BUSINESS,
// and add the origin to ALLOWED_ORIGINS so CORS lets the browser through.

const FORM_TO_BUSINESS: Record<string, string | undefined> = {
  'consulting-intake': process.env.CONSULTING_BUSINESS_ID,
}

const ALLOWED_ORIGINS = new Set<string>([
  'https://smileconsultingplaceholder.netlify.app',
])

type LeadFields = {
  business_id?: string
  name?: string
  email?: string
  phone?: string
  practice?: string
  service?: string
  message?: string
  source_form?: string
  honeypot?: string
}

function pickFields(body: Record<string, unknown>): LeadFields {
  // Netlify Forms notification shape (left in for future flexibility):
  // { form_name, data: {...fields} }
  if (typeof body.form_name === 'string' && body.data && typeof body.data === 'object') {
    const d = body.data as Record<string, unknown>
    return {
      business_id: FORM_TO_BUSINESS[body.form_name],
      name: str(d.name),
      email: str(d.email),
      phone: str(d.phone),
      practice: str(d.practice),
      service: str(d.service),
      message: str(d.message),
      source_form: body.form_name,
      honeypot: str(d['bot-field']),
    }
  }

  // Direct browser POST: trust source_form (mapped to business_id server-side)
  // NOT client-supplied business_id.
  const form = str(body.source_form)
  return {
    business_id: form ? FORM_TO_BUSINESS[form] : undefined,
    name: str(body.name),
    email: str(body.email),
    phone: str(body.phone),
    practice: str(body.practice),
    service: str(body.service),
    message: str(body.message),
    source_form: form,
    honeypot: str(body['bot-field']),
  }
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t || undefined
}

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}

async function sendTwilioSMS(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return { ok: false, error: 'Twilio env not configured' }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const auth = Buffer.from(`${sid}:${token}`).toString('base64')
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    if (!r.ok) {
      const text = await r.text()
      return { ok: false, error: `Twilio ${r.status}: ${text.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers })
  }

  const fields = pickFields(body)

  // Honeypot — silently accept-and-drop if the bot field has a value.
  if (fields.honeypot) {
    return NextResponse.json({ success: true }, { status: 200, headers })
  }

  if (!fields.business_id) {
    return NextResponse.json(
      { error: 'Unknown source_form (no business mapping). Set CONSULTING_BUSINESS_ID + include source_form in the body.' },
      { status: 400, headers },
    )
  }

  if (!fields.name && !fields.email && !fields.message) {
    return NextResponse.json({ error: 'Empty submission' }, { status: 400, headers })
  }

  const supabase = adminClient()

  const summary = `${fields.name || 'Unknown'}${fields.practice ? ` (${fields.practice})` : ''}${fields.service ? ` — ${fields.service}` : ''}`
  const detail = [
    fields.email ? `Email: ${fields.email}` : null,
    fields.phone ? `Phone: ${fields.phone}` : null,
    fields.practice ? `Practice: ${fields.practice}` : null,
    fields.service ? `Looking for: ${fields.service}` : null,
    fields.message ? `\n${fields.message}` : null,
  ].filter(Boolean).join('\n')

  const { data: interaction, error: insertErr } = await supabase
    .from('portal_interactions')
    .insert({
      business_id: fields.business_id,
      type: 'form',
      summary,
      detail,
      raw_data: { ...fields, source_form: fields.source_form },
      flagged: true,
      flag_reason: 'new_lead',
    })
    .select()
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500, headers })
  }

  // Fire SMS but don't fail the webhook if SMS errors — the lead is captured.
  const notifyTo = process.env.JANETH_NOTIFY_PHONE
  let smsResult: { ok: boolean; error?: string } | null = null
  if (notifyTo) {
    const preview = fields.message
      ? ` "${fields.message.slice(0, 90)}${fields.message.length > 90 ? '…' : ''}"`
      : ''
    const smsBody = `[Smile Consulting] New lead: ${fields.name || 'No name'}${fields.email ? ` · ${fields.email}` : ''}${fields.phone ? ` · ${fields.phone}` : ''}${preview}`
    smsResult = await sendTwilioSMS(notifyTo, smsBody)
    if (!smsResult.ok) console.error('[leads/intake] SMS failed:', smsResult.error)
  }

  // Auto-reply to the lead via Resend — best-effort, doesn't fail the webhook.
  let emailResult: { ok: boolean; error?: string } | null = null
  if (fields.email) {
    const firstName = (fields.name || '').split(' ')[0] || 'there'
    const calendly = process.env.JANETH_CALENDLY_URL || 'https://smileconsultingplaceholder.netlify.app#contact'
    const text = `Hi ${firstName},\n\nThanks for reaching out to Smile Management & Consulting. We received your message and Janeth will follow up personally — usually within one business day.\n\nIf you want to skip the back-and-forth, grab a 30-minute slot directly on her calendar:\n${calendly}\n\nTalk soon,\nThe Smile Consulting Team`
    emailResult = await sendEmail({
      to: fields.email,
      subject: 'We got your message — Smile Management & Consulting',
      text,
      from: process.env.RESEND_FROM_EMAIL || 'Smile Consulting <onboarding@resend.dev>',
      replyTo: 'smilemanagementconsultings@gmail.com',
    })
    if (!emailResult.ok) console.error('[leads/intake] Email failed:', emailResult.error)
  }

  return NextResponse.json(
    {
      success: true,
      interaction_id: interaction.id,
      sms: smsResult ? (smsResult.ok ? 'sent' : `failed: ${smsResult.error}`) : 'skipped',
      email: emailResult ? (emailResult.ok ? 'sent' : `failed: ${emailResult.error}`) : 'skipped',
    },
    { status: 200, headers },
  )
}
