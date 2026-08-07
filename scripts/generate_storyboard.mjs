// Storyboard generator — the piece that was missing.
//
//   node scripts/generate_storyboard.mjs <spec.json> [--dry]
//
// Renders every frame with gpt-image-2, uploads the PNGs to the public
// "storyboards" bucket, and merges the board into that business's index.json.
// Boards always land as status:"draft" — nothing reaches a client until an
// admin approves it in the Marketing tab.
//
// Re-running with the same storyboard id overwrites its frames and replaces
// the index entry, so you can iterate on prompts without piling up drafts.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ENV_PATH = 'D:/make-to-n8n-toolkit/.env'
const SUPABASE_URL = 'https://lfaqxsuscjtabsvrhlrd.supabase.co'
const BUCKET = 'storyboards'
const MODEL = 'gpt-image-2'
const SIZE = '1024x1536' // vertical, closest to 9:16

function loadEnv() {
  const out = {}
  for (const line of readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return out
}

const env = loadEnv()
const OPENAI_KEY = env.OPENAI_API_KEY
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL
if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY missing from .env')
if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL missing from .env')

const specPath = process.argv[2]
const DRY = process.argv.includes('--dry')
if (!specPath) throw new Error('usage: node generate_storyboard.mjs <spec.json> [--dry]')
const spec = JSON.parse(readFileSync(resolve(specPath), 'utf8'))

async function renderFrame(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, size: SIZE, n: 1 }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`openai ${res.status}: ${JSON.stringify(json).slice(0, 400)}`)
  const b64 = json.data?.[0]?.b64_json
  if (!b64) throw new Error(`no image returned: ${JSON.stringify(json).slice(0, 300)}`)
  return Buffer.from(b64, 'base64')
}

async function upload(path, buf) {
  // POST creates; if the object already exists it 400s, so fall back to PUT.
  // (A POST with x-upsert has been observed returning 200 without writing.)
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`
  const headers = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
    'Content-Type': 'image/png',
  }
  let res = await fetch(url, { method: 'POST', headers, body: buf })
  if (!res.ok) res = await fetch(url, { method: 'PUT', headers, body: buf })
  if (!res.ok) throw new Error(`upload ${path} failed: ${res.status} ${await res.text()}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

async function readIndex(businessId) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${businessId}/index.json`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  })
  if (!res.ok) return []
  try {
    const j = await res.json()
    return Array.isArray(j) ? j : []
  } catch {
    return []
  }
}

async function writeIndex(businessId, boards) {
  const body = JSON.stringify(boards, null, 2)
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${businessId}/index.json`
  const headers = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
    'Content-Type': 'application/json',
  }
  let res = await fetch(url, { method: 'PUT', headers, body })
  if (!res.ok) res = await fetch(url, { method: 'POST', headers, body })
  if (!res.ok) throw new Error(`index write failed: ${res.status} ${await res.text()}`)
}

const frames = []
for (const f of spec.frames) {
  process.stdout.write(`  frame ${f.idx}/${spec.frames.length} … `)
  if (DRY) {
    console.log('(dry run, skipped)')
    frames.push({ ...f, image: '' })
    continue
  }
  const t0 = Date.now()
  const buf = await renderFrame(f.image_prompt)
  const publicUrl = await upload(`${spec.business_id}/${spec.id}/frame_${f.idx}.png`, buf)
  console.log(`${(buf.length / 1024).toFixed(0)}KB in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  frames.push({ ...f, image: publicUrl })
}

if (!DRY) {
  const boards = await readIndex(spec.business_id)
  const board = {
    id: spec.id,
    title: spec.title,
    concept: spec.concept,
    format: spec.format,
    status: 'draft',
    created_at: new Date().toISOString(),
    approved_at: null,
    audio: spec.audio,
    frames,
  }
  await writeIndex(spec.business_id, [board, ...boards.filter(b => b.id !== spec.id)])
  console.log(`\n✓ "${spec.title}" published as DRAFT (${frames.length} frames)`)
  console.log('  Review: https://montero.cool/portal/marketing')
}
