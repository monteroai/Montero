// POST /api/admin/deploy-template
//   Body: { template_key, target_client_id? }
//
// Admin-only. Reads the target client's vaulted n8n key (server-side via
// service-role), then POSTs the template workflow into their n8n. The
// workflow lands INACTIVE — caller still has to flip it on. Plaintext key
// never reaches the browser.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { getTemplateByKey } from '@/lib/portal/templates'

const N8N_BASE_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin gate
  const { data: caller } = await supabase
    .from('portal_clients')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!caller) return NextResponse.json({ error: 'No client account' }, { status: 404 })
  if (!caller.is_admin) return NextResponse.json({ error: 'Admins only' }, { status: 403 })

  // Body
  let body: { template_key?: string; target_business_id?: string; target_client_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { template_key } = body
  if (!template_key) return NextResponse.json({ error: 'template_key is required' }, { status: 400 })

  // Resolve target client. Priority:
  //   1) target_business_id from the UI's active business → look up its client_id
  //   2) explicit target_client_id
  //   3) caller's own client_id (fallback for single-tenant testing)
  let targetClientId: string = caller.id
  if (body.target_business_id) {
    const { data: biz } = await supabase
      .from('portal_businesses')
      .select('client_id')
      .eq('id', body.target_business_id)
      .maybeSingle()
    if (!biz) return NextResponse.json({ error: 'target_business_id not found (or RLS blocked the read)' }, { status: 404 })
    targetClientId = biz.client_id
  } else if (body.target_client_id) {
    targetClientId = body.target_client_id
  }

  const template = getTemplateByKey(template_key)
  if (!template) return NextResponse.json({ error: `Unknown template: ${template_key}` }, { status: 404 })

  // Service-role client to decrypt the target client's n8n key
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
    return NextResponse.json({ error: 'No n8n key on file for that client. They need to verify their key first.' }, { status: 400 })
  }

  // Build the workflow JSON. Append timestamp suffix so repeated deploys don't
  // collide on name and so it's easy to spot which deploy was which.
  const suffix = new Date().toISOString().replace(/[T:]/g, '-').slice(0, 19)
  const workflowToCreate = {
    ...template.workflow,
    name: `${template.workflow.name} (${suffix})`,
  }

  // POST to n8n
  let createdId: string | undefined
  let createdName: string | undefined
  try {
    const r = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': plaintext as string,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(workflowToCreate),
    })
    const text = await r.text()
    if (!r.ok) {
      return NextResponse.json({
        error: `n8n returned ${r.status}: ${text.slice(0, 400)}`,
      }, { status: 502 })
    }
    const created = JSON.parse(text)
    createdId = created.id
    createdName = created.name
  } catch (e) {
    return NextResponse.json({ error: `Could not reach n8n: ${(e as Error).message}` }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    workflow_id: createdId,
    workflow_name: createdName,
    template_key,
    target_client_id: targetClientId,
    // Note for caller: workflow is created INACTIVE. Sync in the dashboard to surface it.
  })
}
