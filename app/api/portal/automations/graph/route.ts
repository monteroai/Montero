import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// GET /api/portal/automations/graph?automation_id=xxx
// Returns a simplified n8n-style flow for the "How it works" view:
// { managed } for app-managed rows, or { levels: [[{name, kind}...], ...] }
// — BFS layers from the trigger(s), so branches sit side by side.

const N8N_API_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'

type N8nNode = { name: string; type: string; disabled?: boolean }
type FlowNode = { name: string; kind: string }

function kindOf(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('webhook') || t.includes('trigger') || t.includes('cron') || t.includes('schedule')) return 'trigger'
  if (t.includes('if') || t.includes('switch') || t.includes('filter') || t.includes('router')) return 'branch'
  if (t.includes('gmail') || t.includes('email') || t.includes('sendgrid') || t.includes('resend')) return 'email'
  if (t.includes('twilio') || t.includes('sms') || t.includes('whatsapp')) return 'sms'
  if (t.includes('openai') || t.includes('anthropic') || t.includes('langchain') || t.includes('agent') || t.includes('llm') || t.includes('ai')) return 'ai'
  if (t.includes('airtable') || t.includes('supabase') || t.includes('postgres') || t.includes('sheet') || t.includes('notion')) return 'data'
  if (t.includes('http') || t.includes('api')) return 'api'
  if (t.includes('vapi') || t.includes('call') || t.includes('phone')) return 'call'
  if (t.includes('wait') || t.includes('delay')) return 'wait'
  return 'step'
}

export async function GET(request: NextRequest) {
  const automationId = new URL(request.url).searchParams.get('automation_id')
  if (!automationId) return NextResponse.json({ error: 'automation_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('portal_clients').select('is_admin').eq('user_id', user.id).maybeSingle()
  const db = caller?.is_admin ? adminClient() : supabase

  const { data: automation } = await db
    .from('portal_automations')
    .select('id, n8n_workflow_id, friendly_name, description')
    .eq('id', automationId)
    .single()
  if (!automation) return NextResponse.json({ error: 'Automation not found' }, { status: 404 })

  // App-managed rows (slug ids) have no n8n graph — the flow is described text.
  if (!/^[A-Za-z0-9]{8,}$/.test(automation.n8n_workflow_id)) {
    return NextResponse.json({ managed: true, description: automation.description })
  }

  const key = process.env.N8N_API_KEY
  if (!key) return NextResponse.json({ error: 'Flow view not configured' }, { status: 503 })

  let wf: { nodes?: N8nNode[]; connections?: Record<string, { main?: Array<Array<{ node: string }>> }> }
  try {
    const res = await fetch(`${N8N_API_URL}/api/v1/workflows/${automation.n8n_workflow_id}`, {
      headers: { 'X-N8N-API-KEY': key },
    })
    if (!res.ok) throw new Error(`n8n ${res.status}`)
    wf = await res.json()
  } catch {
    return NextResponse.json({ error: 'Could not load the flow right now' }, { status: 502 })
  }

  const nodes = (wf.nodes || []).filter(n => !n.disabled && !n.type.toLowerCase().includes('stickynote'))
  const conns = wf.connections || {}
  const byName = new Map(nodes.map(n => [n.name, n]))

  // Build adjacency + incoming counts over enabled nodes
  const out = new Map<string, string[]>()
  const incoming = new Map<string, number>()
  for (const n of nodes) incoming.set(n.name, 0)
  for (const [src, c] of Object.entries(conns)) {
    if (!byName.has(src)) continue
    const targets = (c.main || []).flat().map(t => t?.node).filter((t): t is string => Boolean(t && byName.has(t)))
    out.set(src, targets)
    for (const t of targets) incoming.set(t, (incoming.get(t) || 0) + 1)
  }

  // BFS layers from roots (no incoming edges)
  let frontier = nodes.filter(n => (incoming.get(n.name) || 0) === 0).map(n => n.name)
  if (frontier.length === 0 && nodes.length > 0) frontier = [nodes[0].name]
  const seen = new Set<string>()
  const levels: FlowNode[][] = []
  while (frontier.length > 0 && levels.length < 30) {
    const level: FlowNode[] = []
    const next: string[] = []
    for (const name of frontier) {
      if (seen.has(name)) continue
      seen.add(name)
      const node = byName.get(name)
      if (node) level.push({ name, kind: kindOf(node.type) })
      for (const t of out.get(name) || []) if (!seen.has(t)) next.push(t)
    }
    if (level.length > 0) levels.push(level)
    frontier = Array.from(new Set(next))
  }

  return NextResponse.json({ name: automation.friendly_name, levels })
}
