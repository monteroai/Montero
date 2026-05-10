import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/portal/businesses → list all businesses for the signed-in user's account
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find or auto-create the client row
  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ businesses: [] })
  }

  const { data: businesses, error } = await supabase
    .from('portal_businesses')
    .select('*')
    .eq('client_id', client.id)
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
