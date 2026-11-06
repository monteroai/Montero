import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { clean, FORMATS, MAX_JOBS, ST, STARTER, type Reel } from '@/lib/recruiting/reel'
import { pinIn } from '@/lib/recruiting/geo'

// The /recruiting reel builder. Takes the chat so far plus the reel on screen, returns a one-line reply and the
// updated reel. Claude reads free text ("forklift guys in Newark, 24 an hour"); if it fails, a line parser takes over.
export const dynamic = 'force-dynamic'

const SYSTEM = `You build short animated hiring reels for staffing and recruiting agencies on montero.cool. The visitor types into a chat box; you update the reel they are watching and reply in one or two short sentences.

The reel shows: the agency name, its website, a brand color, and up to ${MAX_JOBS} open roles pinned on a US map. Each role has a title, city, two-letter state, pay, and a short type (Full-time, Part-time, Temp-to-hire, 1st shift, Hybrid, Contract...).

Rules:
- Only use roles, cities, pay and names the visitor actually gave. Never invent openings or pay. If pay is missing use "Apply today"; if type is missing use "Open now".
- Keep everything from the current reel that the visitor did not ask to change. When they give their own roles for the first time, replace the starter roles completely.
- lon/lat: your best coordinates for that city. US cities only.
- One card per distinct role and city, even when they need several people ("2 CNC machinists" is one card).
- Short role titles (max 30 characters). Pay like "$24/hr", "$65K/yr", "$1,800/wk".
- A color they name becomes a hex brand color dark enough for white text on top.
- If they paste a link to their site or job board, put the domain in site and say in the reply that you can't open links from here, so ask them to paste a few roles.
- Reply plainly, like a helpful person, in at most two short sentences (under 30 words): what changed, then one next tweak to try (their colors, website, a missing pay, another role). Don't list the roles back; they can see them. No emojis, no exclamation marks, no sales talk.
- Three formats: jobmap (all roles pinned on a US map), departures (an airport split-flap board of hot jobs), jobdrop (one role, fast and punchy). Set format only when they ask for a different look; otherwise leave it out.
- Set idea to true when the visitor pitches their own concept or a kind of video these formats don't cover (a story, characters, a testimonial style, a campaign, a series, a different industry angle). Then reply warmly in one sentence that it's a good idea worth building properly, and that a short form is opening so the team can make it with them. Leave the reel as it is.
- If the message has nothing to do with hiring reels, or asks for anything offensive, leave the reel as it is and steer back in one sentence.
Always answer by calling update_reel.`

const TOOL: Anthropic.Tool = {
  name: 'update_reel',
  description: 'Return the full updated reel and the reply to show the visitor.',
  input_schema: {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      agency: { type: 'string' }, site: { type: 'string' }, brand: { type: 'string', description: '#RRGGBB' },
      format: { type: 'string', enum: [...FORMATS] }, idea: { type: 'boolean' },
      jobs: { type: 'array', maxItems: MAX_JOBS, items: { type: 'object', required: ['role', 'city', 'st', 'lon', 'lat', 'pay', 'type'], properties: {
        role: { type: 'string' }, city: { type: 'string' }, st: { type: 'string' }, lon: { type: 'number' }, lat: { type: 'number' }, pay: { type: 'string' }, type: { type: 'string' } } } },
    },
    required: ['reply', 'agency', 'site', 'brand', 'jobs'],
  },
}

// Best-effort limit per warm instance; real abuse protection would sit at the edge.
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600_000)
  list.push(now); hits.set(ip, list)
  return list.length > 40
}

const NAMES = Object.fromEntries(Object.entries(ST).map(([k, v]) => [v.toLowerCase(), k]))
// Fallback: "Forklift Operator, Newark NJ, $24/hr, Full-time" per line. Pins go to the state's centre.
function parseLines(text: string, cur: Reel): Reel | null {
  const jobs = text.split(/\n|;/).map((line) => {
    const parts = line.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length < 2) return null
    let city = '', st = ''
    for (const p of parts.slice(1)) {
      const m = p.match(/^(.+?)\s+([A-Za-z]{2})$/) || p.match(/^([A-Za-z]{2})$/)
      if (m) { st = (m[2] || m[1]).toUpperCase(); city = m[2] ? m[1] : city; if (ST[st]) break }
      if (NAMES[p.toLowerCase()]) { st = NAMES[p.toLowerCase()]; break }
      city = city || p
    }
    if (!ST[st]) return null
    const pay = line.match(/\$\s?[\d.,]+\s?[kK]?(\s?\/\s?\w+)?/)?.[0]?.replace(/\s/g, '') || ''
    const [lon, lat] = pinIn(ST[st], NaN, NaN)
    return { role: parts[0], city: city || ST[st], st, lon, lat, pay, type: '' }
  }).filter(Boolean)
  return jobs.length ? clean({ ...cur, jobs }) : null
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'local'
  if (limited(ip)) return NextResponse.json({ error: 'That’s a lot of drafts for one hour. Send us your email below and we’ll finish it for you.' }, { status: 429 })

  const b = await req.json().catch(() => ({}))
  const cur = clean(b.reel) || STARTER
  const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-10)
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' as const : 'user' as const, content: String(m?.text || '').slice(0, 1200) }))
    .filter((m: { content: string }) => m.content)
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return NextResponse.json({ error: 'Type a few roles first.' }, { status: 400 })
  while (msgs[0].role !== 'user') msgs.shift()
  // The model sees the reel on screen as context on the last turn.
  msgs[msgs.length - 1].content = `Current reel: ${JSON.stringify(cur)}\nStarter roles still showing: ${JSON.stringify(cur.jobs) === JSON.stringify(STARTER.jobs)}\n\nVisitor: ${msgs[msgs.length - 1].content}`

  let out: { reply: string; reel: Reel; idea?: boolean } | null = null
  try {
    const r = await new Anthropic().messages.create({
      model: 'claude-haiku-5-5', max_tokens: 1200, system: SYSTEM, tools: [TOOL], tool_choice: { type: 'tool', name: 'update_reel' }, messages: msgs,
    })
    const use = r.content.find((c) => c.type === 'tool_use') as Anthropic.ToolUseBlock | undefined
    const x = use?.input as any
    const reel = clean(x)
    if (reel) {
      reel.jobs = reel.jobs.map((j) => { const [lon, lat] = pinIn(ST[j.st], j.lon, j.lat); return { ...j, lon, lat } })
      reel.format = FORMATS.includes(x.format) ? x.format : cur.format
      out = { reply: String(x.reply || 'Updated.').slice(0, 400), reel, idea: x.idea === true }
    }
  } catch (e) {
    console.error('recruiting draft', e)
  }
  if (!out) {
    const reel = parseLines(String(b.messages?.at?.(-1)?.text || ''), cur)
    out = reel
      ? { reply: 'Here it is. Add your agency name and colors whenever you like.', reel }
      : { reply: 'Give me one role per line, like: Forklift Operator, Newark NJ, $24/hr', reel: cur }
  }
  return NextResponse.json(out)
}
