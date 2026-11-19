// The "payday alert" job ad, drawn on a canvas so it plays and records in the visitor's own browser (no server render).
// A phone lock screen on payday: one notification a second gives the pay, the job, the shift and how to apply.
export type AdProps = { agency: string; title: string; rate: number | null; hours: number; shift: string; where: string; note: string; cta: string; brand: string; style?: 'alert' | 'type' }
export const AD_W = 1080, AD_H = 1920, AD_SECONDS = 9
export const SAMPLE: AdProps = { agency: 'Your Agency', title: 'Maintenance Mechanic', rate: 30, hours: 40, shift: 'Mon to Fri · 3:00 to 11:30 PM', where: '2nd shift', note: 'Hiring now. Experience needed.', cta: 'Apply at youragency.com', brand: '#1E3FFF' }

const F = "'Inter Tight', system-ui, Arial, sans-serif"
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const seg = (x: number, a: number, b: number) => clamp((x - a) / (b - a), 0, 1)
const expo = (x: number) => 1 - Math.pow(1 - x, 4)
const pop = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const rateText = (r: number) => (Number.isInteger(r) ? `$${r}` : `$${r.toFixed(2)}`)
export function cleanProps(p: Partial<AdProps>): AdProps {
  const s = (v: unknown, max: number, d: string) => (String(v ?? '').replace(/[\r\n<>]/g, ' ').trim().slice(0, max) || d)
  const rate = Number(p.rate); const hours = Number(p.hours)
  return {
    agency: s(p.agency, 40, SAMPLE.agency), title: s(p.title, 48, 'Now hiring'), rate: rate > 0 && rate < 1000 ? Math.round(rate * 100) / 100 : null,
    hours: hours >= 1 && hours <= 80 ? Math.round(hours) : 40, shift: s(p.shift, 46, 'Full time'), where: s(p.where, 40, ''), note: s(p.note, 60, 'Hiring now.'),
    cta: s(p.cta, 44, 'Apply today'), brand: /^#[0-9a-fA-F]{6}$/.test(String(p.brand)) ? String(p.brand) : SAMPLE.brand, style: p.style === 'type' ? 'type' : 'alert',
  }
}

type C = CanvasRenderingContext2D
const font = (c: C, w: number, px: number) => { c.font = `${w} ${px}px ${F}` }
// Draws text, shrinking it until it fits the width given.
function fit(c: C, text: string, x: number, y: number, w: number, weight: number, px: number, align: CanvasTextAlign = 'left') {
  let size = px; font(c, weight, size)
  while (c.measureText(text).width > w && size > px * 0.45) { size -= 2; font(c, weight, size) }
  c.textAlign = align; c.fillText(text, x, y); return size
}
function wrap(c: C, text: string, x: number, y: number, w: number, weight: number, px: number, lh: number) {
  font(c, weight, px); c.textAlign = 'center'
  const words = text.split(' '); const lines: string[] = []; let line = ''
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > w && line) { lines.push(line); line = wd } else line = t }
  if (line) lines.push(line)
  lines.forEach((l, i) => c.fillText(l, x, y + i * lh)); return lines.length * lh
}
function rr(c: C, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.roundRect(x, y, w, h, r) }

const T = [0.5, 1.9, 3.2, 4.5], END = 6.3, H = [250, 200, 200, 200], GAP = 22, TOP = 700

function drawAlert(c: C, t: number, p: AdProps, opts: { watermark?: boolean } = {}) {
  const W = AD_W, HH = AD_H
  c.save(); c.textBaseline = 'alphabetic'
  // wallpaper
  c.fillStyle = '#05060f'; c.fillRect(0, 0, W, HH)
  const g = c.createRadialGradient(W * 0.3, 0, 0, W * 0.3, 0, HH * 0.75)
  g.addColorStop(0, p.brand); g.addColorStop(0.62, '#0a0d24'); g.addColorStop(1, '#05060f')
  c.fillStyle = g; c.fillRect(0, 0, W, HH)

  const end = expo(seg(t, END + 0.13, END + 0.67))
  // clock
  c.globalAlpha = 1 - end; c.fillStyle = '#fff'
  c.globalAlpha = (1 - end) * seg(t, 0, 0.17); fit(c, 'Your phone, next Friday.', W / 2, 215, 960, 800, 60, 'center')
  c.globalAlpha = (1 - end) * 0.8; fit(c, 'Friday', W / 2, 318, 900, 600, 46, 'center')
  c.globalAlpha = 1 - end; fit(c, '6:02', W / 2, 545, 1000, 800, 250, 'center')

  const week = p.rate ? p.rate * p.hours : 0
  const rt = p.rate ? rateText(p.rate) : ''
  const cards = [
    p.rate ? { app: 'Payroll', big: money(week * expo(seg(t, T[0] + 0.13, T[0] + 0.73))), body: `week 1 · ${p.hours} hrs × ${rt}, before taxes` } : { app: p.agency, title: 'Now hiring', body: p.title },
    { app: p.agency, title: p.title, body: [p.rate ? `${rt} an hour` : '', p.where].filter(Boolean).join(' · ') || 'Open now' },
    { app: 'Schedule', title: p.shift, body: p.note },
    { app: p.agency, title: 'This could be your Friday.', body: p.cta, accent: true },
  ] as { app: string; title?: string; big?: string; body: string; accent?: boolean }[]
  cards.forEach((k, i) => {
    if (t < T[i]) return
    const inn = expo(seg(t, T[i], T[i] + 0.4)), out = expo(seg(t, END, END + 0.4))
    let y = TOP
    for (let j = i + 1; j < T.length; j++) y += (H[j] + GAP) * expo(seg(t, T[j], T[j] + 0.4))
    y = y - (1 - inn) * 90 + out * 60
    const a = seg(t, T[i], T[i] + 0.17) * (1 - out); if (a <= 0) return
    const sc = 0.9 + 0.1 * pop(seg(t, T[i], T[i] + 0.33))
    c.save(); c.globalAlpha = a; c.translate(W / 2, y + H[i] / 2); c.scale(sc, sc); c.translate(-W / 2, -(y + H[i] / 2))
    const x = 44, w = W - 88
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 50; c.shadowOffsetY = 20
    rr(c, x, y, w, H[i], 44); c.fillStyle = k.accent ? p.brand : 'rgba(255,255,255,.16)'; c.fill()
    c.shadowColor = 'transparent'; c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,.22)'; c.stroke()
    rr(c, x + 38, y + 30, 54, 54, 14); c.fillStyle = k.accent ? '#fff' : p.brand; c.fill()
    c.fillStyle = k.accent ? p.brand : '#fff'; fit(c, k.app[0].toUpperCase(), x + 65, y + 69, 50, 900, 32, 'center')
    c.fillStyle = '#fff'; c.globalAlpha = a * 0.85; fit(c, k.app.toUpperCase(), x + 110, y + 68, w - 260, 600, 32)
    c.globalAlpha = a * 0.7; fit(c, 'now', x + w - 38, y + 68, 100, 500, 30, 'right')
    c.globalAlpha = a
    if (k.big) {
      font(c, 900, 92); c.textAlign = 'left'; c.fillText(k.big, x + 38, y + 190)
      const bw = c.measureText(money(week)).width
      c.globalAlpha = a * 0.8; fit(c, k.body, x + 38 + bw + 22, y + 186, w - 76 - bw - 22, 600, 34)
    } else {
      fit(c, k.title || '', x + 38, y + 128, w - 76, 800, 50)
      c.globalAlpha = a * 0.85; fit(c, k.body, x + 38, y + 172, w - 76, 500, 36)
    }
    c.restore()
  })

  // the pay takes over the screen
  if (end > 0) {
    const sc = 0.88 + 0.12 * end
    c.save(); c.globalAlpha = end; c.translate(W / 2, HH / 2); c.scale(sc, sc); c.translate(-W / 2, -HH / 2); c.fillStyle = '#fff'
    c.globalAlpha = end * 0.85; fit(c, `${p.title} · ${p.agency}`, W / 2, 700, 960, 600, 54, 'center')
    c.globalAlpha = end
    let y = 930
    if (p.rate) {
      fit(c, money(week), W / 2, y, 980, 900, 230, 'center')
      c.globalAlpha = end * 0.9; y += 84; fit(c, `a week at ${rt}/hr for ${p.hours} hours, before taxes`, W / 2, y, 960, 600, 48, 'center'); y += 62
    } else {
      y = 800; y += wrap(c, p.title, W / 2, y + 90, 960, 900, 120, 128) + 60
    }
    c.globalAlpha = end * 0.8; fit(c, p.shift, W / 2, y + 30, 940, 500, 44, 'center')
    const bs = 0.9 + 0.1 * pop(seg(t, END + 0.53, END + 1))
    font(c, 800, 54); let size = 54; while (c.measureText(p.cta).width > 820 && size > 30) { size -= 2; font(c, 800, size) }
    const bw = c.measureText(p.cta).width + 120, by = y + 110
    c.globalAlpha = end; c.save(); c.translate(W / 2, by + 57); c.scale(bs, bs); c.translate(-W / 2, -(by + 57))
    rr(c, (W - bw) / 2, by, bw, 114, 57); c.fillStyle = '#fff'; c.fill()
    c.fillStyle = p.brand; c.textAlign = 'center'; c.fillText(p.cta, W / 2, by + 57 + size * 0.35)
    c.restore(); c.restore()
  }
  // small credit on every free video
  c.globalAlpha = 0.5; c.fillStyle = '#fff'; fit(c, 'made with montero.cool', W / 2, HH - 70, 600, 500, 30, 'center')
  if (opts.watermark) {
    c.globalAlpha = 0.1; c.translate(W / 2, HH / 2); c.rotate(-0.5)
    for (let i = -2; i <= 2; i++) fit(c, 'PREVIEW · montero.cool · PREVIEW · montero.cool', i % 2 ? 260 : 0, i * 470, 3000, 900, 84, 'center')
  }
  c.restore()
}

// ---- the "one fact per beat" job ad: big type, a colour wipe between beats. Job, pay, shift, place, apply. ----
const PAPER = '#f6f3ec', NIGHT = '#0b0b0f'
// Breaks text into lines at the biggest size (from `max` down) that fits `maxLines` lines of width `w`.
function layout(c: C, text: string, w: number, weight: number, max: number, maxLines: number) {
  for (let size = max; size >= 44; size -= 6) {
    font(c, weight, size)
    const lines: string[] = []; let line = ''
    for (const wd of text.split(' ')) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > w && line) { lines.push(line); line = wd } else line = t }
    if (line) lines.push(line)
    if (lines.length <= maxLines && lines.every((l) => c.measureText(l).width <= w)) return { size, lines }
  }
  font(c, weight, 44); return { size: 44, lines: [text] }
}
// Draws laid-out lines from the top `y`, each sliding up a beat after the one before. `k` is 0..1 progress.
function rise(c: C, lines: string[], size: number, weight: number, x: number, y: number, k: number, lh = 1.04) {
  font(c, weight, size); c.textAlign = 'left'; const base = c.globalAlpha
  lines.forEach((l, i) => { const p = expo(seg(k, i * 0.14, 0.5 + i * 0.14)); c.globalAlpha = base * p; c.fillText(l, x, y + size * 0.82 + i * size * lh + (1 - p) * 70) })
  c.globalAlpha = base; return lines.length * size * lh
}

// ---- the kinetic job ad: dark stage, coloured glow, words that fly in with motion blur and turn into things ----
// Job title (last word boxed), pay that counts up and becomes a weekly pill, a clock for the shift, a pin for the town, a button that gets tapped.
const KB = [0, 1.6, 3.6, 5.2, 6.5]
const outQ = (x: number) => 1 - Math.pow(1 - x, 5)
// Text drawn several times along its path, so fast moves smear like motion blur.
function smear(c: C, text: string, x: number, y: number, dx: number, dy: number, alpha: number) {
  const n = Math.abs(dx) + Math.abs(dy) > 6 ? 7 : 1
  for (let i = n - 1; i >= 0; i--) { c.globalAlpha = alpha * (i === 0 ? 1 : 0.16 * (1 - i / n)); c.fillText(text, x + (dx * i) / n, y + (dy * i) / n) }
  c.globalAlpha = 1
}
// Lays words out in lines, then brings them in one at a time from the right. Returns the block height and the last word's box.
function words(c: C, text: string, x: number, y: number, w: number, weight: number, max: number, maxLines: number, k: number, color: string, boxLast?: string) {
  const L = layout(c, text, w, weight, max, maxLines); font(c, weight, L.size); c.textAlign = 'left'
  const all = L.lines.flatMap((l, li) => { let cx = x; return l.split(' ').map((wd) => { const o = { wd, x: cx, y: y + L.size * 0.82 + li * L.size * 1.03 }; cx += c.measureText(wd + ' ').width; return o }) })
  const step = Math.min(0.16, 0.7 / all.length)
  all.forEach((o, i) => {
    const p = outQ(seg(k, i * step, i * step + 0.34)); if (p <= 0) return
    const last = i === all.length - 1 && boxLast
    if (last) { const bw = c.measureText(o.wd).width, g = outQ(seg(k, i * step + 0.2, i * step + 0.5)); c.globalAlpha = 1; c.fillStyle = boxLast as string; rr(c, o.x - 16, o.y - L.size * 0.82, (bw + 32) * g, L.size * 1.04, 14); c.fill() }
    c.fillStyle = color; smear(c, o.wd, o.x + (1 - p) * 260, o.y, (1 - p) * 190, 0, Math.min(1, p * 1.6))
  })
  return L.lines.length * L.size * 1.03
}
function stage(c: C, t: number, brand: string) {
  const W = AD_W, HH = AD_H
  c.fillStyle = '#06070b'; c.fillRect(0, 0, W, HH)
  const blob = (x: number, y: number, r: number, a: number) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, brand); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2) }
  blob(W * 0.2 + Math.sin(t * 0.5) * 160, HH * 0.24 + Math.cos(t * 0.4) * 120, 900, 0.55)
  blob(W * 0.86 + Math.cos(t * 0.45) * 140, HH * 0.8 + Math.sin(t * 0.37) * 150, 820, 0.42)
  c.globalAlpha = 1
}

function drawType(c: C, t: number, p: AdProps, opts: { watermark?: boolean } = {}) {
  const W = AD_W, HH = AD_H, X = 84, TW = W - X * 2
  c.save(); c.textBaseline = 'alphabetic'; stage(c, t, p.brand)
  let b = 0; for (let i = 0; i < KB.length; i++) if (t >= KB[i]) b = i
  const end = b < 4 ? KB[b + 1] : AD_SECONDS + 1
  const u = t - KB[b], out = b < 4 ? Math.pow(seg(t, end - 0.2, end), 2) : 0
  const k = seg(u, 0.04, 1.25)
  // giant outlined words drift across the lower half: the frame is full and never still
  const ghost = [p.title, p.rate ? `${rateText(p.rate)} an hour` : p.title, p.shift.split(' · ')[0], p.where || p.agency, 'Apply today'][b].toUpperCase() + '  ·  '
  c.save(); c.globalAlpha = 0.16 * seg(u, 0, 0.3) * (1 - out); c.strokeStyle = '#fff'; c.lineWidth = 3; font(c, 900, 300); c.textAlign = 'left'
  const gw = Math.max(400, c.measureText(ghost).width)
  for (let row = 0; row < 2; row++) { const off = ((t * (row ? -150 : 190)) % gw + gw) % gw; for (let x = -off; x < W; x += gw) c.strokeText(ghost, x, 1330 + row * 290) }
  c.restore()
  // agency name stays put
  c.fillStyle = 'rgba(255,255,255,.7)'; c.globalAlpha = seg(t, 0.1, 0.5); font(c, 800, 40); c.textAlign = 'left'; c.fillText(p.agency.toUpperCase().split('').join(' '), X, 196); c.globalAlpha = 1
  // a slow push-in and a slight tilt, so nothing is ever still; each beat leaves upward with a smear
  c.save(); c.translate(W / 2, HH / 2); c.rotate(-0.028 + u * 0.004); const z = 1 + u * 0.018; c.scale(z, z); c.translate(-W / 2, -HH / 2 - out * 520)
  const A = 1 - out
  const tag = (s: string, y: number) => { c.globalAlpha = A * seg(k, 0, 0.2); c.fillStyle = p.brand; c.shadowColor = p.brand; c.shadowBlur = 30; font(c, 900, 44); c.textAlign = 'left'; c.fillText(s.toUpperCase().split('').join(' '), X, y); c.shadowBlur = 0; c.fillStyle = '#fff'; c.globalAlpha = A }
  c.globalAlpha = A
  if (b === 0) {
    const tk = pop(seg(k, 0, 0.26)); c.save(); c.translate(X, 700); c.scale(tk, tk); c.shadowColor = p.brand; c.shadowBlur = 50; rr(c, 0, -64, 410, 90, 45); c.fillStyle = p.brand; c.fill(); c.shadowBlur = 0; c.fillStyle = '#fff'; font(c, 900, 44); c.textAlign = 'center'; c.fillText('NOW HIRING', 205, -3); c.restore()
    const th = words(c, p.title, X, 800, TW, 900, 230, 4, seg(k, 0.14, 1), '#fff', p.brand)
    const chips = [p.rate ? `${rateText(p.rate)}/hr` : '', p.where].filter(Boolean); let cx = X; font(c, 800, 50)
    chips.forEach((s2, i) => { const g = outQ(seg(u, 0.75 + i * 0.14, 1.15 + i * 0.14)); if (g <= 0) return; const w2 = c.measureText(s2).width + 64; c.globalAlpha = A * g; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; rr(c, cx + (1 - g) * 120, 800 + th + 44, w2, 92, 46); c.stroke(); c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(s2, cx + 32 + (1 - g) * 120, 800 + th + 44 + 63); cx += w2 + 22 })
    c.globalAlpha = A
  } else if (b === 1) {
    if (p.rate) {
      tag('Pays', 690)
      const cu = outQ(seg(u, 0.12, 1.0)), n = p.rate * cu; const txt = Number.isInteger(p.rate) ? `$${Math.round(n)}` : `$${n.toFixed(2)}`
      const full = rateText(p.rate); let size = 420; font(c, 900, size); while (c.measureText(full).width > TW && size > 120) { size -= 10; font(c, 900, size) }
      const land = pop(seg(u, 0.95, 1.25)); c.save(); c.translate(X, 740 + size * 0.86); c.scale(0.92 + 0.08 * land, 0.92 + 0.08 * land)
      c.shadowColor = p.brand; c.shadowBlur = 40 + 60 * seg(u, 0.9, 1.1) * (1 - seg(u, 1.1, 1.6)); c.fillStyle = '#fff'; c.textAlign = 'left'; smear(c, txt, -6, 0, 0, (1 - cu) * -150, A * seg(u, 0.05, 0.25)); c.restore(); c.shadowBlur = 0
      const bu = seg(u, 0.95, 1.5); if (bu > 0 && bu < 1) { c.globalAlpha = A * (1 - bu); c.strokeStyle = p.brand; c.lineWidth = 8; c.lineCap = 'round'; const bx = X + c.measureText(full).width / 2, byy = 740 + size * 0.5; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r0 = size * 0.9 + outQ(bu) * 150, r1 = r0 + 70 * (1 - bu); c.beginPath(); c.moveTo(bx + Math.cos(a) * r0 * 1.5, byy + Math.sin(a) * r0 * 0.6); c.lineTo(bx + Math.cos(a) * r1 * 1.5, byy + Math.sin(a) * r1 * 0.6); c.stroke() } c.lineCap = 'butt' }
      c.globalAlpha = A * seg(u, 0.5, 0.75); c.fillStyle = 'rgba(255,255,255,.8)'; font(c, 800, 92); c.fillText('an hour', X, 740 + size * 0.86 + 128)
      // the weekly figure draws itself as a pill
      const yb = 740 + size * 0.86 + 220, d = outQ(seg(u, 1.05, 1.6)); if (d > 0) {
        c.globalAlpha = A; c.lineWidth = 5; c.strokeStyle = p.brand; c.shadowColor = p.brand; c.shadowBlur = 24; rr(c, X, yb, TW * d, 150, 75); c.stroke(); c.shadowBlur = 0
        c.globalAlpha = A * seg(u, 1.3, 1.6); c.fillStyle = '#fff'; fit(c, `${money(p.rate * p.hours)} a week`, X + 50, yb + 98, TW * 0.5, 900, 70); c.fillStyle = 'rgba(255,255,255,.65)'; fit(c, `${p.hours} hours, before taxes`, X + TW - 50, yb + 94, TW * 0.4, 600, 36, 'right')
      }
    } else { tag('The job', 690); words(c, p.note, X, 740, TW, 900, 150, 4, k, '#fff') }
  } else if (b === 2) {
    // a clock draws itself; the hands spin and settle on the start time when the posting gives one
    const cx = X + 130, cy = 760, r = 124, ring = outQ(seg(u, 0, 0.6)); const m = /(\d{1,2}):(\d{2})/.exec(p.shift)
    c.lineWidth = 12; c.strokeStyle = '#fff'; c.shadowColor = p.brand; c.shadowBlur = 40; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); c.stroke(); c.shadowBlur = 0
    const spin = m ? (1 - outQ(seg(u, 0.1, 1.1))) * 9 : u * 1.4; const hh = m ? (((+m[1] % 12) + +m[2] / 60) / 12) * Math.PI * 2 : 0, mm = m ? (+m[2] / 60) * Math.PI * 2 : 0
    c.lineCap = 'round'; c.strokeStyle = p.brand; c.lineWidth = 12; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hh + spin) * r * 0.5, cy - Math.cos(hh + spin) * r * 0.5); c.stroke()
    c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(mm + spin * 3) * r * 0.78, cy - Math.cos(mm + spin * 3) * r * 0.78); c.stroke(); c.lineCap = 'butt'
    c.globalAlpha = A * seg(k, 0.1, 0.3); c.fillStyle = p.brand; font(c, 900, 44); c.textAlign = 'left'; c.fillText('THE SHIFT'.split('').join(' '), cx + r + 44, cy + 16); c.globalAlpha = A
    const parts = p.shift.split(' · '); const fitOne = parts.length > 1 ? Math.min(...parts.map((x) => layout(c, x, TW, 900, 170, 1).size)) : 170; const one = fitOne < 110 ? 150 : fitOne
    let y = 960; for (const part of parts) y += words(c, part, X, y, TW, 900, one, parts.length > 1 && fitOne >= 110 ? 1 : 3, seg(k, 0.15, 1), '#fff') + 6
    c.globalAlpha = A * seg(u, 0.8, 1.1); c.fillStyle = 'rgba(255,255,255,.7)'; const N = layout(c, p.note, TW, 700, 60, 3); font(c, 700, N.size); N.lines.forEach((l, i) => c.fillText(l, X, y + 70 + i * N.size * 1.2))
  } else if (b === 3) {
    // a pin drops and the ground ripples
    const has = !!p.where, d = pop(seg(u, 0, 0.42)), px = X + 110, py = 800
    for (let i = 0; i < 2; i++) { const rp = seg(u, 0.32 + i * 0.25, 1.3 + i * 0.25); if (rp > 0 && rp < 1) { c.globalAlpha = A * (1 - rp) * 0.8; c.strokeStyle = p.brand; c.lineWidth = 6; c.beginPath(); c.ellipse(px, py + 6, 60 + rp * 260, 16 + rp * 70, 0, 0, Math.PI * 2); c.stroke() } }
    c.globalAlpha = A; c.save(); c.translate(px, py - (1 - d) * 700); c.shadowColor = p.brand; c.shadowBlur = 50; c.fillStyle = p.brand; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-120, -130, -96, -270, 0, -270); c.bezierCurveTo(96, -270, 120, -130, 0, 0); c.fill(); c.shadowBlur = 0; c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -176, 36, 0, Math.PI * 2); c.fill(); c.restore()
    c.globalAlpha = A * seg(k, 0.15, 0.35); c.fillStyle = p.brand; font(c, 900, 44); c.textAlign = 'left'; c.fillText((has ? 'WHERE' : 'WITH').split('').join(' '), px + 130, py - 150); c.globalAlpha = A
    words(c, has ? p.where : p.agency, X, 900, TW, 900, 210, 3, seg(k, 0.2, 1), '#fff')
  } else {
    // the recap, then a button that grows from a dot, types its own label and gets tapped
    const h = words(c, p.title, X, 520, TW, 900, 124, 3, k, '#fff'); let y = 520 + h + 40
    if (p.rate) { c.globalAlpha = seg(k, 0.25, 0.5); c.shadowColor = p.brand; c.shadowBlur = 40; c.fillStyle = '#fff'; font(c, 900, 200); c.textAlign = 'left'; const r = rateText(p.rate); c.fillText(r, X - 4, y + 168); c.shadowBlur = 0; const rw = c.measureText(r).width; c.fillStyle = 'rgba(255,255,255,.75)'; font(c, 800, 66); c.fillText('/hr', X + rw + 16, y + 168); y += 232 }
    c.globalAlpha = seg(k, 0.35, 0.6); c.fillStyle = '#fff'; fit(c, p.shift, X, y + 60, TW, 700, 56); y += 84
    if (p.where) { c.fillStyle = 'rgba(255,255,255,.65)'; fit(c, p.where, X, y + 56, TW, 700, 52); y += 78 }
    const by = y + 90, g = outQ(seg(u, 0.55, 1.05)), tap = seg(u, 1.55, 1.75), bw = 150 + (TW - 150) * g
    font(c, 900, 62); let size = 62; while (c.measureText(p.cta).width > TW - 110 && size > 32) { size -= 2; font(c, 900, size) }
    c.globalAlpha = seg(u, 0.5, 0.6); const press = 1 - 0.05 * Math.sin(tap * Math.PI)
    c.save(); c.translate(W / 2, by + 75); c.scale(press, press); c.shadowColor = p.brand; c.shadowBlur = 40 + 70 * Math.sin(tap * Math.PI); rr(c, -bw / 2, -75, bw, 150, 75); c.fillStyle = tap > 0.5 ? '#fff' : p.brand; c.fill(); c.shadowBlur = 0
    const typed = p.cta.slice(0, Math.round(p.cta.length * seg(u, 0.95, 1.4))); c.fillStyle = tap > 0.5 ? p.brand : '#fff'; c.textAlign = 'center'; c.fillText(typed, 0, size * 0.35)
    if (typed.length < p.cta.length && typed.length > 0) { const tw2 = c.measureText(typed).width; c.fillRect(tw2 / 2 + 6, -size * 0.45, 5, size * 0.9) }
    c.restore()
    const rp = seg(u, 1.6, 2.3); if (rp > 0 && rp < 1) { c.globalAlpha = (1 - rp) * 0.7; c.strokeStyle = '#fff'; c.lineWidth = 6; rr(c, W / 2 - bw / 2 - rp * 50, by - rp * 50, bw + rp * 100, 150 + rp * 100, 75 + rp * 50); c.stroke() }
    for (let i = 0; i < 2; i++) { const pu = ((u - 2.0 - i * 0.45) % 0.9) / 0.9; if (u > 2.0 + i * 0.45 && pu > 0) { c.globalAlpha = (1 - pu) * 0.45; c.strokeStyle = p.brand; c.lineWidth = 5; rr(c, W / 2 - bw / 2 - pu * 44, by - pu * 44, bw + pu * 88, 150 + pu * 88, 75 + pu * 44); c.stroke() } }
    // the pointer slides in and taps
    const ar = outQ(seg(u, 1.1, 1.55)); if (ar > 0) { const ax = W / 2 + 190 + (1 - ar) * 420, ay = by + 96 + (1 - ar) * 320 - Math.sin(tap * Math.PI) * 10; c.globalAlpha = Math.min(1, ar * 2); c.save(); c.translate(ax, ay); c.scale(1.5, 1.5); c.fillStyle = '#fff'; c.strokeStyle = '#06070b'; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 72); c.lineTo(19, 55); c.lineTo(33, 86); c.lineTo(46, 80); c.lineTo(32, 50); c.lineTo(58, 50); c.closePath(); c.stroke(); c.fill(); c.restore() }
  }
  c.restore(); c.globalAlpha = 0.5; c.fillStyle = '#fff'; fit(c, 'made with montero.cool', W / 2, HH - 70, 600, 500, 30, 'center')
  if (opts.watermark) {
    c.globalAlpha = 0.07; c.translate(W / 2, HH / 2); c.rotate(-0.5)
    for (let i = -2; i <= 2; i++) fit(c, 'PREVIEW · montero.cool · PREVIEW · montero.cool', i % 2 ? 260 : 0, i * 470, 3000, 900, 84, 'center')
  }
  c.restore()
}

export function drawAd(c: C, t: number, p: AdProps, opts: { watermark?: boolean } = {}) {
  if (p.style === 'type') drawType(c, t, p, opts); else drawAlert(c, t, p, opts)
}
