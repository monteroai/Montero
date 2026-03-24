import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin
  const { data: admin } = await supabase
    .from('portal_clients')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!admin?.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { change_request_id, action, note } = body as {
    change_request_id: string
    action: 'approved' | 'rejected'
    note?: string
  }

  if (!change_request_id || !action) {
    return NextResponse.json({ error: 'change_request_id and action required' }, { status: 400 })
  }

  // Get the change request
  const { data: cr } = await supabase
    .from('portal_change_requests')
    .select('*')
    .eq('id', change_request_id)
    .single()

  if (!cr) return NextResponse.json({ error: 'Change request not found' }, { status: 404 })

  // Update change request status
  await supabase.from('portal_change_requests').update({
    status: action,
    reviewed_at: new Date().toISOString(),
    reviewed_by: user.id,
    reviewer_note: note || null,
  }).eq('id', change_request_id)

  // If approved, update the live content
  if (action === 'approved') {
    await supabase.from('portal_website_content').upsert({
      client_id: cr.client_id,
      section: cr.section,
      content: cr.new_content,
      is_live: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id,section' })
  }

  return NextResponse.json({ success: true, action })
}
