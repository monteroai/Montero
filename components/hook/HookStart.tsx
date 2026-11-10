'use client'

import { useEffect, useState, type FormEvent } from 'react'
import s from './hook.module.css'

/* /hook/start          = the brief right after checkout (reel delivered within 24 hours)
   /hook/start?change=1 = free changes after they've seen their reel (new logo, clips, words) */
export function HookStart() {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  const [change, setChange] = useState(false)
  const [approve, setApprove] = useState(false)
  const [noLogo, setNoLogo] = useState(false)
  useEffect(() => { const q = new URLSearchParams(window.location.search); setChange(q.has('change')); setApprove(q.has('approve')) }, [])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(''); setState('sending')
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Add your email so we can send you your reel.'); setState('idle'); return }
    const logo = fd.get('logo')
    if (logo instanceof File && logo.size > 7.5 * 1024 * 1024) { setErr('That logo file is over 7.5 MB. Try a smaller PNG or JPG.'); setState('idle'); return }
    fd.set('form-name', 'hook-brief'); fd.set('kind', approve ? 'APPROVED: send final file' : change ? 'change request' : 'new reel brief')
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
        {approve && state !== 'done' ? (
          <form className={s.priceCard} onSubmit={submit}>
            <p className={s.label}>Approve your reel</p>
            <h1 className={s.startH}>Happy with your preview?</h1>
            <p className={s.muted}>Approve it and we email you the full-quality file without the watermark, ready to post. Want changes instead? Use the change form and we send a new preview.</p>
            <div className={s.form}>
              <label htmlFor="a-business">Business name</label><input id="a-business" name="business" required maxLength={120} />
              <label htmlFor="a-email">Email we sent the preview to</label><input id="a-email" name="email" type="email" required maxLength={160} />
              <label className={s.check} htmlFor="a-ok"><input id="a-ok" name="approved" type="checkbox" value="yes" required />
                <span>I approve my reel. I understand the money-back guarantee ends once I approve.</span></label>
            </div>
            {err && <p className={s.err} role="alert">{err}</p>}
            <button className={`${s.btn} ${s.btnBlock}`} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Approve and send my file'}</button>
            <p className={s.muted}><a href="/hook/start?change=1" style={{ color: 'var(--gold-hi)' }}>I want changes instead</a></p>
          </form>
        ) : state === 'done' ? (
          <div className={s.priceCard}>
            <p className={s.label}>Got it</p>
            <h1 className={s.startH}>{approve ? 'Approved. Your file is on its way.' : change ? 'Your changes are in.' : 'Your brief is in.'}</h1>
            <p className={s.lead}>{approve ? 'We’ll email the full-quality reel to you shortly, ready to post.' : change ? 'We’ll send an updated preview to the same email, usually within 24 hours.'
              : 'Your preview arrives within 24 hours. Approve it and you get the full-quality file, or ask for changes. 2 rounds are free, and if you still don’t love it, you get your money back.'}</p>
          </div>
        ) : (
          <form className={s.priceCard} onSubmit={submit} encType="multipart/form-data">
            <p className={s.label}>{change ? 'Free changes' : 'Step 2 of 4 · Your brief'}</p>
            <h1 className={s.startH}>{change ? 'What should we change?' : 'Thanks for your order. Tell us about your reel.'}</h1>
            <p className={s.muted}>{change ? 'Tell us what to change and add any files. Your updated reel comes back to the same email.'
              : 'About two minutes. No filming needed. Your preview arrives within 24 hours. Love it or your money back.'}</p>
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
              <details className={s.guide}>
                <summary>Filming your own clips? A 1-minute guide</summary>
                <ul>
                  <li><b>Vertical, back camera, clean lens.</b> 4K at 60 fps if your phone has it.</li>
                  <li><b>Good light:</b> open shade or the hour before sunset. Avoid harsh noon sun and dim garages.</li>
                  <li><b>3 to 6 clips, 3 to 8 seconds each:</b> a slow walk-around at car height, a close glide along the paint and reflections, a wheel and caliper close-up, a before and after of the same panel, the interior.</li>
                  <li><b>Move slowly and steadily.</b> Hold still for 2 seconds at the start and end. Don’t zoom.</li>
                  <li><b>Send the original files</b> through Google Drive, Dropbox or WeTransfer, not screenshots or Instagram downloads.</li>
                  <li>We steady, color-correct and upscale every clip, so phone footage is fine.</li>
                </ul>
              </details>
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
