'use client'
import { useEffect, useRef, useState } from 'react'
import { AD_W, AD_H, AD_SECONDS, SAMPLE, cleanProps, drawAd, type AdProps } from '@/lib/make/ad'

// The job video maker. mode "make": paste a posting, check the details, ask for the file.
// mode "made": the same page opened with one agency's job already filled in. mode "file": the emailed link, where the file is saved.
type Mode = 'make' | 'made' | 'file'
const ink = '#1d1a16', muted = '#5c5448', paper = '#f7f3ea', line = '#cfc7b8', blue = '#1e3fff', red = '#b83227'
const box = { width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', borderRadius: 10, border: `1px solid ${line}`, font: '16px Arial, Helvetica, sans-serif', background: '#fff', color: ink }
const lab = { display: 'grid', gap: 5, font: '600 13px Arial, Helvetica, sans-serif', color: muted }
const btn = (bg = ink, fg = '#fff') => ({ padding: '15px 22px', borderRadius: 999, border: 0, background: bg, color: fg, font: '700 17px Arial, Helvetica, sans-serif', cursor: 'pointer', width: '100%' })
const h1 = { font: '800 32px/1.1 Arial, Helvetica, sans-serif', margin: 0, letterSpacing: '-0.5px' }
const FIELDS: [keyof AdProps, string, string][] = [['title', 'Job title', 'Forklift Operator'], ['agency', 'Agency name', 'Your Agency'], ['shift', 'Shift', 'Mon to Fri · 7:00 to 3:30 PM'], ['where', 'Town or shift name', 'Columbus, OH'], ['note', 'One short note', 'Hiring now. Temp to hire.'], ['cta', 'Where to apply', 'Apply at youragency.com']]

export default function Maker({ mode, initial, from = 'video page', madeFor }: { mode: Mode; initial?: AdProps; from?: string; madeFor?: string }) {
  const [p, setP] = useState<AdProps>(initial || SAMPLE)
  const [stage, setStage] = useState<'paste' | 'edit'>(initial ? 'edit' : 'paste')
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('')
  const [email, setEmail] = useState(''); const [claim, setClaim] = useState<'' | 'ask' | 'sent' | 'used' | 'down'>('')
  const [file, setFile] = useState<{ url: string; ext: string } | null>(null); const [rec, setRec] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null), props = useRef(p), t0 = useRef(0), hold = useRef(false), editRef = useRef<HTMLDivElement>(null)
  props.current = p

  useEffect(() => {
    let raf = 0, alive = true
    const fonts = [500, 600, 800, 900].map((w) => new FontFace('Inter Tight', `url(/fonts/InterTight-${w}.woff2)`, { weight: String(w) }))
    Promise.all(fonts.map((f) => f.load().then((x) => document.fonts.add(x)).catch(() => null))).finally(() => { t0.current = performance.now() })
    t0.current = performance.now()
    const tick = (now: number) => {
      if (!alive) return
      const c = canvas.current?.getContext('2d')
      if (c) {
        let t = (now - t0.current) / 1000
        const fixed = (window as unknown as { __t?: number }).__t; if (typeof fixed === 'number') t = fixed
        if (!hold.current && t > AD_SECONDS + 1.5) { t0.current = now; t = 0 }
        drawAd(c, Math.min(t, AD_SECONDS), props.current, { watermark: mode !== 'file' })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { alive = false; cancelAnimationFrame(raf) }
  }, [mode])

  const set = (k: keyof AdProps, v: string) => { setP((o) => ({ ...o, [k]: k === 'rate' ? (v === '' ? null : Number(v)) : k === 'hours' ? Number(v) || 40 : v })); t0.current = performance.now() - (k === 'cta' ? 6500 : 0) }

  async function read() {
    if (input.trim().length < 8) { setMsg('Paste the link to a job posting, or the text of the posting itself.'); return }
    setBusy(true); setMsg('')
    try {
      const r = await fetch('/api/video/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input }) })
      const j = await r.json()
      if (!r.ok) setMsg(j.error === 'list' ? 'That page lists several jobs. Open one posting and paste its link, or copy the text of one job and paste it here.' : j.error === 'none' ? 'We could not find a job posting with pay on that page. Copy the text of the posting and paste it here instead.' : j.error === 'blocked' ? 'That site would not let us read the page. Copy the text of the posting and paste it here instead.' : j.error === 'link' ? 'That link does not look right. Check it, or paste the text of the posting.' : 'Paste the link to a job posting, or the text of the posting itself.')
      else {
        setP((o) => cleanProps({ ...j, brand: o.brand })); setStage('edit'); t0.current = performance.now()
        setMsg(j.missing?.length ? `We could not find the ${j.missing.length > 1 ? j.missing.slice(0, -1).join(', ') + ' or ' + j.missing.slice(-1) : j.missing[0]} in that posting. Fill ${j.missing.length > 1 ? 'them' : 'it'} in below.` : 'Check the details below. Anything you change shows in the video right away.')
        setTimeout(() => editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
    } catch { setMsg('Something went wrong on our side. Try again in a minute.') }
    setBusy(false)
  }

  async function send() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setMsg('Enter the email where we should send your video.'); return }
    if (!p.agency.trim() || p.agency === 'Your Agency' || !p.cta.trim() || p.cta === 'Apply today' || p.cta === 'Apply at youragency.com') { setMsg('Add your agency name and where to apply first, so the video is ready to post.'); return }
    setBusy(true); setMsg('')
    try {
      const r = await fetch('/api/video/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, props: cleanProps(p), from }) })
      const j = await r.json(); setClaim(j.used ? 'used' : j.ok ? 'sent' : 'down')
    } catch { setClaim('down') }
    setBusy(false)
  }

  function save() {
    const cv = canvas.current; if (!cv || rec) return
    const mime = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m))
    if (!mime) { setMsg('This browser cannot save video. Open this link in Chrome or Safari, or reply to our email and we will send the file.'); return }
    const chunks: Blob[] = []; const r = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: 8_000_000 })
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    r.onstop = () => { hold.current = false; setRec(false); setFile({ url: URL.createObjectURL(new Blob(chunks, { type: mime.split(';')[0] })), ext: mime.includes('mp4') ? 'mp4' : 'webm' }) }
    hold.current = true; setRec(true); setFile(null); t0.current = performance.now(); r.start()
    setTimeout(() => r.stop(), (AD_SECONDS + 0.4) * 1000)
  }

  const name = `${p.agency}-${p.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'job-video'
  const caption = `${p.title}${p.rate ? `, $${p.rate} an hour` : ''}${p.where ? `, ${p.where}` : ''}. ${p.shift}. ${p.cta}`

  const claimBlock = (<>
            {claim === '' && <button type="button" onClick={() => setClaim('ask')} style={btn(blue)}>Get the video file, free</button>}
            {(claim === 'ask' || claim === 'down') && (
              <div style={{ display: 'grid', gap: 10, background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: 14 }}>
                <label style={lab}>Where should we send it?<input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@youragency.com" style={box} /></label>
                <button type="button" onClick={send} disabled={busy} style={btn(blue)}>{busy ? 'Sending…' : 'Email me the video'}</button>
                <p style={{ margin: 0, fontSize: 13, color: muted }}>One free video per company. We send one email with your link and nothing else unless you reply.</p>
                {claim === 'down' && <p style={{ margin: 0, color: red }}>We could not send it just now. Email ai@montero.cool and we will send your video by hand.</p>}
              </div>
            )}
            {claim === 'sent' && <div role="status" style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: 16 }}><b>Check your email.</b> The link to your video is on its way to {email} and should arrive within a minute or two.</div>}
            {claim === 'used' && <div role="status" style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: 16 }}><b>Your company already had its free video.</b> A new ad every week is $50 a month. <a href="/weekly" style={{ color: blue }}>See how it works</a>, or reply to the email we sent and tell us how the first one did.</div>}
  </>)

  return (
    <main style={{ minHeight: '100vh', background: paper, color: ink, font: '16px/1.5 Arial, Helvetica, sans-serif', padding: '30px 18px 60px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto', display: 'grid', gap: 18 }}>
        {mode === 'make' && <><h1 style={h1}>Paste a job posting. Get a video ad.</h1><p style={{ margin: 0, color: muted }}>It takes about ten seconds, and your first video is free.</p></>}
        {mode === 'made' && <><h1 style={h1}>{madeFor ? `${madeFor}, this ad is already made.` : 'This ad is already made.'}</h1><p style={{ margin: 0, color: muted }}>We built it from your own posting. Change anything below, or paste a different posting to make another.</p></>}
        {mode === 'file' && <><h1 style={h1}>Your video is ready.</h1><p style={{ margin: 0, color: muted }}>Press the button and it saves to this device in about ten seconds.</p></>}

        {mode === 'make' && stage === 'paste' && (
          <div style={{ display: 'grid', gap: 10 }}>
            <label style={lab}>Link to the posting, or the posting text
              <textarea id="posting" value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="youragency.com/jobs/forklift-operator" style={{ ...box, resize: 'vertical' }} /></label>
            <button type="button" onClick={read} disabled={busy} style={btn(blue)}>{busy ? 'Reading the posting…' : 'Make my video'}</button>
          </div>
        )}
        {msg && <p role="status" style={{ margin: 0, color: /could not|wrong|not look|would not|cannot|Enter|Paste|lists several|Add your/.test(msg) ? red : muted }}>{msg}</p>}

        <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <canvas ref={canvas} width={AD_W} height={AD_H} aria-label={`Video ad for ${p.title}`} style={{ width: '100%', maxWidth: 300, aspectRatio: '9 / 16', borderRadius: 22, background: '#05060f', boxShadow: '0 18px 44px rgba(29,26,22,.28)' }} />
          <p style={{ margin: 0, font: '13px Arial, Helvetica, sans-serif', color: muted }}>{mode === 'file' ? `${p.title} · ${AD_SECONDS} seconds` : stage === 'paste' ? 'An example. Yours will use your posting.' : 'Preview. The file you get has no watermark.'}</p>
        </div>

        {mode === 'file' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {!file && <button type="button" onClick={save} disabled={rec} style={btn(blue)}>{rec ? 'Making your file, about ten seconds…' : 'Save the video'}</button>}
            {file && <a href={file.url} download={`${name}.${file.ext}`} style={{ ...btn(blue), textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>Download {name}.{file.ext}</a>}
            {file && file.ext === 'webm' && <p style={{ margin: 0, color: muted, fontSize: 14 }}>This browser saves in a format Instagram does not take. Open this same link in Chrome or Safari for an MP4, or reply to our email and we will send it.</p>}
            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 12, padding: 14 }}><div style={{ ...lab, marginBottom: 4 }}>Caption to post with it</div>{caption}</div>
            <p style={{ margin: 0, color: muted }}>Want a new one every week? <a href="/weekly" style={{ color: blue }}>See how it works</a>, or <a href="/video" style={{ color: blue }}>make another</a>.</p>
          </div>
        )}

        {mode === 'made' && <div style={{ display: 'grid', gap: 12 }}>{claimBlock}<p style={{ margin: '6px 0 0', font: '700 15px Arial, Helvetica, sans-serif' }}>Want to change something first?</p></div>}
        {mode !== 'file' && stage === 'edit' && (
          <div ref={editRef} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={lab}>Pay per hour ($)<input id="rate" inputMode="decimal" value={p.rate ?? ''} onChange={(e) => set('rate', e.target.value.replace(/[^\d.]/g, ''))} placeholder="22" style={box} /></label>
              <label style={lab}>Hours a week<input id="hours" inputMode="numeric" value={p.hours} onChange={(e) => set('hours', e.target.value.replace(/\D/g, ''))} style={box} /></label>
            </div>
            {FIELDS.map(([k, label, ph]) => <label key={k} style={lab}>{label}<input id={k} value={String(p[k] ?? '')} onChange={(e) => set(k, e.target.value)} placeholder={ph} maxLength={60} style={box} /></label>)}
            <label style={{ ...lab, gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 10 }}>Your colour<input id="brand" type="color" value={p.brand} onChange={(e) => set('brand', e.target.value)} style={{ width: 56, height: 36, border: `1px solid ${line}`, borderRadius: 8, background: '#fff', padding: 2 }} /></label>

            {mode !== 'made' && claimBlock}
            {mode === 'made' && <p style={{ margin: 0, color: muted }}>Have another opening? <a href="/video" style={{ color: blue }}>Paste any job posting</a> and it becomes a video the same way.</p>}
            {mode === 'make' && <button type="button" onClick={() => { setStage('paste'); setMsg(''); setClaim('') }} style={{ ...btn('transparent', muted), border: `1px solid ${line}` }}>Start over with another posting</button>}
          </div>
        )}
        <p style={{ margin: '14px 0 0', fontSize: 13, color: muted }}>Montero Team · 475-977-1707 · ai@montero.cool · montero.cool</p>
      </div>
    </main>
  )
}
