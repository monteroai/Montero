import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// GET /api/portal/activity?business_id=xxx → interactions for a business
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const businessId = url.searchParams.get('business_id')
  const type = url.searchParams.get('type')
  const flagged = url.searchParams.get('filter') === 'flagged'
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  if (!businessId) return NextResponse.json({ interactions: [], total: 0 })

  // Admins read any client's business (service role); users stay RLS-scoped
  const { data: caller } = await supabase
    .from('portal_clients').select('is_admin').eq('user_id', user.id).maybeSingle()
  const db = caller?.is_admin ? adminClient() : supabase

  let query = db
    .from('portal_interactions')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (flagged) query = query.eq('flagged', true)

  const { data: interactions, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ interactions: interactions || [], total: count || 0 })
}
