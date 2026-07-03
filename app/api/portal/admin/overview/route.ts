import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, isAdminEnvConfigured } from '@/lib/supabase/admin'

// GET /api/portal/admin/overview
// Admin-only god-mode view: every client + every business + their automations,
// recent activity across the whole system, system health.
//
// Returns 403 if the calling user isn't is_admin in portal_clients.

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await supabase
    .from('portal_clients')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!me?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!isAdminEnvConfigured()) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing on server' }, { status: 500 })
  }
  const admin = adminClient()

  // Pull everything in parallel
  const [clientsRes, businessesRes, automationsRes, recentRes] = await Promise.all([
    admin
      .from('portal_clients')
      .select('id, owner_name, primary_email, primary_phone, is_admin, onboarding_complete, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('portal_businesses')
      .select('id, client_id, business_name, industry, business_phone, business_email, website_url, brand_logo_url, is_archived, created_at')
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
    admin
      .from('portal_automations')
      .select('id, client_id, business_id, friendly_name, description, category, active, last_run, last_status, sort_order')
      .order('business_id', { ascending: true })
      .order('sort_order', { ascending: true }),
    admin
      .from('portal_interactions')
      .select('id, business_id, type, summary, detail, flagged, flag_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (clientsRes.error) return NextResponse.json({ error: clientsRes.error.message }, { status: 500 })

  const clients = clientsRes.data || []
  const businesses = businessesRes.data || []
  const automations = automationsRes.data || []
  const recent = recentRes.data || []

  const businessById = new Map(businesses.map(b => [b.id, b]))
  const clientById = new Map(clients.map(c => [c.id, c]))

  // 24h interactions count + errors
  const day = Date.now() - 24 * 60 * 60 * 1000
  const recent24h = recent.filter(r => new Date(r.created_at).getTime() >= day)
  const flagged24h = recent24h.filter(r => r.flagged).length

  // Per-business rollup
  const businessesEnriched = businesses.map(b => {
    const biz_automations = automations.filter(a => a.business_id === b.id)
    const biz_recent = recent.filter(r => r.business_id === b.id)
    const last_interaction = biz_recent[0]
    return {
      ...b,
      automation_count: biz_automations.length,
      automations_active: biz_automations.filter(a => a.active).length,
      automations_error: biz_automations.filter(a => a.last_status === 'error').length,
      interactions_24h: biz_recent.filter(r => new Date(r.created_at).getTime() >= day).length,
      flagged_24h: biz_recent.filter(r => r.flagged && new Date(r.created_at).getTime() >= day).length,
      last_interaction_at: last_interaction?.created_at || null,
      automations: biz_automations,
    }
  })

  // Per-client rollup with their businesses
  const clientsEnriched = clients.map(c => ({
    ...c,
    businesses: businessesEnriched.filter(b => b.client_id === c.id),
  }))

  // Recent activity decorated with client/business labels
  const recentDecorated = recent.slice(0, 30).map(r => {
    const b = businessById.get(r.business_id)
    const c = b ? clientById.get(b.client_id) : null
    return {
      ...r,
      business_name: b?.business_name || 'Unknown business',
      client_name: c?.owner_name || 'Unknown client',
    }
  })

  return NextResponse.json({
    totals: {
      clients: clients.length,
      businesses: businesses.length,
      automations_total: automations.length,
      automations_active: automations.filter(a => a.active).length,
      automations_error: automations.filter(a => a.last_status === 'error').length,
      interactions_24h: recent24h.length,
      flagged_24h: flagged24h,
    },
    clients: clientsEnriched,
    recent: recentDecorated,
    system_env: {
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
      twilio_from: process.env.TWILIO_FROM_NUMBER || null,
      resend: Boolean(process.env.RESEND_API_KEY),
      vapi: Boolean(process.env.VAPI_API_KEY),
      higgsfield: Boolean(process.env.HIGGSFIELD_API_KEY_ID),
      n8n_central: process.env.N8N_BASE_URL || null,
      sdt_test_business_id: process.env.SDT_TEST_BUSINESS_ID || null,
      consulting_business_id: process.env.CONSULTING_BUSINESS_ID || null,
      janeth_notify_phone: process.env.JANETH_NOTIFY_PHONE ? 'set' : null,
    },
  })
}
