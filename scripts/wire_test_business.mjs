// Creates "Smile Consulting (TEST)" under the ADMIN portal account with the
// published consulting site connected, and seeds the six website sections so
// Site Studio chat editing is fully testable without touching Janeth's data.
// Run: node scripts/wire_test_business.mjs   (from montero-cool/)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/)
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
// montero.cool prod is lfaqxsuscjtabsvrhlrd; the master .env's default
// SUPABASE_URL points at the other (builder) project — don't use it here.
const url = 'https://lfaqxsuscjtabsvrhlrd.supabase.co'
const key = env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL
if (!url || !key) { console.error('missing supabase creds'); process.exit(1) }
console.log('supabase project:', url)

const sb = createClient(url, key, { auth: { persistSession: false } })
const SITE = 'https://smilemanagementconsultingsnj.com'

const SECTIONS = {
  hero: "The quiet work of building a practice worth running.\n\nOwners hire us when the chair is full but the office isn't calm — when growth stops feeling like progress and starts feeling like noise. We rebuild the operations, the team, and the brand underneath, so the practice runs the way it was always supposed to.",
  about: "Built by an operator who has done the work.\n\nSmile Management & Consulting Solutions was founded by Janeth Osinowo — an oral healthcare provider and the founder of two sister companies in the dental space.\n\nJaneth runs Smile Family Dental, a thriving New Jersey practice. She runs Smile Dental Temps, a staffing agency that places clinicians into hundreds of chairs a year. She has lived every problem the consulting firm now solves — and that lived experience is the entire point.",
  services: "Four levers we pull until the practice runs quieter.\n\n01 / Practice Management — Systems, schedules, and workflows engineered to compound.\n02 / Staffing & Team Solutions — Same-week temp coverage and long-term bench-building.\n03 / Startup Consulting — For owners opening their first office or their next one.\n04 / Branding & Patient Experience — Practices grow on referrals, but referrals follow how the patient felt.",
  testimonials: '"The first ninety days felt less like consulting and more like having a partner who happened to have already solved every problem we were about to hit. The schedule was the first thing to change. The team was the second. The numbers followed."\n— Practice Owner, New Jersey',
  contact: "Let's see if we're the right fit.\n\nMost engagements begin with a free 30-minute call. Tell us what's pressing in the practice right now — we'll tell you, honestly, whether this is something we can help with.\n\nEmail: smilemanagementconsultings@gmail.com\nPhone: (908) 487-8669\nHours: Mon–Fri · 9am–6pm ET",
  footer: "© 2026 Smile Management & Consulting Solutions LLC. All Rights Reserved.",
}

// 1) Show the lay of the land
const { data: clients, error: cErr } = await sb
  .from('portal_clients')
  .select('id, owner_name, primary_email, is_admin, onboarding_complete')
if (cErr) { console.error('clients query failed:', cErr.message); process.exit(1) }
console.log('\nportal_clients:')
for (const c of clients) console.log(` - ${c.owner_name} <${c.primary_email}> admin=${c.is_admin} onboarded=${c.onboarding_complete}`)

const admin = clients.find(c => c.is_admin)
if (!admin) { console.error('no admin client row found'); process.exit(1) }
console.log('\nusing admin account:', admin.owner_name, admin.primary_email)

// 2) Upsert the test business under the admin account
const { data: existing } = await sb
  .from('portal_businesses')
  .select('id')
  .eq('client_id', admin.id)
  .eq('business_name', 'Smile Consulting (TEST)')
  .maybeSingle()

let bizId = existing?.id
if (!bizId) {
  const { data: biz, error: bErr } = await sb
    .from('portal_businesses')
    .insert({
      client_id: admin.id,
      business_name: 'Smile Consulting (TEST)',
      industry: 'Dental practice consulting',
      description: 'TEST COPY of Smile Management & Consulting Solutions — safe sandbox for Site Studio. Not Janeth\'s real business record.',
      website_url: SITE,
      sort_order: 99,
    })
    .select('id')
    .single()
  if (bErr) { console.error('business insert failed:', bErr.message); process.exit(1) }
  bizId = biz.id
  console.log('created test business:', bizId)
} else {
  await sb.from('portal_businesses').update({ website_url: SITE }).eq('id', bizId)
  console.log('test business already exists:', bizId, '(website_url refreshed)')
}

// 3) Seed the six sections (idempotent)
for (const [section, text] of Object.entries(SECTIONS)) {
  // No unique constraint on (business_id, section) in prod — check-then-write.
  const { data: row } = await sb
    .from('portal_website_content')
    .select('id')
    .eq('business_id', bizId)
    .eq('section', section)
    .maybeSingle()
  const { error } = row
    ? await sb.from('portal_website_content').update({ content: { text }, is_live: true }).eq('id', row.id)
    : await sb.from('portal_website_content').insert({ business_id: bizId, section, content: { text }, is_live: true })
  if (error) console.error(`  ${section}: FAILED — ${error.message}`)
  else console.log(`  seeded section: ${section}`)
}

// 4) Report readiness of the Site Studio metering pieces
const { error: meterErr } = await sb.from('portal_ai_edits').select('id', { count: 'exact', head: true })
console.log('\nportal_ai_edits table:', meterErr ? `MISSING (${meterErr.message}) — run scripts/site_studio_ai.sql` : 'exists')
const { data: adminFull } = await sb.from('portal_clients').select('*').eq('id', admin.id).single()
console.log('billing_exempt column:', 'billing_exempt' in (adminFull || {}) ? `exists (admin=${adminFull.billing_exempt})` : 'MISSING — run scripts/site_studio_ai.sql')

console.log('\nDONE. Log into montero.cool/portal as admin → business switcher → "Smile Consulting (TEST)" → Website tab.')
