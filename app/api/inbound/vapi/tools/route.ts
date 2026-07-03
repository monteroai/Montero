import { NextResponse, type NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Single endpoint for ALL of Maya Inbound's function tool calls.
//
// Vapi sends payloads like:
//   { message: { type: 'tool-calls', toolCallList: [{ id, function: { name, arguments } }] } }
//
// We dispatch by function.name. Each handler returns a result string Vapi
// will speak back to the caller. We also write a portal_interactions row so
// the call shows up in the dashboard before the end-of-call report lands.

import type { SupabaseClient } from '@supabase/supabase-js'

type ToolArgs = Record<string, unknown>

function s(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t || undefined
}

function businessId(): string | undefined {
  return process.env.SDT_TEST_BUSINESS_ID
}

async function logInteraction(
  supabase: SupabaseClient,
  args: { type: 'call' | 'form'; summary: string; detail: string; raw: ToolArgs; flagged?: boolean; flagReason?: string },
) {
  const bid = businessId()
  if (!bid) return
  await supabase.from('portal_interactions').insert({
    business_id: bid,
    type: args.type,
    summary: args.summary,
    detail: args.detail,
    raw_data: args.raw,
    flagged: args.flagged ?? false,
    flag_reason: args.flagReason ?? null,
  })
}

// ─── Tool handlers ───────────────────────────────────────────────────────────

async function handleNewApplication(args: ToolArgs, supabase: SupabaseClient): Promise<string> {
  const name = s(args.name)
  const phone = s(args.phone)
  const email = s(args.email)
  const role = s(args.role) || s(args.position) || 'dental temp'
  const summary = `New temp application: ${name || 'unknown'} (${role})`
  const detail = [
    name ? `Name: ${name}` : null,
    phone ? `Phone: ${phone}` : null,
    email ? `Email: ${email}` : null,
    role ? `Role: ${role}` : null,
  ].filter(Boolean).join('\n')
  await logInteraction(supabase, { type: 'call', summary, detail, raw: args, flagged: true, flagReason: 'new_application' })
  return `Got it. We have ${name || 'your application'} on file as a ${role}. We'll reach out within one business day with next steps.`
}

async function handleTempRequestingWork(args: ToolArgs, supabase: SupabaseClient): Promise<string> {
  const name = s(args.name)
  const dates = s(args.dates) || s(args.availability)
  const location = s(args.location) || s(args.area)
  const summary = `Temp seeking work: ${name || 'unknown'}${dates ? ` for ${dates}` : ''}`
  const detail = [
    name ? `Name: ${name}` : null,
    dates ? `Available: ${dates}` : null,
    location ? `Area: ${location}` : null,
  ].filter(Boolean).join('\n')
  await logInteraction(supabase, { type: 'call', summary, detail, raw: args, flagged: true, flagReason: 'temp_request' })
  return `Perfect. We have you down${dates ? ` for ${dates}` : ''}${location ? ` in the ${location} area` : ''}. We'll text you the next open shift that matches.`
}

async function handleClinicRequestPro(args: ToolArgs, supabase: SupabaseClient): Promise<string> {
  const clinic = s(args.clinic_name) || s(args.clinic) || s(args.practice_name)
  const role = s(args.role_needed) || s(args.role) || 'dental temp'
  const dates = s(args.dates) || s(args.shift_dates)
  const contact = s(args.contact_name) || s(args.name)
  const summary = `Clinic request: ${clinic || 'unknown'} needs ${role}`
  const detail = [
    clinic ? `Clinic: ${clinic}` : null,
    contact ? `Contact: ${contact}` : null,
    role ? `Role needed: ${role}` : null,
    dates ? `Shifts: ${dates}` : null,
  ].filter(Boolean).join('\n')
  await logInteraction(supabase, { type: 'call', summary, detail, raw: args, flagged: true, flagReason: 'clinic_request' })
  return `Got it. We're searching for a ${role}${dates ? ` for ${dates}` : ''} and will follow up the same day with options.`
}

async function handleGeneralSupport(args: ToolArgs, supabase: SupabaseClient): Promise<string> {
  const topic = s(args.topic) || s(args.question) || s(args.message)
  const name = s(args.name)
  const summary = `Support: ${topic ? topic.slice(0, 80) : 'general inquiry'}`
  const detail = [
    name ? `From: ${name}` : null,
    topic ? `\n${topic}` : null,
  ].filter(Boolean).join('\n')
  await logInteraction(supabase, { type: 'call', summary, detail, raw: args, flagged: true, flagReason: 'general_support' })
  return `Thanks for letting us know. Someone from our team will follow up shortly.`
}

const HANDLERS: Record<string, (args: ToolArgs, sb: SupabaseClient) => Promise<string>> = {
  new_application: handleNewApplication,
  temp_requesting_work: handleTempRequestingWork,
  Clinic_request_pro: handleClinicRequestPro,
  clinic_request_pro: handleClinicRequestPro,
  general_support: handleGeneralSupport,
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = body.message as Record<string, unknown> | undefined
  const toolCallList = (message?.toolCallList as Array<Record<string, unknown>>) || []
  if (!toolCallList.length) {
    return NextResponse.json({ error: 'No toolCallList' }, { status: 400 })
  }

  const supabase = adminClient()
  const results: Array<{ toolCallId: string; result: string }> = []

  for (const call of toolCallList) {
    const fn = call.function as { name?: string; arguments?: ToolArgs | string } | undefined
    const name = fn?.name || ''
    let args: ToolArgs = {}
    if (fn?.arguments) {
      if (typeof fn.arguments === 'string') {
        try { args = JSON.parse(fn.arguments) } catch { args = { raw: fn.arguments } }
      } else {
        args = fn.arguments
      }
    }

    const handler = HANDLERS[name]
    let result: string
    if (handler) {
      try {
        result = await handler(args, supabase)
      } catch (e) {
        console.error(`[vapi/tools] ${name} failed:`, e)
        result = `Sorry, something went wrong on our end. We'll have a person follow up.`
      }
    } else {
      console.warn(`[vapi/tools] unknown function: ${name}`)
      result = `Noted. We'll have someone follow up.`
    }

    results.push({ toolCallId: call.id as string, result })
  }

  return NextResponse.json({ results })
}
