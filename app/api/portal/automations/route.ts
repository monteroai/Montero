import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toggleWorkflow } from '@/lib/portal/n8n'

// GET /api/portal/automations?business_id=xxx → automations for a business
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const businessId = url.searchParams.get('business_id')
  if (!businessId) return NextResponse.json({ automations: [] })

  // RLS handles ownership check (joins portal_businesses → portal_clients → user_id)
  const { data: automations, error } = await supabase
    .from('portal_automations')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ automations: automations || [] })
}

// PATCH /api/portal/automations → toggle an automation on/off
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { automation_id, active } = body as { automation_id: string; active: boolean }

  if (!automation_id || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'automation_id and active required' }, { status: 400 })
  }

  // Fetch automation (RLS verifies ownership through business → client → user)
  const { data: automation } = await supabase
    .from('portal_automations')
    .select('id, n8n_workflow_id')
    .eq('id', automation_id)
    .single()

  if (!automation) return NextResponse.json({ error: 'Automation not found' }, { status: 404 })

  // Toggle in n8n (best-effort; local state still updates if n8n unreachable)
  try {
    await toggleWorkflow(automation.n8n_workflow_id, active)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'n8n API error'
    console.error('n8n toggle failed:', msg)
  }

  const { error } = await supabase
    .from('portal_automations')
    .update({ active, last_run: new Date().toISOString() })
    .eq('id', automation_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, active })
}
