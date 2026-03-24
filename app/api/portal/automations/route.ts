import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toggleWorkflow } from '@/lib/portal/n8n'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ automations: [] })

  const { data: automations, error } = await supabase
    .from('portal_automations')
    .select('*')
    .eq('client_id', client.id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ automations: automations || [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { automation_id, active } = body as { automation_id: string; active: boolean }

  if (!automation_id || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'automation_id and active required' }, { status: 400 })
  }

  // Verify ownership
  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: automation } = await supabase
    .from('portal_automations')
    .select('n8n_workflow_id')
    .eq('id', automation_id)
    .eq('client_id', client.id)
    .single()

  if (!automation) return NextResponse.json({ error: 'Automation not found' }, { status: 404 })

  // Toggle in n8n
  try {
    await toggleWorkflow(automation.n8n_workflow_id, active)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'n8n API error'
    // Still update local state even if n8n fails — we'll sync later
    console.error('n8n toggle failed:', msg)
  }

  // Update local record
  const { error } = await supabase
    .from('portal_automations')
    .update({ active, last_run: new Date().toISOString() })
    .eq('id', automation_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, active })
}
