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
const BEATS = [0, 1.5, 3.7, 5.5, 7.0]

function drawType(c: C, t: number, p: AdProps, opts: { watermark?: boolean } = {}) {
  const W = AD_W, HH = AD_H, X = 76, TW = W - X * 2
  c.save(); c.textBaseline = 'alphabetic'
  let b = 0; for (let i = 0; i < BEATS.length; i++) if (t >= BEATS[i]) b = i
  const bg = [p.brand, PAPER, NIGHT, p.brand, PAPER], fg = ['#fff', NIGHT, '#fff', '#fff', NIGHT]
  // the colour of the beat before, then the new colour wiping up over it
  c.fillStyle = bg[Math.max(0, b - 1)]; c.fillRect(0, 0, W, HH)
  const wipe = b === 0 ? 1 : expo(seg(t, BEATS[b], BEATS[b] + 0.36))
  c.fillStyle = bg[b]; c.fillRect(0, HH * (1 - wipe), W, HH * wipe)
  const k = seg(t, BEATS[b] + (b ? 0.14 : 0.05), BEATS[b] + 1.05)   // how far into this beat's entrance we are
  const ink = fg[b], soft = b === 1 || b === 4 ? 'rgba(11,11,15,.55)' : 'rgba(255,255,255,.72)'
  const accent = b === 1 || b === 4 ? p.brand : '#fff'
  const label = (s: string, y: number) => { c.globalAlpha = seg(k, 0, 0.25); c.fillStyle = soft; font(c, 800, 40); c.textAlign = 'left'; c.fillText(s.toUpperCase().split('').join(' '), X, y); c.globalAlpha = 1; c.fillStyle = ink }
  // agency name, top of every beat
  c.globalAlpha = seg(t, 0.1, 0.5); c.fillStyle = soft; fit(c, p.agency.toUpperCase(), X, 190, TW, 800, 42); c.globalAlpha = 1
  c.fillStyle = ink
  const week = p.rate ? money(p.rate * p.hours) : ''
  if (b === 0) {
    // "now hiring" tag, then the job title
    const tk = pop(seg(k, 0, 0.3)); c.save(); c.translate(X, 660); c.scale(tk, tk); rr(c, 0, -62, 400, 86, 43); c.fillStyle = '#fff'; c.fill(); c.fillStyle = p.brand; font(c, 900, 44); c.textAlign = 'center'; c.fillText('NOW HIRING', 200, -2); c.restore()
    c.fillStyle = ink; const L = layout(c, p.title, TW, 900, 250, 4); rise(c, L.lines, L.size, 900, X, 770, seg(k, 0.12, 1))
  } else if (b === 1) {
    if (p.rate) {
      label('Pays', 640)
      const n = p.rate * expo(seg(t, BEATS[1] + 0.2, BEATS[1] + 1.0)); const txt = Number.isInteger(p.rate) ? `$${Math.round(n)}` : `$${n.toFixed(2)}`
      c.fillStyle = accent; c.globalAlpha = seg(k, 0, 0.2); const full = rateText(p.rate); let size = 400; font(c, 900, size); while (c.measureText(full).width > TW && size > 120) { size -= 10; font(c, 900, size) }
      c.textAlign = 'left'; c.fillText(txt, X - 8, 680 + size * 0.86)
      c.fillStyle = ink; c.globalAlpha = seg(k, 0.3, 0.55); font(c, 800, 96); c.fillText('an hour', X, 680 + size * 0.86 + 130)
      const yb = 680 + size * 0.86 + 230, bk = pop(seg(k, 0.5, 0.85)); c.globalAlpha = seg(k, 0.5, 0.7)
      c.save(); c.translate(X, yb + 70); c.scale(bk, bk); rr(c, 0, -70, TW, 140, 28); c.fillStyle = NIGHT; c.fill(); c.fillStyle = '#fff'; fit(c, `${week} a week`, 44, 22, TW * 0.5, 900, 66)
      c.fillStyle = 'rgba(255,255,255,.7)'; fit(c, `${p.hours} hours, before taxes`, TW - 44, 18, TW * 0.42, 600, 36, 'right'); c.restore(); c.globalAlpha = 1
    } else { label('The job', 640); const L = layout(c, p.note, TW, 900, 150, 4); rise(c, L.lines, L.size, 900, X, 700, k) }
  } else if (b === 2) {
    label('The shift', 640); const parts = p.shift.split(' · ').map((x) => layout(c, x, TW, 900, 190, 2)); const L = { size: Math.min(...parts.map((x) => x.size)), lines: parts.flatMap((x) => x.lines) }; const h = rise(c, L.lines, L.size, 900, X, 700, k)
    c.globalAlpha = seg(k, 0.5, 0.8); c.fillStyle = soft; const N = layout(c, p.note, TW, 700, 64, 3); c.globalAlpha = seg(k, 0.5, 0.8); rise(c, N.lines, N.size, 700, X, 700 + h + 60, 1, 1.2); c.globalAlpha = 1
  } else if (b === 3) {
    const has = !!p.where; label(has ? 'Where' : 'With', 640); const L = layout(c, has ? p.where : p.agency, TW, 900, 220, 3); rise(c, L.lines, L.size, 900, X, 700, k)
  } else {
    // the whole job on one card, and how to apply
    c.fillStyle = ink; const L = layout(c, p.title, TW, 900, 130, 3); const h = rise(c, L.lines, L.size, 900, X, 540, k)
    let y = 540 + h + 50
    if (p.rate) { c.fillStyle = p.brand; c.globalAlpha = seg(k, 0.2, 0.45); font(c, 900, 190); c.textAlign = 'left'; const r = rateText(p.rate); c.fillText(r, X - 4, y + 160); const rw = c.measureText(r).width; c.fillStyle = ink; font(c, 800, 64); c.fillText('/hr', X + rw + 14, y + 160); y += 220 }
    c.globalAlpha = seg(k, 0.3, 0.55); c.fillStyle = ink; fit(c, p.shift, X, y + 60, TW, 700, 56); y += 84
    if (p.where) { c.fillStyle = soft; fit(c, p.where, X, y + 56, TW, 700, 52); y += 78 }
    const bk = pop(seg(k, 0.5, 0.9)); c.globalAlpha = seg(k, 0.5, 0.7); font(c, 900, 62); let size = 62; while (c.measureText(p.cta).width > TW - 100 && size > 32) { size -= 2; font(c, 900, size) }
    c.save(); c.translate(W / 2, y + 150); c.scale(bk, bk); rr(c, -TW / 2, -70, TW, 140, 70); c.fillStyle = p.brand; c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(p.cta, 0, size * 0.35); c.restore(); c.globalAlpha = 1
  }
  // progress: one bar per beat
  const gw = (TW - 4 * 14) / 5
  for (let i = 0; i < 5; i++) { const end = i < 4 ? BEATS[i + 1] : AD_SECONDS; c.globalAlpha = 0.25; c.fillStyle = ink; rr(c, X + i * (gw + 14), 1760, gw, 10, 5); c.fill(); c.globalAlpha = 0.9; const f = seg(t, BEATS[i], end); if (f > 0) { rr(c, X + i * (gw + 14), 1760, Math.max(10, gw * f), 10, 5); c.fill() } }
  c.globalAlpha = 0.5; c.fillStyle = ink; fit(c, 'made with montero.cool', W / 2, HH - 70, 600, 500, 30, 'center')
  if (opts.watermark) {
    c.globalAlpha = 0.08; c.translate(W / 2, HH / 2); c.rotate(-0.5)
    for (let i = -2; i <= 2; i++) fit(c, 'PREVIEW · montero.cool · PREVIEW · montero.cool', i % 2 ? 260 : 0, i * 470, 3000, 900, 84, 'center')
  }
  c.restore()
}

export function drawAd(c: C, t: number, p: AdProps, opts: { watermark?: boolean } = {}) {
  if (p.style === 'type') drawType(c, t, p, opts); else drawAlert(c, t, p, opts)
}
