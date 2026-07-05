// Seeds the 13 SDT workflows (lib/portal/constants.ts SDT_WORKFLOWS) as
// portal_automations rows for the REAL Smile Dental Temps LLC business —
// the tab was blank because these rows were never created. Idempotent.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient('https://lfaqxsuscjtabsvrhlrd.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })

const SDT_BIZ = '522368e4-9b51-4893-8aae-cccb016cc344'
const JANETH_CLIENT = 'a046a033-a3bc-4d13-a4a1-30c0d5182d46'

// Mirror of SDT_WORKFLOWS in lib/portal/constants.ts
const WORKFLOWS = [
  ['PIo3mYTZKOlJdXM4', 'AI Receptionist (Inbound Calls)', 'Answers all inbound calls via VAPI, collects caller info, routes to candidate or client intake, sends confirmations.', 'calls', 1],
  ['WF2', 'Follow-Up Scheduler', 'Schedules automatic follow-up calls and emails for new candidates and clients.', 'outreach', 2],
  ['WF3', 'Email Unsubscribe Handler', 'Handles unsubscribe requests from reminder emails and updates contact preferences.', 'email', 3],
  ['WF4', 'Candidate Application Intake', 'Receives website applications from dental professionals, creates profiles in your database, checks for duplicates.', 'candidates', 4],
  ['WF5', 'Client Practice Application', 'Receives applications from dental practices looking to hire, creates client profiles.', 'clients', 5],
  ['3fe5HKWS2vWRisD0', 'Shift Reminder Calls (Outbound)', 'Automated outbound calls to remind dental professionals about upcoming shifts and appointments.', 'calls', 6],
  ['WF7', 'Booking Handler', 'Manages shift bookings — confirms placements, updates availability, notifies both parties.', 'bookings', 7],
  ['WF8', 'Availability Checker', 'Checks dental professional availability when a practice requests coverage.', 'bookings', 8],
  ['WF9', 'Approval Handler', 'Manages approval workflows for shift assignments and placements.', 'bookings', 9],
  ['WF10', 'Call Outcome Tracker', 'Logs call results — who picked up, who is interested, who needs a callback.', 'calls', 10],
  ['WF11', 'Outbound Call Tools', 'Supporting tools for outbound calling — dialer setup, call scripts, voicemail detection.', 'calls', 11],
  ['e90WJnsvQgAKVqN6', 'Database Sync', 'Syncs data between Airtable and your portal database every 4 hours to keep everything up to date.', 'sync', 12],
  ['7fWaVKEHxMXEWGj4', 'AI Chat Assistant', 'Powers the chat widget on your website — answers questions from candidates and practices 24/7.', 'chat', 13],
]

for (const [wfId, name, desc, category, order] of WORKFLOWS) {
  const { data: existing } = await sb.from('portal_automations')
    .select('id').eq('business_id', SDT_BIZ).eq('n8n_workflow_id', wfId).maybeSingle()
  if (existing) { console.log(`${name}: exists`); continue }
  const { error } = await sb.from('portal_automations').insert({
    client_id: JANETH_CLIENT,
    business_id: SDT_BIZ,
    n8n_workflow_id: wfId,
    friendly_name: name,
    description: desc,
    category,
    active: true,
    last_status: 'idle',
    sort_order: order,
  })
  console.log(`${name}:`, error ? error.message : 'seeded')
}
console.log('DONE')
