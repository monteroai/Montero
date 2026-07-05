// Publishes "The Text You Didn't See (v3)" — Emilio's directed recut — under
// Smile Dental Temps LLC (draft), alongside v1/v2.
import { createClient } from '@supabase/supabase-js'
import { readFileSync, unlinkSync, existsSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('D:/make-to-n8n-toolkit/.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const URL_BASE = 'https://lfaqxsuscjtabsvrhlrd.supabase.co'
const sb = createClient(URL_BASE, env.SUPABASE_SERVICE_ROLE_KEY_MONTERO_COOL, { auth: { persistSession: false } })

const BUCKET = 'storyboards'
const BIZ = '522368e4-9b51-4893-8aae-cccb016cc344'
const SB_ID = 'sb-647am-v3'
const DIR = 'D:/smile/marketing/storyboard_647am_v3'
const pub = (p) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${p}`

const frameUrls = {}
for (let i = 1; i <= 6; i++) {
  const path = `${BIZ}/${SB_ID}/frame_${i}.png`
  const { error } = await sb.storage.from(BUCKET).upload(path, readFileSync(`${DIR}/frame_${i}.png`), { upsert: true, contentType: 'image/png' })
  console.log(`frame_${i}:`, error ? error.message : 'uploaded')
  frameUrls[i] = pub(path)
}

const board = {
  id: SB_ID,
  title: 'The Text You Didn\'t See (v3 — Emilio\'s cut)',
  concept: 'Directed recut: the office manager MISSES the 6:47 call-out text in her morning chaos and only reads it standing in front of a packed waiting room. Opens on a macro close-up where the text (and the cheeky "sorry ;/") is unmissable. Dramatic irony carries the middle, SDT delivers the save, end card lands the promise. ~20s, 9:16, hyperreal capture-fact frames.',
  format: '9:16 reel · ~20s · 720p Seedance 2.0',
  status: 'draft',
  created_at: new Date().toISOString(),
  approved_at: null,
  audio: {
    music: 'No music for the first 2s (just the buzz) → nervous ticking pulse builds through the chaos → drops OUT completely at the realization beat → warm resolve enters with Maria → brand chime on the card.',
    voiceover: 'None — the texts and her face carry the story.',
    sfx: 'Double buzz (0s); blaring alarm cut off by the slap (2s); keys/door/coffee clatter montage (5-9s); waiting-room murmur that goes quiet at the realization (9s); notification chime (14s); door swoosh (16s); inverted-buzz brand chime (18s).',
  },
  frames: [
    { idx: 1, image: frameUrls[1], duration: '0–2s', story: 'MACRO on the lock screen: 6:47 AM. "So sorry — I can\'t come in today." Then the second bubble lands: "sorry ;/". The audacity is the hook.', image_prompt: 'Macro close-up filling the frame with the Messages lock screen, sender "Ashley (Hygienist)", both bubbles quoted exactly, screen-door pixel texture, fingerprint smudge catching light.', motion_prompt: 'Locked macro shot; first bubble already visible, second bubble "sorry ;/" pops in with a buzz, screen glow flares slightly. Audio: two sharp buzzes, then silence.' },
    { idx: 2, image: frameUrls[2], duration: '2–5s', story: 'She never saw it. 7:10 AM — hand slaps the blaring alarm, face still in the pillow. The text sits unread.', image_prompt: '35mm f/2 ISO 3200, motion blur on the slapping hand, alarm screen 7:10 AM with snooze slider, hair across pillow, yesterday\'s earrings on the nightstand.', motion_prompt: 'Hand swings in and slaps the phone, screen wobbles, she burrows deeper into the pillow. Audio: blaring alarm cut dead by the slap, groggy exhale.' },
    { idx: 3, image: frameUrls[3], duration: '5–9s', story: 'Morning chaos on fast-forward: coffee drip on the sleeve, keys in teeth, out the door — phone face-down in the tote, still unread.', image_prompt: '28mm mid-stride, motion blur on the tote strap, coffee stain on the cuff, keys in teeth, phone face-down half-slid into the bag, tilted handheld framing.', motion_prompt: 'Quick push following her through the doorway, bag swinging, door catching behind her. Audio: keys jangle, door slam, ticking pulse building.' },
    { idx: 4, image: frameUrls[4], duration: '9–14s', story: 'ONE STEP into the office: packed waiting room. NOW she reads it — 6:47 AM, "sorry ;/". Too late. Text overlay: "Busiest day of the month."', image_prompt: '50mm f/2 on her face and the phone showing both quoted messages, packed waiting room bokeh behind, wall clock soft, colleague looking over expectantly, dawning dread not cartoon panic.', motion_prompt: 'Slow push-in on her face as her eyes drop to the phone, waiting-room motion frozen behind her. Audio: room murmur fades to silence, one heartbeat.' },
    { idx: 5, image: frameUrls[5], duration: '14–18s', story: 'The save: "Maria R., RDH — confirmed, 9:15 AM" — and Maria is already walking through the door.', image_prompt: 'Focus racked between phone notification (quoted exactly) in foreground and hygienist entering through sun-flared glass door behind, motion blur on the door edge, flyaways backlit.', motion_prompt: 'Rack focus from the chiming notification to Maria pushing through the door in half slow-motion, flare sweeping. Audio: chime, door swoosh, warm resolve enters.' },
    { idx: 6, image: frameUrls[6], duration: '18–20s', story: 'End card: "The call-out you didn\'t see coming. Covered anyway." — Smile Dental Temps. Vetted coverage, same morning.', image_prompt: 'Premium print-ad typography on navy, cream serif with ink bleed, gold rule + tooth mark, film grain + paper texture, exact copy quoted.', motion_prompt: 'Type settles with a fade-up, gradient breathes once. Audio: inverted-buzz brand chime, clean silence.' },
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
if (existsSync('scripts/publish_storyboard_647_v3_tmp.mjs')) unlinkSync('scripts/publish_storyboard_647_v3_tmp.mjs')
