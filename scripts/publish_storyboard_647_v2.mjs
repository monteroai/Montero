// Publishes "6:47 AM — v2 (hyperreal)" under Smile Dental Temps LLC (draft),
// alongside v1 for side-by-side comparison in the portal.
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
const BIZ = '522368e4-9b51-4893-8aae-cccb016cc344' // Smile Dental Temps LLC
const SB_ID = 'sb-647am-v2'
const DIR = 'D:/smile/marketing/storyboard_647am_v2'
const pub = (p) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${p}`

const frameUrls = {}
for (let i = 1; i <= 5; i++) {
  const path = `${BIZ}/${SB_ID}/frame_${i}.png`
  const { error } = await sb.storage.from(BUCKET).upload(path, readFileSync(`${DIR}/frame_${i}.png`), { upsert: true, contentType: 'image/png' })
  console.log(`frame_${i}:`, error ? error.message : 'uploaded')
  frameUrls[i] = pub(path)
}

const board = {
  id: SB_ID,
  title: '6:47 AM — v2 (hyperreal)',
  concept: 'Same 18-second story as v1, regenerated with capture-fact prompting: real camera/lens/light language, deliberate imperfections (grain, smudges, flyaways, mixed white balance), no AI-style adjectives. Goal: frames indistinguishable from documentary photography. Compare against v1 below and approve the winner.',
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
    { idx: 1, image: frameUrls[1], duration: '0–3s', story: 'A phone lights up on a nightstand at 6:47 AM: "So sorry — I can\'t come in today." The morning every office manager knows.', image_prompt: '5-slot capture-fact prompt: dark winter bedroom, 35mm f/1.8 ISO 3200 grain, screen as key light, fingerprint smudges, mixed white balance, one-degree crooked framing. Exact notification text quoted.', motion_prompt: 'Static nightstand shot, phone screen pulses brighter as the message lands, glow shifts on the water glass, subtle handheld drift. Audio: two sharp buzzes, then quiet room tone.' },
    { idx: 2, image: frameUrls[2], duration: '3–7s', story: 'The operatory: full Tuesday schedule, empty hygienist chair. Text overlay: "Full schedule. No hygienist."', image_prompt: '28mm f/2.8 documentary reportage, one strip of sun through blinds, dust motes, coffee ring on the handwritten schedule, cable clutter, crooked certificate.', motion_prompt: 'Slow dolly-in toward the empty stool, dust motes drifting in the sun strip, schedule page corner lifts once. Audio: ticking clock, low tense drone.' },
    { idx: 3, image: frameUrls[3], duration: '7–10s', story: 'At 7:02 AM the save arrives: "Maria R., RDH — confirmed for today, 8:00 AM." Relief in one notification.', image_prompt: 'Candid smartphone HDR shot, hard window backlight with flare edge, steam motion blur, crumbs and butter knife at counter edge. Exact notification text quoted.', motion_prompt: 'Notification slides in with a soft glow, steam curls, flare shifts as if the camera settles. Audio: gentle chime, music turns hopeful.' },
    { idx: 4, image: frameUrls[4], duration: '10–14s', story: 'Maria pushes open the practice door at 8:00 sharp, sunlight behind her. The day is saved before it started.', image_prompt: '85mm f/2 recruitment-candid, real skin texture, flyaway hairs backlit, motion blur on lanyard and door edge, sun flare clipping the corner, mixed lobby/exterior color temperature.', motion_prompt: 'Slow-motion door push, sun flare sweeps the lens, lanyard swings, hair moves with the step. Audio: door swoosh, bright morning ambience, music resolves upbeat.' },
    { idx: 5, image: frameUrls[5], duration: '14–18s', story: 'End card: "Call-outs happen. Empty chairs don\'t have to." — Smile Dental Temps. Vetted coverage, same morning.', image_prompt: 'Premium print-ad typography on navy with breathing teal gradient, cream serif with slight ink bleed, muted gold rule + tooth mark, film grain + paper texture. Exact copy quoted.', motion_prompt: 'Type settles with a subtle fade-up, teal gradient breathes, grain shimmers. Audio: final brand chime — the opening buzz motif inverted, then clean silence.' },
  ],
}

let existing = []
const { data: idx } = await sb.storage.from(BUCKET).download(`${BIZ}/index.json`)
if (idx) { try { existing = JSON.parse(await idx.text()) } catch {} }
const merged = [board, ...existing.filter(b => b.id !== SB_ID)]
const { error: wErr } = await sb.storage.from(BUCKET).upload(
  `${BIZ}/index.json`, Buffer.from(JSON.stringify(merged, null, 2)),
  { upsert: true, contentType: 'application/json' },
)
console.log('index.json:', wErr ? wErr.message : `OK (${merged.length} storyboards)`)
