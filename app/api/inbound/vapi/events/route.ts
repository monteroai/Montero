import { NextResponse, type NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Vapi server-message webhook. Receives end-of-call reports, transcripts, and
// other lifecycle events for any assistant whose serverUrl points here.
//
// Vapi posts payloads in the shape:
//   { message: { type: 'end-of-call-report' | 'status-update' | 'transcript' | ...,
//                call: {...}, assistant: {...}, phoneNumber: {...}, ... } }
//
// For end-of-call-report we write a single portal_interactions row of type='call'.
// Other event types are accepted (200 OK) so Vapi doesn't retry, but ignored.

// Map a Vapi phone number → business_id. Add a row per new client number.
const NUMBER_TO_BUSINESS: Record<string, string | undefined> = {
  '+18557657345': process.env.SDT_TEST_BUSINESS_ID, // Emilio's test SDT for now
}

function pickBusinessId(message: Record<string, unknown>): string | undefined {
  const phone = (message.phoneNumber as Record<string, unknown> | undefined)?.number as string | undefined
  if (phone && NUMBER_TO_BUSINESS[phone]) return NUMBER_TO_BUSINESS[phone]
  return process.env.SDT_TEST_BUSINESS_ID
}

function summarize(call: Record<string, unknown>, transcript?: string): string {
  const summary = call.summary as string | undefined
  if (summary) return summary
  if (transcript) {
    const firstUser = transcript.split('\n').find(l => l.toLowerCase().startsWith('user:'))
    if (firstUser) return firstUser.replace(/^user:\s*/i, '').slice(0, 200)
  }
  const customer = (call.customer as Record<string, unknown> | undefined)?.number as string | undefined
  return `Call from ${customer || 'unknown'}`
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = body.message as Record<string, unknown> | undefined
  if (!message) return NextResponse.json({ ok: true, ignored: 'no message' })

  const type = message.type as string
  if (type !== 'end-of-call-report') {
    return NextResponse.json({ ok: true, ignored: type })
  }

  const businessId = pickBusinessId(message)
  if (!businessId) {
    console.error('[vapi/events] no business_id mapping for call')
    return NextResponse.json({ ok: true, ignored: 'no business mapping' })
  }

  const call = (message.call as Record<string, unknown>) || {}
  const transcript = message.transcript as string | undefined
  const endedReason = call.endedReason as string | undefined
  const recordingUrl = call.recordingUrl as string | undefined
  const customer = (call.customer as Record<string, unknown> | undefined)?.number as string | undefined
  const startedAt = call.startedAt as string | undefined
  const endedAt = call.endedAt as string | undefined
  const durationSec = (startedAt && endedAt)
    ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    : null

  const summary = summarize(call, transcript)

  const detailLines = [
    customer ? `From: ${customer}` : null,
    durationSec !== null ? `Duration: ${durationSec}s` : null,
    endedReason ? `Ended: ${endedReason}` : null,
    recordingUrl ? `Recording: ${recordingUrl}` : null,
    transcript ? `\n--- Transcript ---\n${transcript}` : null,
  ].filter(Boolean)
  const detail = detailLines.join('\n')

  const shortCalls = ['customer-ended-call', 'customer-busy', 'voicemail']
  const flagged = (durationSec !== null && durationSec < 15) || (endedReason ? shortCalls.includes(endedReason) : false)

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('portal_interactions')
    .insert({
      business_id: businessId,
      type: 'call',
      summary,
      detail,
      raw_data: { call, transcript, endedReason, recordingUrl, durationSec, vapi_call_id: call.id },
      flagged,
      flag_reason: flagged ? 'short_call' : null,
    })
    .select()
    .single()

  if (error) {
    console.error('[vapi/events] insert failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, interaction_id: data.id })
}
