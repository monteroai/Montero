'use client'

import { useEffect, useRef, useState } from 'react'
import { BullMark } from '@/components/BullMark'
import s from './recruiting.module.css'

// /recruiting: the one link every staffing-agency email points to. Samples are fictional (labelled on page).
// Prices live here until Emilio confirms them; Weekly checkout uses NEXT_PUBLIC_STRIPE_RECRUIT_LINK, else the form.
const PRICE = { single: 39, weekly: 199, weeklyReels: 10 }
const STRIPE = process.env.NEXT_PUBLIC_STRIPE_RECRUIT_LINK || ''

const FORMATS = [
  { key: 'jobmap', name: 'Job Map', tag: 'Weekly roundup', what: 'This week’s openings, city by city. Your states light up and every role gets a big, readable card with the pay.' },
  { key: 'departures', name: 'Departures', tag: 'Hot jobs', what: 'Your roles rattle onto an airport board. One flips to Final Call, another to Filled.' },
  { key: 'classified', name: 'Classified', tag: 'Candidate spotlight', what: 'Your best candidate, anonymised. Redaction bars peel off the skills and results, never the name. Built to win hiring clients.' },
  { key: 'jobdrop', name: 'Job Drop', tag: 'Single role', what: 'One role, one reel, for the opening you need filled this week.' },
]

const FAQ = [
  ['Do we need to film anything?', 'No. Every reel is animated from your job details. Nobody goes on camera, candidates included.'],
  ['Will it look like our brand?', 'Yes. Your name, your colors, your website on the end card. Send a logo if you have one.'],
  ['What if a role fills?', 'Tell us and we swap it out of the next reel.'],
  ['Who owns the reels?', 'You do. Download them and post them anywhere: Instagram, TikTok, LinkedIn, Facebook, your job posts.'],
]

function Reel({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} className={s.video} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label} />
}

function StartForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [email, setEmail] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    const r = await fetch('/api/recruiting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(f)) }).catch(() => null)
    const j = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) { setEmail(String(f.get('email'))); setState('done') } else { setMsg(j.error || 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.'); setState('error') }
  }
  if (state === 'done') return <div className={s.done}><h3>Got it.</h3><p>Your sample reel goes to <b>{email}</b> within 48 hours. Reply to that email with any changes.</p></div>
  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.row2}>
        <label htmlFor="rf-agency">Agency name<input id="rf-agency" name="agency" required autoComplete="organization" /></label>
        <label htmlFor="rf-site">Website<input id="rf-site" name="site" placeholder="youragency.com" /></label>
      </div>
      <label htmlFor="rf-email">Your email<input id="rf-email" name="email" type="email" required autoComplete="email" /></label>
      <label htmlFor="rf-roles">Roles to feature
        <textarea id="rf-roles" name="roles" required rows={4} placeholder={'Forklift Operator, Newark NJ, $24/hr\nCNC Machinist, Paterson NJ, $31/hr\nor paste your job board link'} />
      </label>
      <label htmlFor="rf-posts">Where do you post?
        <select id="rf-posts" name="posts" defaultValue="Instagram">
          {['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Job boards only', 'Nowhere yet'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <button className={s.btn} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send my roles'}</button>
      {state === 'error' && <p className={s.err} role="alert">{msg}</p>}
      <p className={s.fine}>First reel is free. No card, no call.</p>
    </form>
  )
}

export function RecruitingPage() {
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <a href="/" className={s.brand}><BullMark size={30} /><span>MONTERO</span></a>
        <a href="#start" className={s.btnSm}>Get a free reel</a>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.kicker}>For staffing and recruiting agencies</p>
          <h1>Every opening gets its own video ad.</h1>
          <p className={s.lead}>You sell people, not a product, so there’s nothing to film. Send us your job orders and we send back short animated reels in 48 hours, sized for Instagram, TikTok, LinkedIn and your job posts.</p>
          <div className={s.ctas}><a href="#start" className={s.btn}>Get a free sample reel</a><a href="#formats" className={s.ghost}>See the formats</a></div>
          <p className={s.fine}>No filming. No editing. No software to learn.</p>
        </div>
        <div className={s.phone}><Reel src="/recruiting/jobmap.mp4" poster="/recruiting/jobmap.jpg" label="Job Map sample reel" /></div>
      </section>

      <section id="formats" className={s.section}>
        <h2>Four formats. All from your job details.</h2>
        <div className={s.grid}>
          {FORMATS.map((f) => (
            <article key={f.key} className={s.card}>
              <div className={s.cardVid}><Reel src={`/recruiting/${f.key}.mp4`} poster={`/recruiting/${f.key}.jpg`} label={`${f.name} sample reel`} /></div>
              <p className={s.tag}>{f.tag}</p>
              <h3>{f.name}</h3>
              <p>{f.what}</p>
            </article>
          ))}
        </div>
        <p className={s.fine}>Samples use a fictional agency, jobs and candidate.</p>
      </section>

      <section className={s.section}>
        <h2>How it works</h2>
        <ol className={s.steps}>
          <li><b>Tell us your roles.</b> Titles, cities and pay, or just your job board link.</li>
          <li><b>We build the reels.</b> Your name and colors, back to you within 48 hours.</li>
          <li><b>Post them.</b> Download and post anywhere, or we post them for you.</li>
        </ol>
      </section>

      <section className={s.section}>
        <h2>Pricing</h2>
        <div className={s.prices}>
          <div className={s.price}><p className={s.tag}>First reel</p><p className={s.amt}>Free</p><p>Any format, built from your real openings.</p><a href="#start" className={s.ghost}>Start here</a></div>
          <div className={s.price}><p className={s.tag}>Single reel</p><p className={s.amt}>${PRICE.single}</p><p>One reel, any format. Yours to keep.</p><a href="#start" className={s.ghost}>Order one</a></div>
          <div className={`${s.price} ${s.best}`}><p className={s.tag}>Weekly</p><p className={s.amt}>${PRICE.weekly}<span>/mo</span></p>
            <p>Up to {PRICE.weeklyReels} reels a month: a weekly roundup, plus single-role and candidate reels. Cancel anytime.</p>
            <a href={STRIPE || '#start'} className={s.btn}>{STRIPE ? 'Subscribe' : 'Start with a free reel'}</a></div>
        </div>
      </section>

      <section id="start" className={s.section}>
        <h2>Get your free sample reel</h2>
        <p className={s.lead}>Tell us a few roles you’re hiring for. We’ll send the reel to your inbox.</p>
        <StartForm />
      </section>

      <section className={s.section}>
        <h2>Questions</h2>
        <dl className={s.faq}>{FAQ.map(([q, a]) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
      </section>

      <footer className={s.foot}>
        <span>MONTERO · ai@montero.cool</span>
        <span>Sample reels use fictional agencies, jobs and candidates.</span>
      </footer>
    </div>
  )
}
