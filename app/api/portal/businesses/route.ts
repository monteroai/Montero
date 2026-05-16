import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/portal/businesses → list businesses
//   - Regular users: only their own businesses
//   - Admins: every business across every client (with owner_name attached so
//     the header switcher can group/label them by client)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('portal_clients')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  // Admin path — read every business + owner name via the join.
  // RLS admin_portal_businesses_select_all permits this.
  if (caller?.is_admin) {
    const { data: businesses, error } = await supabase
      .from('portal_businesses')
      .select('*, portal_clients!inner(id, owner_name, primary_email, is_admin)')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Flatten the join so the existing PortalBusiness shape gets `owner_name` etc.
    const flattened = (businesses || []).map(b => {
      const pc = (b as Record<string, unknown>).portal_clients as { owner_name?: string; primary_email?: string } | undefined
      const { portal_clients: _drop, ...rest } = b as Record<string, unknown>
      return {
        ...rest,
        _client_owner_name: pc?.owner_name || null,
        _client_email: pc?.primary_email || null,
      }
    })
    return NextResponse.json({ businesses: flattened, _admin_view: true })
  }

  // Regular user path
  if (!caller) return NextResponse.json({ businesses: [] })
  const { data: businesses, error } = await supabase
    .from('portal_businesses')
    .select('*')
    .eq('client_id', caller.id)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ businesses: businesses || [] })
}

// POST /api/portal/businesses → create a new business under this account
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    business_name,
    industry,
    business_phone,
    business_email,
    website_url,
    description,
    brand_colors,
    brand_logo_url,
  } = body

  if (!business_name || typeof business_name !== 'string') {
    return NextResponse.json({ error: 'business_name is required' }, { status: 400 })
  }

  // Get or create client row for this user
  let { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    const { data: created, error } = await supabase
      .from('portal_clients')
      .insert({
        user_id: user.id,
        owner_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Owner',
        primary_email: user.email,
      })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    client = created
  }

  // Determine sort_order = max + 1
  const { data: existing } = await supabase
    .from('portal_businesses')
    .select('sort_order')
    .eq('client_id', client.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSort = (existing?.[0]?.sort_order ?? -1) + 1

  const { data: created, error } = await supabase
    .from('portal_businesses')
    .insert({
      client_id: client.id,
      business_name,
      industry: industry || null,
      business_phone: business_phone || null,
      business_email: business_email || null,
      website_url: website_url || null,
      description: description || null,
      brand_colors: brand_colors || {},
      brand_logo_url: brand_logo_url || null,
      sort_order: nextSort,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ business: created })
}

// PATCH /api/portal/businesses?id=xxx → update a business
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('id')
  if (!businessId) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const body = await req.json()
  const allowed = [
    'business_name', 'industry', 'business_phone', 'business_email',
    'website_url', 'description', 'brand_colors', 'brand_logo_url',
    'brand_extracted', 'sort_order',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) {
    if (k in body) updates[k] = body[k]
  }

  // RLS will block updates to businesses the user doesn't own
  const { data, error } = await supabase
    .from('portal_businesses')
    .update(updates)
    .eq('id', businessId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ business: data })
}

// DELETE /api/portal/businesses?id=xxx → soft-archive (NOT hard delete; safer)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('id')
  if (!businessId) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('portal_businesses')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', businessId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
