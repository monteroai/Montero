import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, isAdminEnvConfigured } from '@/lib/supabase/admin'
import { toggleWorkflow, toggleWorkflowWithKey } from '@/lib/portal/n8n'

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

  // Fetch automation + its owning client_id (RLS verifies ownership through business → client → user)
  const { data: automation } = await supabase
    .from('portal_automations')
    .select('id, n8n_workflow_id, business_id, portal_businesses!inner(client_id)')
    .eq('id', automation_id)
    .single()

  if (!automation) return NextResponse.json({ error: 'Automation not found' }, { status: 404 })

  // Resolve the n8n API key: prefer the owning client's vaulted key (so the
  // toggle flips THEIR n8n, not whatever the global env var points at). Fall
  // back to the env-var key for legacy single-tenant flows.
  const ownerClientId = ((automation as Record<string, unknown>).portal_businesses as { client_id?: string } | undefined)?.client_id
  let n8nKey: string | null = null
  if (ownerClientId && isAdminEnvConfigured()) {
    try {
      const admin = adminClient()
      const { data: plaintext } = await admin.rpc('get_client_secret_plaintext', {
        p_client_id: ownerClientId,
        p_service: 'n8n',
      })
      if (plaintext) n8nKey = plaintext as string
    } catch (e) {
      console.error('vault lookup failed for toggle:', (e as Error).message)
    }
  }

  // Toggle in n8n (best-effort; local state still updates if n8n unreachable)
  try {
    if (n8nKey) {
      await toggleWorkflowWithKey(automation.n8n_workflow_id, active, n8nKey)
    } else {
      await toggleWorkflow(automation.n8n_workflow_id, active)
    }
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
