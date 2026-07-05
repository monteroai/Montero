import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, isAdminEnvConfigured } from '@/lib/supabase/admin'

// GET /api/portal/automations/system-map?business_id=xxx
// Aerial view of how a business's automations interconnect:
// - entry channel per workflow (Phone / Website / Chat / Email / Schedule)
// - what it produces (calls, sms, email, data, ai)
// - cross-workflow edges (Execute-Workflow + agent tool-workflow nodes in n8n)

const N8N_API_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'

type MapNode = {
  id: string
  name: string
  category: string
  channel: string
  outputs: string[]
  active: boolean
  linked: boolean // true when we could read the live n8n graph
}

function channelOf(types: string[]): string {
  const t = types.join(' ').toLowerCase()
  if (t.includes('vapi') || t.includes('call') || t.includes('phone') || t.includes('twilio trigger')) return 'Phone'
  if (t.includes('chat')) return 'Chat'
  if (t.includes('imap') || t.includes('emailreadimap') || t.includes('gmailtrigger')) return 'Email'
  if (t.includes('cron') || t.includes('schedule') || t.includes('interval')) return 'Schedule'
  if (t.includes('webhook') || t.includes('form')) return 'Website'
  return 'Internal'
}

function outputsOf(types: string[]): string[] {
  const t = types.join(' ').toLowerCase()
  const out = new Set<string>()
  if (t.includes('twilio') || t.includes('sms')) out.add('sms')
  if (t.includes('gmail') || t.includes('email') || t.includes('sendgrid') || t.includes('resend')) out.add('email')
  if (t.includes('vapi') || t.includes('call')) out.add('calls')
  if (t.includes('openai') || t.includes('anthropic') || t.includes('langchain') || t.includes('agent')) out.add('ai')
  if (t.includes('airtable') || t.includes('supabase') || t.includes('postgres') || t.includes('sheet') || t.includes('notion')) out.add('data')
  return Array.from(out)
}

export async function GET(request: NextRequest) {
  const businessId = new URL(request.url).searchParams.get('business_id')
  if (!businessId) return NextResponse.json({ error: 'business_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: caller } = await supabase
    .from('portal_clients').select('is_admin').eq('user_id', user.id).maybeSingle()
  const db = caller?.is_admin ? adminClient() : supabase

  const { data: automations } = await db
    .from('portal_automations')
    .select('id, n8n_workflow_id, friendly_name, description, category, active, portal_businesses!inner(client_id)')
    .eq('business_id', businessId)
    .order('sort_order')
  if (!automations || automations.length === 0) return NextResponse.json({ nodes: [], edges: [] })

  // Resolve the n8n key: the owning client's vaulted key first (their
  // instance), then the platform env key.
  let n8nKey = process.env.N8N_API_KEY || ''
  const ownerClientId = (automations[0] as unknown as { portal_businesses?: { client_id?: string } }).portal_businesses?.client_id
  if (ownerClientId && isAdminEnvConfigured()) {
    try {
      const { data: plaintext } = await adminClient().rpc('get_client_secret_plaintext', {
        p_client_id: ownerClientId,
        p_service: 'n8n',
      })
      if (plaintext) n8nKey = plaintext as string
    } catch { /* fall back to env key */ }
  }

  const byWfId = new Map(automations.map(a => [a.n8n_workflow_id, a]))
  const nodes: MapNode[] = []
  const edges: Array<{ from: string; to: string }> = []

  await Promise.all(automations.map(async a => {
    const isReal = /^[A-Za-z0-9]{8,}$/.test(a.n8n_workflow_id)
    if (!isReal || !n8nKey) {
      nodes.push({
        id: a.id, name: a.friendly_name, category: a.category, active: a.active,
        channel: isReal ? 'Internal' : 'Website',
        outputs: outputsOf([a.description || '']),
        linked: false,
      })
      return
    }
    try {
      const res = await fetch(`${N8N_API_URL}/api/v1/workflows/${a.n8n_workflow_id}`, {
        headers: { 'X-N8N-API-KEY': n8nKey },
      })
      if (!res.ok) throw new Error(String(res.status))
      const wf = await res.json() as { nodes?: Array<{ type: string; parameters?: { workflowId?: { value?: string } | string } }> }
      const types = (wf.nodes || []).map(n => n.type)
      nodes.push({
        id: a.id, name: a.friendly_name, category: a.category, active: a.active,
        channel: channelOf(types), outputs: outputsOf(types), linked: true,
      })
      // Cross-workflow calls: executeWorkflow + agent toolWorkflow nodes
      for (const n of wf.nodes || []) {
        const t = n.type.toLowerCase()
        if (t.includes('executeworkflow') || t.includes('toolworkflow')) {
          const raw = n.parameters?.workflowId
          const targetId = typeof raw === 'string' ? raw : raw?.value
          const target = targetId ? byWfId.get(targetId) : undefined
          if (target && target.id !== a.id) edges.push({ from: a.id, to: target.id })
        }
      }
    } catch {
      nodes.push({
        id: a.id, name: a.friendly_name, category: a.category, active: a.active,
        channel: 'Internal', outputs: outputsOf([a.description || '']), linked: false,
      })
    }
  }))

  // Preserve original ordering
  const order = new Map(automations.map((a, i) => [a.id, i]))
  nodes.sort((x, y) => (order.get(x.id) || 0) - (order.get(y.id) || 0))
  return NextResponse.json({ nodes, edges })
}
