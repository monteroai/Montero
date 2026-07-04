// Applies the Janeth Phase-1 seed via the service role (REST — no SQL editor
// needed): onboarding complete, consulting business website_url (the real
// published domain), 6 website content sections, and the Lead Triage
// automation row. Idempotent.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient('https://lfaqxsuscjtabsvrhlrd.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })

const JANETH_USER = '9d0d8e23-1a93-4f46-a582-926329be4d5c'
const CONSULTING_BIZ = 'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d'
const CONSULTING_CLIENT = 'a046a033-a3bc-4d13-a4a1-30c0d5182d46'
const SITE = 'https://smilemanagementconsultingsnj.com'

const SECTIONS = {
  hero: "The quiet work of building a practice worth running.\n\nOwners hire us when the chair is full but the office isn't calm — when growth stops feeling like progress and starts feeling like noise. We rebuild the operations, the team, and the brand underneath, so the practice runs the way it was always supposed to.",
  about: "Built by an operator who has done the work.\n\nSmile Management & Consulting Solutions was founded by Janeth Osinowo — an oral healthcare provider and the founder of two sister companies in the dental space.\n\nJaneth runs Smile Family Dental, a thriving New Jersey practice. She runs Smile Dental Temps, a staffing agency that places clinicians into hundreds of chairs a year. She has lived every problem the consulting firm now solves — and that lived experience is the entire point.",
  services: "Four levers we pull until the practice runs quieter.\n\n01 / Practice Management — Systems, schedules, and workflows engineered to compound.\n02 / Staffing & Team Solutions — Same-week temp coverage and long-term bench-building.\n03 / Startup Consulting — For owners opening their first office or their next one.\n04 / Branding & Patient Experience — Practices grow on referrals, but referrals follow how the patient felt.",
  testimonials: '"The first ninety days felt less like consulting and more like having a partner who happened to have already solved every problem we were about to hit. The schedule was the first thing to change. The team was the second. The numbers followed."\n— Practice Owner, New Jersey',
  contact: "Let's see if we're the right fit.\n\nMost engagements begin with a free 30-minute call. Tell us what's pressing in the practice right now — we'll tell you, honestly, whether this is something we can help with.\n\nEmail: smilemanagementconsultings@gmail.com\nPhone: (908) 487-8669\nHours: Mon–Fri · 9am–6pm ET",
  footer: "© 2026 Smile Management & Consulting Solutions LLC. All Rights Reserved.",
}

// 1) onboarding complete
const { error: e1 } = await sb.from('portal_clients')
  .update({ onboarding_complete: true, onboarding_step: 5 })
  .eq('user_id', JANETH_USER)
console.log('client onboarding:', e1 ? e1.message : 'OK')

// 2) website_url on the consulting business (real published domain)
const { error: e2 } = await sb.from('portal_businesses')
  .update({ website_url: SITE })
  .eq('id', CONSULTING_BIZ)
console.log('business website_url:', e2 ? e2.message : `OK → ${SITE}`)

// 3) six content sections (check-then-write; no unique constraint in prod)
for (const [section, text] of Object.entries(SECTIONS)) {
  const { data: row } = await sb.from('portal_website_content')
    .select('id').eq('business_id', CONSULTING_BIZ).eq('section', section).maybeSingle()
  const { error } = row
    ? await sb.from('portal_website_content').update({ content: { text }, is_live: true }).eq('id', row.id)
    : await sb.from('portal_website_content').insert({ business_id: CONSULTING_BIZ, section, content: { text }, is_live: true })
  console.log(`content ${section}:`, error ? error.message : 'OK')
}

// 4) display automation row
const { data: autoRow } = await sb.from('portal_automations')
  .select('id').eq('n8n_workflow_id', 'lead-triage-consulting-v1').maybeSingle()
if (!autoRow) {
  const { error } = await sb.from('portal_automations').insert({
    client_id: CONSULTING_CLIENT,
    business_id: CONSULTING_BIZ,
    n8n_workflow_id: 'lead-triage-consulting-v1',
    friendly_name: 'Lead Triage — Smile Consulting',
    description: 'New form submissions on the consulting site land here. Janeth gets an instant SMS, the lead is logged under Activity, and the lead receives an auto-reply.',
    category: 'outreach',
    active: true,
    last_status: 'idle',
    sort_order: 0,
  })
  console.log('automation:', error ? error.message : 'OK (created)')
} else {
  console.log('automation: OK (already exists)')
}
console.log('SEED DONE')
