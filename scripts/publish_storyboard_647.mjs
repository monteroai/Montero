// Publishes the "6:47 AM" storyboard to Supabase Storage under the admin
// TEST business (draft status → review + approve in /portal/marketing).

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const URL_BASE = 'https://lfaqxsuscjtabsvrhlrd.supabase.co'
const sb = createClient(URL_BASE, env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })

const BUCKET = 'storyboards'
const BIZ = '631247c9-a210-407b-8425-d65bfce632ef' // Smile Consulting (TEST) under admin
const SB_ID = 'sb-647am-v1'
const DIR = 'D:/smile/marketing/storyboard_647am'

// 1) ensure bucket
const { error: bErr } = await sb.storage.createBucket(BUCKET, { public: true })
console.log('bucket:', bErr ? `${bErr.message} (ok if already exists)` : 'created')

// 2) upload frames
const pub = (p) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${p}`
const frameUrls = {}
for (let i = 1; i <= 5; i++) {
  const path = `${BIZ}/${SB_ID}/frame_${i}.png`
  const { error } = await sb.storage.from(BUCKET).upload(path, readFileSync(`${DIR}/frame_${i}.png`), {
    upsert: true, contentType: 'image/png',
  })
  console.log(`frame_${i}:`, error ? error.message : 'uploaded')
  frameUrls[i] = pub(path)
}

const STYLE = 'Cinematic film still, moody teal-and-amber color grade, anamorphic lens feel, shallow depth of field, photorealistic, shot on 35mm. Vertical 9:16 composition.'

const board = {
  id: SB_ID,
  title: '6:47 AM',
  concept: 'The one morning every practice owner dreads, told in 18 seconds. A hygienist calls out at 6:47 AM — full schedule, empty chair — and Smile Dental Temps fills the seat before the first patient walks in. Direct-response reel for Meta, targeting dental practice owners and office managers in NJ. The same footage re-cuts into a candidate-side ad ("Pick up shifts on your schedule").',
  format: '9:16 reel · ~18s · 720p Seedance 2.0',
  status: 'draft',
  created_at: new Date().toISOString(),
  approved_at: null,
  audio: {
    music: 'Tense minimal pulse for the first 7 seconds, resolving into a warm upbeat acoustic groove at the save. No lyrics.',
    voiceover: 'None — on-screen text carries the story.',
    sfx: 'Double message buzz at open, then silence; soft clock tick under frames 1–2; notification chime at frame 3; door swoosh + morning ambience at frame 4; final brand chime (the buzz motif inverted) on the end card.',
  },
  frames: [
    {
      idx: 1, image: frameUrls[1], duration: '0–3s',
      story: 'A phone lights up on a nightstand at 6:47 AM: "So sorry — I can\'t come in today." The morning every office manager knows.',
      image_prompt: `Extreme close-up of a smartphone on a wooden nightstand in a dark bedroom at dawn, screen glowing with a text message that reads exactly "So sorry - I can't come in today", the phone clock showing 6:47 AM, a dental scrubs top folded on a chair blurred in the background. ${STYLE}`,
      motion_prompt: 'Static nightstand shot, phone screen lights up with the incoming message, glow brightens the room slightly, subtle handheld drift. Audio: two sharp message buzzes, then quiet room tone.',
    },
    {
      idx: 2, image: frameUrls[2], duration: '3–7s',
      story: 'The operatory: full Tuesday schedule, empty hygienist chair. Text overlay: "Full schedule. No hygienist."',
      image_prompt: `A modern dental operatory with an empty hygienist stool dramatically lit in the center, patient chair waiting beside it, a paper day-schedule packed with appointment names visible in the foreground. ${STYLE}`,
      motion_prompt: 'Slow dolly-in toward the empty stool, dust motes drifting in the warm light beam, papers on the schedule flutter once, light through the blinds shifts subtly. Audio: ticking clock, low tense drone.',
    },
    {
      idx: 3, image: frameUrls[3], duration: '7–10s',
      story: 'At 7:02 AM the save arrives: "Maria R., RDH — confirmed for today, 8:00 AM." Relief in one notification.',
      image_prompt: `Close-up of the same smartphone now in warm morning kitchen light at 7:02 AM, a clean app notification on screen reading exactly "Maria R., RDH - confirmed for today, 8:00 AM" with a green checkmark icon, coffee cup steaming beside it. ${STYLE}`,
      motion_prompt: 'Notification slides in with a soft glow, steam curls from the coffee cup, morning light warms slightly. Audio: gentle chime, music turns from tense to hopeful.',
    },
    {
      idx: 4, image: frameUrls[4], duration: '10–14s',
      story: 'Maria pushes open the practice door at 8:00 sharp, sunlight behind her. The day is saved before it started.',
      image_prompt: `A confident dental hygienist in navy scrubs pushing open the glass front door of a bright dental practice, warm 8 AM sunlight flaring behind her, welcoming professional smile, motion and purpose. ${STYLE}`,
      motion_prompt: 'Slow-motion door push, sunlight flare sweeps across the lens, her hair and badge lanyard move with the step. Audio: door swoosh, bright morning ambience, music resolves upbeat.',
    },
    {
      idx: 5, image: frameUrls[5], duration: '14–18s',
      story: 'End card: "Call-outs happen. Empty chairs don\'t have to." — Smile Dental Temps. Vetted coverage, same morning.',
      image_prompt: 'Minimal cinematic end card: dark navy background with soft teal light gradient, elegant typography reading exactly "Call-outs happen. Empty chairs don\'t have to." and below it "SMILE DENTAL TEMPS" and "Vetted coverage. Same morning.", subtle film grain. Vertical 9:16 composition.',
      motion_prompt: 'Type settles with a subtle fade-up, teal gradient breathes slowly, film grain shimmers. Audio: final brand chime — the opening buzz motif inverted, then clean silence.',
    },
  ],
}

// 3) write index.json (merge with any existing boards)
let existing = []
const { data: idx } = await sb.storage.from(BUCKET).download(`${BIZ}/index.json`)
if (idx) { try { existing = JSON.parse(await idx.text()) } catch {} }
const merged = [board, ...existing.filter(b => b.id !== SB_ID)]
const { error: wErr } = await sb.storage.from(BUCKET).upload(
  `${BIZ}/index.json`,
  Buffer.from(JSON.stringify(merged, null, 2)),
  { upsert: true, contentType: 'application/json' },
)
console.log('index.json:', wErr ? wErr.message : `OK (${merged.length} storyboard/s)`)
console.log('\nView: montero.cool/portal/marketing → business "Smile Consulting (TEST)"')
