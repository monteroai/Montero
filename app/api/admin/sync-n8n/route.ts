// POST /api/admin/sync-n8n
//   Body: { client_id }  (defaults to the caller's own client_id if omitted)
//
// Admin-triggered manual re-sync of a client's n8n workflows into
// portal_automations. Reads the encrypted n8n key out of Vault server-side
// via the get_client_secret_plaintext RPC — plaintext never reaches the
// browser. Gated to portal_clients.is_admin = true.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { syncN8nWorkflowsForClient } from '@/lib/portal/n8nSync'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin gate: caller must have is_admin=true on their portal_clients row
  const { data: caller } = await supabase
    .from('portal_clients')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!caller) return NextResponse.json({ error: 'No client account' }, { status: 404 })
  if (!caller.is_admin) return NextResponse.json({ error: 'Admins only' }, { status: 403 })

  // Target client — defaults to the admin's own client
  let body: { client_id?: string } = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine; we'll default
  }
  const targetClientId = body.client_id || caller.id

  // Read the n8n key out of Vault using a service-role client.
  // get_client_secret_plaintext is locked to service_role specifically so the
  // plaintext can never be requested from a normal user session, even with
  // a forged client_id.
  let admin
  try {
    admin = adminClient()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }

  const { data: plaintext, error: secretErr } = await admin.rpc('get_client_secret_plaintext', {
    p_client_id: targetClientId,
    p_service: 'n8n',
  })
  if (secretErr) {
    return NextResponse.json({ error: `Could not read vault: ${secretErr.message}` }, { status: 500 })
  }
  if (!plaintext) {
    return NextResponse.json({ error: 'No n8n key on file for that client yet — they need to verify their key first.' }, { status: 400 })
  }

  // Use the admin client for the sync writes too so RLS doesn't block writing
  // automations under a different client's business when an admin syncs.
  const result = await syncN8nWorkflowsForClient(admin, targetClientId, plaintext as string)
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Sync failed' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    synced: result.synced,
    total: result.total,
    client_id: targetClientId,
  })
}
