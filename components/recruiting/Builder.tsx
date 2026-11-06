'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { JobMap, JOBMAP_FPS, jobMapSeconds } from './reel/JobMapReel'
import { Departures, DEPARTURES_FPS, DEPARTURES_FRAMES } from './reel/DeparturesReel'
import { JobDropV3, JOBDROP3_FPS, JOBDROP3_FRAMES } from './reel/JobDropReel'
import { decodeReel, encodeReel, FORMATS, STARTER, type Format, type Reel } from '@/lib/recruiting/reel'
import { FORMAT_LABEL, propsFor } from '@/lib/recruiting/formats'
import s from './recruiting.module.css'
import b from './builder.module.css'

// The free reel builder: the visitor types roles in plain words, /api/recruiting/draft turns them into a reel, and the
// same compositions we render in HD play live beside the chat, in any of the three formats. "Get the HD file" sends us
// the spec as a lead; pitching their own idea opens the idea form (2 free reels).
type Msg = { role: 'user' | 'assistant'; text: string }
const HELLO = 'Tell me your agency’s name and a few roles you’re hiring for, with the city and pay. Your reel builds as we go.'
const IDEAS = ['We’re Your Agency. Hiring CNC Machinists in Dayton OH at $28/hr and Forklift Operators in Columbus OH at $21/hr', 'Make it dark green', 'Add a Medical Assistant in Tampa FL, $19/hr, full-time']

const COMP = {
  jobmap: { component: JobMap, fps: JOBMAP_FPS, frames: (r: Reel) => Math.round(jobMapSeconds(r.jobs.length) * JOBMAP_FPS), bg: '#EEF1F6' },
  departures: { component: Departures, fps: DEPARTURES_FPS, frames: () => DEPARTURES_FRAMES, bg: '#070a0e' },
  jobdrop: { component: JobDropV3, fps: JOBDROP3_FPS, frames: () => JOBDROP3_FRAMES, bg: '#0b0d18' },
} as const

export default function Builder() {
  const [reel, setReel] = useState<Reel>(STARTER)
  const [format, setFormat] = useState<Format>('jobmap')
  const [pick, setPick] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', text: HELLO }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [muted, setMuted] = useState(true)
  const [step, setStep] = useState<'build' | 'email' | 'sent'>('build')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [idea, setIdea] = useState('')
  const player = useRef<PlayerRef>(null)
  const thread = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const touched = useRef(false)

  // A shared link (/recruiting?r=...) opens straight into that reel.
  useEffect(() => {
    const r = new URLSearchParams(location.search).get('r')
    const got = r && decodeReel(r)
    if (got) {
      touched.current = true
      setReel(got); setFormat(got.format || 'jobmap')
      setMsgs([{ role: 'assistant', text: `Here’s the reel for ${got.agency}. Ask for any change: a role, the pay, your colors, or try another format.` }])
      requestAnimationFrame(() => document.getElementById('start')?.scrollIntoView({ block: 'start' }))
    }
  }, [])

  useEffect(() => { const t = thread.current; if (t) t.scrollTop = t.scrollHeight }, [msgs, busy])

  // Every new version plays from the top.
  useEffect(() => { if (touched.current) { player.current?.seekTo(0); player.current?.play() } }, [reel, format, pick])

  const full = useMemo(() => ({ ...reel, format }), [reel, format])
  const props = useMemo(() => propsFor(format, reel, pick), [format, reel, pick])
  const comp = COMP[format]

  function choose(f: Format) { touched.current = true; setFormat(f) }

  function openIdea(text: string) {
    setIdea(text)
    dialog.current?.showModal()
  }

  async function send(text: string) {
    text = text.trim()
    if (!text || busy) return
    const next = [...msgs, { role: 'user' as const, text }]
    setMsgs(next); setInput(''); setBusy(true)
    const r = await fetch('/api/recruiting/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, reel: full, email }) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    setBusy(false)
    if (j.reel) {
      touched.current = true
      setReel(j.reel)
      if (j.reel.format && j.reel.format !== format) setFormat(j.reel.format)
      setPick((p) => Math.min(p, j.reel.jobs.length - 1))
    }
    setMsgs([...next, { role: 'assistant', text: j.reply || j.error || 'That didn’t go through. Try once more, or email ai@montero.cool.' }])
    if (j.idea) setTimeout(() => openIdea(text), 900)
    if (j.limit && step === 'build') setStep('email')
  }

  async function order(e: React.FormEvent) {
    e.preventDefault()
    setNote('')
    const r = await fetch('/api/recruiting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, reel: full }) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setStep('sent'); else setNote(j.error || 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.')
  }

  async function copyLink() {
    const url = `${location.origin}/recruiting?r=${encodeReel(full)}`
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
        <div className={b.formats} role="tablist" aria-label="Format">
          {FORMATS.map((f) => <button key={f} type="button" role="tab" aria-selected={f === format} className={f === format ? b.on : ''} onClick={() => choose(f)}>
            <span>{FORMAT_LABEL[f].name}</span><small>{FORMAT_LABEL[f].tag}</small></button>)}
        </div>
        {format === 'jobdrop' && reel.jobs.length > 1 && <label className={b.pick} htmlFor="rb-pick"><span>Role</span>
          <select id="rb-pick" value={pick} onChange={(e) => { touched.current = true; setPick(+e.target.value) }}>
            {reel.jobs.map((j, i) => <option key={i} value={i}>{j.role}, {j.city}</option>)}
          </select></label>}
        <div className={b.screen}>
          <div className={s.phone}>
            <Player key={format} ref={player} component={comp.component as any} inputProps={props} durationInFrames={comp.frames(reel)} fps={comp.fps} compositionWidth={1080} compositionHeight={1920}
              style={{ width: '100%', aspectRatio: '9 / 16', borderRadius: 34, overflow: 'hidden', background: comp.bg }}
              autoPlay loop initiallyMuted={muted} clickToPlay numberOfSharedAudioTags={64} acknowledgeRemotionLicense />
            <button type="button" className={b.sound} onClick={toggleSound}>{muted ? 'Sound on' : 'Sound off'}</button>
          </div>
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
        <button type="button" className={b.pitch} onClick={() => openIdea('')}>Have a better idea for your reel? <b>Pitch it to us</b></button>
      </div>

      <IdeaForm ref={dialog} idea={idea} reel={full} email={email} />
    </div>
  )
}

// Opens when the visitor pitches their own concept (the bot flags it) or taps "Pitch it to us".
const IdeaForm = forwardRef<HTMLDialogElement, { idea: string; reel: Reel; email: string }>(function IdeaForm({ idea, reel, email }, ref) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const close = (e: React.MouseEvent) => (e.currentTarget.closest('dialog') as HTMLDialogElement).close()
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    setState('sending')
    const r = await fetch('/api/recruiting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, reel }) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setState('done'); else { setMsg(j.error || 'That didn’t go through. Email ai@montero.cool.'); setState('error') }
  }
  return (
    <dialog ref={ref} className={b.dialog} aria-labelledby="idea-title" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
      <div className={b.dlgIn}>
        <button type="button" className={b.x} onClick={close} aria-label="Close">×</button>
        {state === 'done' ? <div className={b.dlgDone}>
          <p className={s.label}>Got it</p>
          <h3 id="idea-title">We’re on it.</h3>
          <p>We’ll email you to set up a quick call about your idea. Your 2 free reels are saved under your email.</p>
          <button type="button" className={s.ghost} onClick={close}>Back to my reel</button>
        </div> : <>
          <p className={s.label}>Now we’re talking</p>
          <h3 id="idea-title">Let’s build your idea with you.</h3>
          <p className={b.dlgLead}>Ideas like this are what we make best. Tell us a bit more and we’ll work it out together. <b>Your first 2 reels are on us.</b></p>
          <form className={b.dlgForm} onSubmit={submit} key={idea}>
            <label htmlFor="if-idea"><span>Your idea</span><textarea id="if-idea" name="idea" rows={4} required autoFocus defaultValue={idea} placeholder="What should the reel do or show?" /></label>
            <div className={b.dlgRow}>
              <label htmlFor="if-name"><span>Name</span><input id="if-name" name="name" required autoComplete="name" /></label>
              <label htmlFor="if-agency"><span>Agency</span><input id="if-agency" name="agency" autoComplete="organization" defaultValue={reel.agency === 'Your Agency' ? '' : reel.agency} /></label>
            </div>
            <div className={b.dlgRow}>
              <label htmlFor="if-email"><span>Work email</span><input id="if-email" name="email" type="email" required autoComplete="email" defaultValue={email} /></label>
              <label htmlFor="if-phone"><span>Phone (optional)</span><input id="if-phone" name="phone" type="tel" autoComplete="tel" /></label>
            </div>
            <button className={`${s.btn} ${s.btnBlock}`} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Claim my 2 free reels'}</button>
            {state === 'error' && <p className={s.err} role="alert">{msg}</p>}
          </form>
        </>}
      </div>
    </dialog>
  )
})
