// POST /api/portal/integrations/test
//   Body: { service: 'n8n'|'vapi'|'twilio'|'enginehire', value: string, ...extras }
//   - Authenticates the caller
//   - Probes the provider with the pasted credential to verify it's valid
//   - On success: stores in Supabase Vault via set_client_secret RPC, marks verified
//   - On failure: records the failed attempt but never persists the secret
//
// Returns:
//   200 { ok: true, verified_at }
//   200 { ok: false, error }                 (verification failed — secret NOT saved)
//   401 / 400 on auth/validation errors

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncN8nWorkflowsForClient } from '@/lib/portal/n8nSync'
import { notifyAdminOfCredentialVerified } from '@/lib/portal/notifications'
import { getIntegrationByService } from '@/lib/portal/integrations'

const N8N_BASE_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let body: { service?: string; value?: string; label?: string; extras?: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }
  const { service, value, label } = body
  if (!service || !value) {
    return NextResponse.json({ ok: false, error: 'service and value are required' }, { status: 400 })
  }
  if (typeof value !== 'string' || value.trim().length < 8) {
    return NextResponse.json({ ok: false, error: 'That value looks too short. Double-check what you pasted.' })
  }

  // Confirm the user has a portal_clients row (the RPC needs client_id)
  const { data: client } = await supabase
    .from('portal_clients')
    .select('id, owner_name, primary_email')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!client) {
    return NextResponse.json({ ok: false, error: 'No client account on file. Contact Emilio to set up your account.' }, { status: 404 })
  }

  // Verify the credential against the provider
  let probe: { ok: boolean; error?: string }
  try {
    probe = await probeProvider(service, value.trim())
  } catch (e) {
    probe = { ok: false, error: e instanceof Error ? e.message : 'Probe failed' }
  }

  if (!probe.ok) {
    // Audit log — record the failed attempt without storing the secret
    await supabase.rpc('mark_credential_verified', {
      p_client_id: client.id,
      p_service: service,
      p_status: 'failed',
      p_error: probe.error || 'verification failed',
    })
    return NextResponse.json({ ok: false, error: probe.error || `${service} did not accept this credential.` })
  }

  // Store via SECURITY DEFINER RPC — auth.uid() check verifies ownership
  const { error: setErr } = await supabase.rpc('set_client_secret', {
    p_client_id: client.id,
    p_service: service,
    p_label: label || service,
    p_value: value.trim(),
  })
  if (setErr) {
    return NextResponse.json({ ok: false, error: 'Could not save to vault: ' + setErr.message }, { status: 500 })
  }

  // Flip verification flag (also marks any matching onboarding_task done)
  await supabase.rpc('mark_credential_verified', {
    p_client_id: client.id,
    p_service: service,
    p_status: 'verified',
    p_error: null,
  })

  // Side-effect: when n8n is verified, immediately pull the client's workflows
  // into portal_automations so the dashboard "comes alive" without an extra step.
  // We use the just-verified plaintext directly (no extra Vault round-trip)
  // and don't fail the verify response if sync hits an error.
  let postVerify: { synced?: number; total?: number; sync_error?: string } = {}
  if (service === 'n8n') {
    try {
      const result = await syncN8nWorkflowsForClient(supabase, client.id, value.trim())
      if (result.ok) {
        postVerify = { synced: result.synced, total: result.total }
      } else {
        postVerify = { sync_error: result.error }
      }
    } catch (e) {
      postVerify = { sync_error: (e as Error).message || 'sync failed' }
    }
  }

  // Best-effort admin notification — Emilio gets pinged so he knows to start
  // building this client's automations. Doesn't block the response.
  try {
    const integration = getIntegrationByService(service)
    // Look up business name for context, if any
    const { data: biz } = await supabase
      .from('portal_businesses')
      .select('business_name')
      .eq('client_id', client.id)
      .eq('is_archived', false)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    notifyAdminOfCredentialVerified({
      clientName: client.owner_name || client.primary_email || user.email || 'Client',
      clientEmail: client.primary_email || user.email || null,
      service,
      serviceLabel: integration?.name || service,
      businessName: biz?.business_name || null,
    }).catch(e => console.error('[test-credential] admin notify failed:', (e as Error).message))
  } catch (e) {
    console.error('[test-credential] admin notify pipeline error:', (e as Error).message)
  }

  return NextResponse.json({ ok: true, verified_at: new Date().toISOString(), ...postVerify })
}

// =============================================================================
// Provider probes
// =============================================================================

async function probeProvider(service: string, value: string): Promise<{ ok: boolean; error?: string }> {
  if (service === 'n8n') return probeN8n(value)
  if (service === 'vapi') return probeVapi(value)
  if (service === 'twilio') return probeTwilio(value)
  if (service === 'enginehire') return probeEnginehire(value)
  return { ok: false, error: `No probe defined for ${service}` }
}

async function probeN8n(apiKey: string) {
  const url = `${N8N_BASE_URL}/api/v1/workflows?limit=1`
  try {
    const r = await fetch(url, { headers: { 'X-N8N-API-KEY': apiKey, Accept: 'application/json' } })
    if (r.ok) return { ok: true }
    if (r.status === 401 || r.status === 403) {
      return { ok: false, error: 'n8n rejected this API key. Double-check it was copied in full.' }
    }
    return { ok: false, error: `n8n returned ${r.status}. The key may be expired or your n8n instance may be at a different URL.` }
  } catch (e) {
    return { ok: false, error: 'Could not reach n8n: ' + ((e as Error).message || 'network error') }
  }
}

async function probeVapi(apiKey: string) {
  try {
    const r = await fetch('https://api.vapi.ai/assistant?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    })
    if (r.ok) return { ok: true }
    if (r.status === 401 || r.status === 403) {
      return { ok: false, error: 'VAPI rejected this API key. Make sure you copied the full key.' }
    }
    return { ok: false, error: `VAPI returned ${r.status}. Try again, or check the key has not been rotated.` }
  } catch (e) {
    return { ok: false, error: 'Could not reach VAPI: ' + ((e as Error).message || 'network error') }
  }
}

async function probeTwilio(authToken: string) {
  // Twilio auth needs Account SID + Auth Token (HTTP Basic). For v1 we only collect
  // the Auth Token; without the SID we can't do a real probe, so we accept any
  // non-empty value and rely on the verify-on-use path inside automations.
  // Future: ask for SID too and verify by hitting GET https://api.twilio.com/2010-04-01/Accounts/{SID}.json
  if (authToken.length < 16) return { ok: false, error: 'Twilio auth token looks too short. Should be 32+ characters.' }
  return { ok: true }
}

async function probeEnginehire(_apiKey: string) {
  // EngineHire has no public API docs; verification will be done by the first
  // automation that uses it. For now accept and flag for manual review.
  return { ok: true }
}
