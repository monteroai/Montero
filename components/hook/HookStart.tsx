'use client'

import { useEffect, useState, type FormEvent } from 'react'
import s from './hook.module.css'

/* /hook/start          = the brief right after checkout (reel delivered within 24 hours)
   /hook/start?change=1 = free changes after they've seen their reel (new logo, clips, words) */
export function HookStart() {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  const [change, setChange] = useState(false)
  const [noLogo, setNoLogo] = useState(false)
  useEffect(() => { setChange(new URLSearchParams(window.location.search).has('change')) }, [])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(''); setState('sending')
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Add your email so we can send you your reel.'); setState('idle'); return }
    const logo = fd.get('logo')
    if (logo instanceof File && logo.size > 7.5 * 1024 * 1024) { setErr('That logo file is over 7.5 MB. Try a smaller PNG or JPG.'); setState('idle'); return }
    fd.set('form-name', 'hook-brief'); fd.set('kind', change ? 'change request' : 'new reel brief')
    // Netlify Forms keeps the brief and the uploaded logo (Netlify dashboard + email notice). The API route is a text-only backup.
    const net = fetch('/__forms.html', { method: 'POST', body: fd }).then((r) => r.ok).catch(() => false)
    const text: Record<string, string> = {}
    fd.forEach((v, k) => { if (typeof v === 'string') text[k] = v })
    const api = fetch('/api/hook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(text) }).then((r) => r.ok).catch(() => false)
    const [a, b] = await Promise.all([net, api])
    if (!a && !b) { setErr('That didn’t go through. Email ai@montero.cool and we’ll take it from there.'); setState('idle'); return }
    setState('done')
  }

  return (
    <div className={s.page}>
      <header className={s.bar}><div className={s.barIn}><a href="/" className={s.brand} aria-label="Montero home">MONTERO</a></div></header>
      <section className={s.startWrap}>
        {state === 'done' ? (
          <div className={s.priceCard}>
            <p className={s.label}>Got it</p>
            <h1 className={s.startH}>{change ? 'Your changes are in.' : 'Your brief is in.'}</h1>
            <p className={s.lead}>{change ? 'We’ll send the updated reel to the same email, usually within 24 hours.'
              : 'Your reel arrives within 24 hours, ready to post. Once you’ve seen it, you get 2 free rounds of changes, like a new logo, your own clips or different words.'}</p>
          </div>
        ) : (
          <form className={s.priceCard} onSubmit={submit} encType="multipart/form-data">
            <p className={s.label}>{change ? 'Free changes' : 'Step 2 of 4 · Your brief'}</p>
            <h1 className={s.startH}>{change ? 'What should we change?' : 'Thanks for your order. Tell us about your reel.'}</h1>
            <p className={s.muted}>{change ? 'Tell us what to change and add any files. Your updated reel comes back to the same email.'
              : 'About two minutes. No filming needed. Your reel arrives within 24 hours, and 2 rounds of changes after that are free.'}</p>
            <div className={s.form}>
              <label htmlFor="b-business">Business name</label><input id="b-business" name="business" required maxLength={120} />
              <label htmlFor="b-email">Email for your reel</label><input id="b-email" name="email" type="email" required maxLength={160} />
              {!change && <>
                <label htmlFor="b-name">Your name</label><input id="b-name" name="name" maxLength={120} />
                <label htmlFor="b-ig">Instagram handle</label><input id="b-ig" name="instagram" placeholder="@yourbusiness" maxLength={80} />
                <label htmlFor="b-dream">What actually hurts is not owning…</label><input id="b-dream" name="dream" required placeholder="a Porsche 911" maxLength={120} />
                <label htmlFor="b-svc">But if you do, we can…</label><input id="b-svc" name="service" placeholder="keep it looking perfect" maxLength={160} />
                <label htmlFor="b-site">Website</label><input id="b-site" name="website" placeholder="yourbusiness.com" maxLength={200} />
                <label htmlFor="b-phone">Phone number to show at the end (optional)</label><input id="b-phone" name="phone" placeholder="(203) 555-0147" maxLength={60} />
              </>}
              {change && <>
                <label htmlFor="b-changes">What should we change?</label>
                <textarea id="b-changes" name="changes" rows={5} required maxLength={3000} placeholder="Use our new logo, change the line to …, add my clips at the end" />
              </>}
              <label htmlFor="b-logo">Your logo (PNG or JPG, optional)</label>
              <input id="b-logo" name="logo" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" disabled={noLogo} />
              <label className={s.check} htmlFor="b-nologo">
                <input id="b-nologo" name="nologo" type="checkbox" value="yes" checked={noLogo} onChange={(e) => setNoLogo(e.target.checked)} />
                <span>No logo yet? Make me one. We design a clean wordmark for free.</span>
              </label>
              <label htmlFor="b-clips">Photos or videos you want in it (optional: Google Drive, Dropbox or WeTransfer link)</label>
              <input id="b-clips" name="clips" placeholder="Leave blank for the full 3D version" maxLength={500} />
              {!change && <>
                <label htmlFor="b-notes">Anything else? An offer to mention, a different bug, colors</label><textarea id="b-notes" name="notes" rows={3} maxLength={2000} />
              </>}
            </div>
            {err && <p className={s.err} role="alert">{err}</p>}
            <button className={`${s.btn} ${s.btnBlock}`} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : change ? 'Send my changes' : 'Send my brief'}</button>
          </form>
        )}
      </section>
    </div>
  )
}
