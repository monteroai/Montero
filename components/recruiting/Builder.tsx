'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { JobMap, JOBMAP_FPS, jobMapSeconds } from './reel/JobMapReel'
import { decodeReel, encodeReel, STARTER, statesOf, type Reel } from '@/lib/recruiting/reel'
import s from './recruiting.module.css'
import b from './builder.module.css'

// The free reel builder: the visitor types roles in plain words, /api/recruiting/draft turns them into a reel, and the
// same Job Map composition we render in HD plays live beside the chat. "Get the HD file" sends us the spec as a lead.
type Msg = { role: 'user' | 'assistant'; text: string }
const HELLO = 'Tell me your agency’s name and a few roles you’re hiring for, with the city and pay. Your reel builds as we go.'
const IDEAS = ['We’re Apex Staffing. Hiring CNC Machinists in Dayton OH at $28/hr and Forklift Operators in Columbus OH at $21/hr', 'Make it dark green', 'Add a Medical Assistant in Tampa FL, $19/hr, full-time']

export default function Builder() {
  const [reel, setReel] = useState<Reel>(STARTER)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', text: HELLO }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [muted, setMuted] = useState(true)
  const [step, setStep] = useState<'build' | 'email' | 'sent'>('build')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const player = useRef<PlayerRef>(null)
  const thread = useRef<HTMLDivElement>(null)
  const touched = useRef(false)

  // A shared link (/recruiting?r=...) opens straight into that reel.
  useEffect(() => {
    const r = new URLSearchParams(location.search).get('r')
    const got = r && decodeReel(r)
    if (got) {
      touched.current = true
      setReel(got)
      setMsgs([{ role: 'assistant', text: `Here’s the reel for ${got.agency}. Ask for any change: a role, the pay, your colors.` }])
      requestAnimationFrame(() => document.getElementById('start')?.scrollIntoView({ block: 'start' }))
    }
  }, [])

  useEffect(() => { const t = thread.current; if (t) t.scrollTop = t.scrollHeight }, [msgs, busy])

  // Every new version plays from the top.
  useEffect(() => { if (touched.current) { player.current?.seekTo(0); player.current?.play() } }, [reel])

  const props = useMemo(() => ({ ...reel, states: statesOf(reel), preview: true, sample: false }), [reel])
  const frames = Math.round(jobMapSeconds(reel.jobs.length) * JOBMAP_FPS)

  async function send(text: string) {
    text = text.trim()
    if (!text || busy) return
    const next = [...msgs, { role: 'user' as const, text }]
    setMsgs(next); setInput(''); setBusy(true)
    const r = await fetch('/api/recruiting/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, reel }) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    setBusy(false)
    if (j.reel) { touched.current = true; setReel(j.reel) }
    setMsgs([...next, { role: 'assistant', text: j.reply || j.error || 'That didn’t go through. Try once more, or email ai@montero.cool.' }])
  }

  async function order(e: React.FormEvent) {
    e.preventDefault()
    setNote('')
    const r = await fetch('/api/recruiting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, reel }) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setStep('sent'); else setNote(j.error || 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.')
  }

  async function copyLink() {
    const url = `${location.origin}/recruiting?r=${encodeReel(reel)}`
    try { await navigator.clipboard.writeText(url); setNote('Link copied. Anyone with it sees this reel.') } catch { setNote(url) }
  }

  const toggleSound = () => { const p = player.current; if (!p) return; if (p.isMuted()) { p.unmute(); p.play() } else p.mute(); setMuted(p.isMuted()) }
  const custom = touched.current

  return (
    <div className={b.wrap}>
      <div className={b.chat}>
        <div className={b.thread} ref={thread} aria-live="polite">
          {msgs.map((m, i) => <p key={i} className={m.role === 'user' ? b.me : b.bot}>{m.text}</p>)}
          {busy && <p className={`${b.bot} ${b.typing}`} aria-label="Building"><i /><i /><i /></p>}
        </div>
        {msgs.length < 3 && <div className={b.ideas}>{IDEAS.map((t) => <button key={t} type="button" onClick={() => send(t)} disabled={busy}>{t}</button>)}</div>}
        <form className={b.compose} onSubmit={(e) => { e.preventDefault(); send(input) }}>
          <label htmlFor="rb-input" className={b.sr}>Your roles</label>
          <textarea id="rb-input" rows={2} value={input} maxLength={1200} placeholder="Forklift Operator, Newark NJ, $24/hr…" onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }} />
          <button className={s.btn} disabled={busy || !input.trim()} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>

      <div className={b.side}>
        <div className={s.phone}>
          <Player ref={player} component={JobMap} inputProps={props} durationInFrames={frames} fps={JOBMAP_FPS} compositionWidth={1080} compositionHeight={1920}
            style={{ width: '100%', aspectRatio: '9 / 16', borderRadius: 34, overflow: 'hidden', background: '#EEF1F6' }}
            autoPlay loop initiallyMuted clickToPlay numberOfSharedAudioTags={12} acknowledgeRemotionLicense />
          <button type="button" className={b.sound} onClick={toggleSound}>{muted ? 'Sound on' : 'Sound off'}</button>
        </div>
        {step === 'build' && <div className={b.acts}>
          <button type="button" className={`${s.btn} ${s.btnBlock}`} onClick={() => setStep('email')}>{custom ? 'Get this reel in HD, free' : 'Get your first reel free'}</button>
          {custom && <button type="button" className={b.link} onClick={copyLink}>Copy a link to this reel</button>}
        </div>}
        {step === 'email' && <form className={b.acts} onSubmit={order}>
          <label htmlFor="rb-email" className={b.sr}>Work email</label>
          <input id="rb-email" type="email" required autoComplete="email" placeholder="you@youragency.com" value={email} onChange={(e) => setEmail(e.target.value)} className={b.email} />
          <button className={`${s.btn} ${s.btnBlock}`}>Send me the HD file</button>
          <small className={b.small}>Full quality, with sound, no preview tag. First one is free.</small>
        </form>}
        {step === 'sent' && <p className={b.sent}>Done. The HD file goes to <b>{email}</b>, usually the same day. Want changes after that? Reply to the email.</p>}
        {note && <p className={b.small} role="status">{note}</p>}
      </div>
    </div>
  )
}
