'use client'

import { useState, type FormEvent } from 'react'
import s from './hook.module.css'

export function HookStart() {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(''); setState('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (!/^\S+@\S+\.\S+$/.test(data.email || '')) { setErr('Add your email so we can send you the first cut.'); setState('idle'); return }
    // Two routes, either one counts: Netlify Forms (stored in the Netlify dashboard + email notification) and the API route.
    const net = fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'hook-brief', ...data }).toString() }).then((r) => r.ok).catch(() => false)
    const api = fetch('/api/hook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.ok).catch(() => false)
    const [a, b] = await Promise.all([net, api])
    if (!a && !b) { setErr('That didn’t go through. Email your brief to ai@montero.cool and we’ll take it from there.'); setState('idle'); return }
    setState('done')
  }
  return (
    <div className={s.page}>
      <header className={s.bar}><div className={s.barIn}><a href="/" className={s.brand} aria-label="Montero home">MONTERO</a></div></header>
      <section className={s.startWrap}>
        {state === 'done' ? (
          <div className={s.priceCard}>
            <p className={s.label}>Got it</p>
            <h1 className={s.startH}>Your brief is in.</h1>
            <p className={s.lead}>Your reel arrives within 24 hours at the email you gave us. If anything is missing, we’ll reply there.</p>
          </div>
        ) : (
          <form className={s.priceCard} onSubmit={submit}>
            <p className={s.label}>Step 2 of 4 · Your brief</p>
            <h1 className={s.startH}>Thanks for your order. Tell us about your reel.</h1>
            <p className={s.muted}>About two minutes. No filming needed. Your reel arrives within 24 hours.</p>
            <div className={s.form}>
              <label htmlFor="b-business">Business name</label><input id="b-business" name="business" required maxLength={120} />
              <label htmlFor="b-name">Your name</label><input id="b-name" name="name" maxLength={120} />
              <label htmlFor="b-email">Email for the first cut</label><input id="b-email" name="email" type="email" required maxLength={160} />
              <label htmlFor="b-ig">Instagram handle</label><input id="b-ig" name="instagram" placeholder="@yourbusiness" maxLength={80} />
              <label htmlFor="b-dream">What actually hurts is not owning…</label><input id="b-dream" name="dream" required placeholder="a Porsche 911" maxLength={120} />
              <label htmlFor="b-svc">But if you do, we can…</label><input id="b-svc" name="service" placeholder="keep it looking perfect" maxLength={160} />
              <label htmlFor="b-phone">Phone or website to show at the end (optional)</label><input id="b-phone" name="phone" placeholder="(203) 555-0147" maxLength={120} />
              <label htmlFor="b-clips">Your own clips (optional: Google Drive, Dropbox or WeTransfer link)</label><input id="b-clips" name="clips" placeholder="Leave blank for the full 3D version" maxLength={500} />
              <label htmlFor="b-notes">Anything else? An offer to mention, a different bug, colors</label><textarea id="b-notes" name="notes" rows={4} maxLength={2000} />
            </div>
            {err && <p className={s.err} role="alert">{err}</p>}
            <button className={`${s.btn} ${s.btnBlock}`} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send my brief'}</button>
          </form>
        )}
      </section>
    </div>
  )
}
