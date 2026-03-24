import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ sections: [], change_requests: [] })

  const [{ data: sections }, { data: changeRequests }] = await Promise.all([
    supabase.from('portal_website_content').select('*').eq('client_id', client.id).order('section'),
    supabase.from('portal_change_requests').select('*').eq('client_id', client.id).order('requested_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    sections: sections || [],
    change_requests: changeRequests || [],
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const body = await request.json()
  const { section, new_content } = body as { section: string; new_content: Record<string, unknown> }

  if (!section || !new_content) {
    return NextResponse.json({ error: 'section and new_content required' }, { status: 400 })
  }

  // Get current content for the old_content snapshot
  const { data: current } = await supabase
    .from('portal_website_content')
    .select('content')
    .eq('client_id', client.id)
    .eq('section', section)
    .single()

  const { data: cr, error } = await supabase
    .from('portal_change_requests')
    .insert({
      client_id: client.id,
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
