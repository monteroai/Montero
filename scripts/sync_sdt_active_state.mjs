// Syncs portal_automations.active for Smile Dental Temps LLC with the TRUTH
// from n8n: real workflow ids get their live active flag; placeholder ids
// (WF2 etc. — not yet wired to real workflows) are set inactive so the
// dashboard never claims something is running that isn't.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient('https://lfaqxsuscjtabsvrhlrd.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })
const N8N_URL = (env.N8N_BASE_URL || 'https://montero-cool.app.n8n.cloud').replace(/\/$/, '')
const N8N_KEY = env.N8N_API_KEY

const SDT_BIZ = '522368e4-9b51-4893-8aae-cccb016cc344'
const { data: automations } = await sb.from('portal_automations')
  .select('id, n8n_workflow_id, friendly_name, active')
  .eq('business_id', SDT_BIZ)

for (const a of automations) {
  const isReal = /^[A-Za-z0-9]{8,}$/.test(a.n8n_workflow_id)
  let truth = false
  let note = 'placeholder id — not wired to a real workflow yet'
  if (isReal) {
    try {
      const r = await fetch(`${N8N_URL}/api/v1/workflows/${a.n8n_workflow_id}`, { headers: { 'X-N8N-API-KEY': N8N_KEY } })
      if (r.ok) {
        const wf = await r.json()
        truth = Boolean(wf.active)
        note = `n8n says ${truth ? 'ACTIVE' : 'inactive'} ("${wf.name}")`
      } else {
        note = `n8n lookup failed (${r.status}) — marking inactive to be safe`
      }
    } catch (e) {
      note = `n8n unreachable (${e.message}) — marking inactive to be safe`
    }
  }
  if (a.active !== truth) {
    await sb.from('portal_automations').update({ active: truth }).eq('id', a.id)
  }
  console.log(`${a.friendly_name}: active=${truth} — ${note}`)
}
console.log('SYNC DONE')
