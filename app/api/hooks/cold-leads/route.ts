import { NextResponse, type NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Cold-lead feed for client n8n follow-up workflows (secret-authed, same
// header as email-log). A lead is "cold" when its new_lead flag is older than
// `hours` (default 48) and nobody has nudged it yet.
//
//   GET  /api/hooks/cold-leads?business_id=xxx&hours=48   → { leads: [...] }
//   POST /api/hooks/cold-leads { business_id, interaction_ids: [] }
//        → marks them nudged (flag_reason new_lead_nudged) so the next run
//          doesn't repeat them. Flag stays on — the lead still needs attention.

function authorized(req: NextRequest): boolean {
  const secret = process.env.EMAIL_LOG_SECRET
  return Boolean(secret && req.headers.get('x-email-log-secret') === secret)
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const businessId = url.searchParams.get('business_id')
  const hours = Math.max(1, parseInt(url.searchParams.get('hours') || '48'))
  if (!businessId) return NextResponse.json({ error: 'business_id required' }, { status: 400 })

  const cutoff = new Date(Date.now() - hours * 3600 * 1000).toISOString()
  const { data, error } = await adminClient()
    .from('portal_interactions')
    .select('id, summary, detail, created_at')
    .eq('business_id', businessId)
    .eq('flagged', true)
    .eq('flag_reason', 'new_lead')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const leads = (data || []).map(l => ({
    id: l.id,
    summary: l.summary,
    detail: l.detail,
    age_hours: Math.round((Date.now() - new Date(l.created_at).getTime()) / 3600000),
  }))
  return NextResponse.json({ count: leads.length, leads })
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { business_id?: string; interaction_ids?: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.business_id || !Array.isArray(body.interaction_ids) || body.interaction_ids.length === 0) {
    return NextResponse.json({ error: 'business_id and interaction_ids required' }, { status: 400 })
  }
  const { error } = await adminClient()
    .from('portal_interactions')
    .update({ flag_reason: 'new_lead_nudged' })
    .eq('business_id', body.business_id)
    .in('id', body.interaction_ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, marked: body.interaction_ids.length })
}
