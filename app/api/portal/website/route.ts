import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// Admins operate across every client's businesses; the admin RLS policies
// were never applied in prod, so admin reads/writes go through the service
// role after an is_admin check. Regular users stay on their RLS-scoped client.
async function dbFor(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: caller } = await supabase
    .from('portal_clients')
    .select('id, is_admin')
    .eq('user_id', userId)
    .maybeSingle()
  return caller?.is_admin ? adminClient() : supabase
}

// GET /api/portal/website?business_id=xxx → website sections + change requests for a business
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const businessId = url.searchParams.get('business_id')
  if (!businessId) return NextResponse.json({ sections: [], change_requests: [] })

  const db = await dbFor(supabase, user.id)
  const [{ data: sections }, { data: changeRequests }] = await Promise.all([
    db.from('portal_website_content').select('*').eq('business_id', businessId).order('section'),
    db.from('portal_change_requests').select('*').eq('business_id', businessId).order('requested_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    sections: sections || [],
    change_requests: changeRequests || [],
  })
}

// POST /api/portal/website → submit a content change request for a business section
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { business_id, section, new_content } = body as {
    business_id: string
    section: string
    new_content: Record<string, unknown>
  }

  if (!business_id || !section || !new_content) {
    return NextResponse.json({ error: 'business_id, section, and new_content required' }, { status: 400 })
  }

  // RLS blocks non-owners; admins go through the service role
  const db = await dbFor(supabase, user.id)
  const { data: current } = await db
    .from('portal_website_content')
    .select('content')
    .eq('business_id', business_id)
    .eq('section', section)
    .single()

  const { data: cr, error } = await db
    .from('portal_change_requests')
    .insert({
      business_id,
      section,
      old_content: current?.content || null,
      new_content,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ change_request: cr })
}
