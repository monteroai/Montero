// Server-side helper — given a client's verified n8n API key, pulls every
// workflow from their n8n account and upserts them into portal_automations
// scoped to their primary business. Plaintext n8n keys never leave the server.

import type { SupabaseClient } from '@supabase/supabase-js'

const N8N_BASE_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'

interface N8nWorkflowSummary {
  id: string
  name: string
  active: boolean
  updatedAt?: string
}

export interface SyncResult {
  ok: boolean
  synced: number
  total: number
  error?: string
}

/**
 * Pull workflows from n8n and write them to portal_automations.
 * - Uses the provided apiKey directly (caller already decrypted it from Vault).
 * - Assigns every workflow to the client's first active business.
 * - Upsert by n8n_workflow_id: existing rows update name/active, new rows insert.
 *
 * NOTE: this is intentionally permissive — if n8n returns workflows from an
 * account that has more than one workspace, we sync them all. We'll add
 * filtering later if a client has tags or naming conventions to scope by.
 */
export async function syncN8nWorkflowsForClient(
  supabase: SupabaseClient,
  clientId: string,
  apiKey: string,
): Promise<SyncResult> {
  if (!apiKey) return { ok: false, synced: 0, total: 0, error: 'No n8n API key provided' }

  // Find the client's primary business (first by sort_order, not archived)
  const { data: biz, error: bizErr } = await supabase
    .from('portal_businesses')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (bizErr) return { ok: false, synced: 0, total: 0, error: 'DB: ' + bizErr.message }
  if (!biz) return { ok: false, synced: 0, total: 0, error: 'Client has no businesses yet — add a business before syncing workflows.' }

  // Pull workflows from n8n. Defensive about response shape: n8n returns
  // either {data:[...]} or {results:[...]} depending on version.
  let workflows: N8nWorkflowSummary[]
  try {
    const r = await fetch(`${N8N_BASE_URL}/api/v1/workflows?limit=250`, {
      headers: { 'X-N8N-API-KEY': apiKey, Accept: 'application/json' },
    })
    if (!r.ok) {
      return { ok: false, synced: 0, total: 0, error: `n8n returned ${r.status}` }
    }
    const data = await r.json()
    const list: unknown[] = (data?.data ?? data?.results ?? []) as unknown[]
    workflows = list.map(w => {
      const wf = w as Record<string, unknown>
      return {
        id: String(wf.id ?? ''),
        name: String(wf.name ?? 'Untitled workflow'),
        active: Boolean(wf.active),
        updatedAt: typeof wf.updatedAt === 'string' ? wf.updatedAt : undefined,
      }
    }).filter(w => w.id)
  } catch (e) {
    return { ok: false, synced: 0, total: 0, error: 'Could not reach n8n: ' + ((e as Error).message || 'network error') }
  }

  if (workflows.length === 0) {
    return { ok: true, synced: 0, total: 0 }
  }

  // Upsert: match on (business_id, n8n_workflow_id). Existing rows preserve
  // friendly_name/description/sort_order/category if already set — we only
  // update the live status fields. New rows get sensible defaults.
  let synced = 0
  for (let i = 0; i < workflows.length; i++) {
    const wf = workflows[i]
    const { data: existing } = await supabase
      .from('portal_automations')
      .select('id, friendly_name')
      .eq('business_id', biz.id)
      .eq('n8n_workflow_id', wf.id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('portal_automations')
        .update({
          active: wf.active,
          last_run: wf.updatedAt || null,
          // Don't overwrite friendly_name if Emilio renamed it in the portal.
          friendly_name: existing.friendly_name && existing.friendly_name !== wf.name ? existing.friendly_name : wf.name,
        })
        .eq('id', existing.id)
      if (!error) synced++
    } else {
      // Legacy schema requires client_id NOT NULL — pass it alongside business_id
      // so this works whether or not the column has been dropped yet.
      const { error } = await supabase
        .from('portal_automations')
        .insert({
          client_id: clientId,
          business_id: biz.id,
          n8n_workflow_id: wf.id,
          friendly_name: wf.name,
          description: null,
          category: 'general',
          active: wf.active,
          last_run: wf.updatedAt || null,
          sort_order: i,
        })
      if (!error) synced++
    }
  }

  return { ok: true, synced, total: workflows.length }
}
