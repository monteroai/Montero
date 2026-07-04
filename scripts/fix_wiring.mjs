// 1) Publish the "6:47 AM" storyboard under Janeth's real SDT business (draft)
// 2) Link montero.cool to the admin's own "Montero" business so the default
//    view isn't empty
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const URL_BASE = 'https://lfaqxsuscjtabsvrhlrd.supabase.co'
const sb = createClient(URL_BASE, env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })

// find businesses
const { data: bizs } = await sb.from('portal_businesses').select('id, business_name, client_id, website_url')
for (const b of bizs) console.log(`- ${b.business_name} (${b.id}) site=${b.website_url || 'none'}`)

const sdt = bizs.find(b => b.id === '522368e4-9b51-4893-8aae-cccb016cc344') // Smile Dental Temps LLC (Janeth's real one)
const montero = bizs.find(b => /^montero$/i.test(b.business_name.trim()))
if (!sdt) { console.error('SDT business not found'); process.exit(1) }

// link montero.cool to the Montero business
if (montero) {
  await sb.from('portal_businesses').update({ website_url: 'https://montero.cool' }).eq('id', montero.id)
  console.log(`\nMontero business (${montero.id}) → website_url = https://montero.cool`)
}

// publish storyboard under SDT (copy frames within the bucket)
const BUCKET = 'storyboards'
const SRC_BIZ = '631247c9-a210-407b-8425-d65bfce632ef'
const SB_ID = 'sb-647am-v1'
const pub = (p) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${p}`

// load source index to reuse the full storyboard object
const { data: srcIdx } = await sb.storage.from(BUCKET).download(`${SRC_BIZ}/index.json`)
const srcBoards = JSON.parse(await srcIdx.text())
const board = JSON.parse(JSON.stringify(srcBoards.find(b => b.id === SB_ID)))

for (let i = 1; i <= 5; i++) {
  const dest = `${sdt.id}/${SB_ID}/frame_${i}.png`
  const { error } = await sb.storage.from(BUCKET).copy(`${SRC_BIZ}/${SB_ID}/frame_${i}.png`, dest)
  if (error && !/exists/i.test(error.message)) console.error(`frame_${i}: ${error.message}`)
  else console.log(`frame_${i}: copied → SDT`)
  board.frames[i - 1].image = pub(dest)
}
board.status = 'draft'
board.approved_at = null
board.created_at = new Date().toISOString()

let existing = []
const { data: idx } = await sb.storage.from(BUCKET).download(`${sdt.id}/index.json`)
if (idx) { try { existing = JSON.parse(await idx.text()) } catch {} }
const merged = [board, ...existing.filter(b => b.id !== SB_ID)]
const { error: wErr } = await sb.storage.from(BUCKET).upload(
  `${sdt.id}/index.json`,
  Buffer.from(JSON.stringify(merged, null, 2)),
  { upsert: true, contentType: 'application/json' },
)
console.log('SDT index.json:', wErr ? wErr.message : 'OK')
console.log(`\nDONE — storyboard is under "${sdt.business_name}" (draft). Switch business in the top-left dropdown.`)
