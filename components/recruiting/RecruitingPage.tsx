'use client'

import { useEffect, useRef, useState } from 'react'
import s from './recruiting.module.css'

// /recruiting: the one link every staffing-agency email points to. Samples are fictional (labelled on page).
// Prices live here until Emilio confirms them; Weekly checkout uses NEXT_PUBLIC_STRIPE_RECRUIT_LINK, else the form.
const PRICE = { single: 39, weekly: 199, weeklyReels: 10 }
const STRIPE = process.env.NEXT_PUBLIC_STRIPE_RECRUIT_LINK || ''

const FORMATS = [
  { key: 'jobmap', name: 'Job Map', tag: 'Weekly roundup', what: 'This week’s openings, city by city. Your states light up and every role gets a large, readable card with the pay.' },
  { key: 'departures', name: 'Departures', tag: 'Hot jobs', what: 'Your roles flip onto an airport board. One goes to Final Call, another to Filled.' },
  { key: 'jobdrop', name: 'Job Drop', tag: 'Single role', what: 'One role, one reel, for the opening you need filled this week.' },
]

const STEPS = [
  ['Send your roles', 'Titles, cities and pay. Or just the link to your job board.'],
  ['We build the reels', 'In your colors, with your name and website, within 48 hours.'],
  ['Post them', 'Download and post anywhere, or we post them for you.'],
]

const FAQ = [
  ['Do we need to film anything?', 'No. Every reel is animated from your job details. Nobody goes on camera, candidates included.'],
  ['Will it look like our brand?', 'Yes. Your name, your colors and your website on the end card. Send a logo if you have one.'],
  ['What if a role fills?', 'Tell us and we swap it out of the next reel.'],
  ['Who owns the reels?', 'You do. Post them on Instagram, TikTok, LinkedIn, Facebook or your job posts.'],
]

function Reel({ name, label, eager }: { name: string; label: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.3 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} className={s.video} src={`/recruiting/${name}.mp4`} poster={`/recruiting/${name}.jpg`} muted loop playsInline preload={eager ? 'auto' : 'none'} aria-label={label} />
}

const Check = () => <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>

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
  if (state === 'done') return <div className={s.done}><span className={s.doneIcon}><Check /></span><h3>Got it.</h3><p>Your sample reel goes to <b>{email}</b> within 48 hours. Reply to that email with any changes.</p></div>
  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.row2}>
        <label htmlFor="rf-agency"><span>Agency name</span><input id="rf-agency" name="agency" required autoComplete="organization" /></label>
        <label htmlFor="rf-site"><span>Website</span><input id="rf-site" name="site" placeholder="youragency.com" /></label>
      </div>
      <label htmlFor="rf-email"><span>Work email</span><input id="rf-email" name="email" type="email" required autoComplete="email" /></label>
      <label htmlFor="rf-roles"><span>Roles to feature</span>
        <textarea id="rf-roles" name="roles" required rows={4} placeholder={'Forklift Operator, Newark NJ, $24/hr\nCNC Machinist, Paterson NJ, $31/hr'} />
        <small>One per line. Or paste the link to your job board.</small>
      </label>
      <label htmlFor="rf-posts"><span>Where do you post?</span>
        <select id="rf-posts" name="posts" defaultValue="Instagram">
          {['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Job boards only', 'Nowhere yet'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <button className={`${s.btn} ${s.btnBlock}`} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send my roles'}</button>
      {state === 'error' && <p className={s.err} role="alert">{msg}</p>}
    </form>
  )
}

export function RecruitingPage() {
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <a href="/" className={s.brand} aria-label="Montero home">MONTERO</a>
          <nav className={s.links}><a href="#formats">Formats</a><a href="#pricing">Pricing</a><a href="#start" className={s.btnSm}>Get a free reel</a></nav>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.pill}>For staffing and recruiting agencies</p>
          <h1>Every opening gets its own <em>video ad.</em></h1>
          <p className={s.lead}>You sell people, not a product, so there’s nothing to film. Send us your job orders and we send back short animated reels, sized for Instagram, TikTok, LinkedIn and your job posts.</p>
          <div className={s.ctas}><a href="#start" className={s.btn}>Get a free sample reel</a><a href="#formats" className={s.ghost}>See the formats</a></div>
          <ul className={s.facts}>
            <li><b>48 hours</b><span>from roles to reels</span></li>
            <li><b>Free</b><span>first reel</span></li>
            <li><b>Zero</b><span>filming or editing</span></li>
          </ul>
        </div>
        <div className={s.stage}>
          <div className={s.glow} aria-hidden="true" />
          <div className={s.phone}><Reel name="jobmap" label="Job Map sample reel" eager /></div>
        </div>
      </section>

      <section id="formats" className={s.section}>
        <div className={s.head}><p className={s.eyebrow}>Formats</p><h2>Three formats, all from your job details.</h2></div>
        <div className={s.grid}>
          {FORMATS.map((f) => (
            <article key={f.key} className={s.card}>
              <div className={s.cardVid}><Reel name={f.key} label={`${f.name} sample reel`} /></div>
              <div className={s.cardBody}><p className={s.eyebrow}>{f.tag}</p><h3>{f.name}</h3><p>{f.what}</p></div>
            </article>
          ))}
        </div>
        <p className={s.note}>Samples use a fictional agency and jobs. Yours carry your name, colors and real openings.</p>
      </section>

      <section className={s.section}>
        <div className={s.head}><p className={s.eyebrow}>How it works</p><h2>No call, no software, no shoot.</h2></div>
        <ol className={s.steps}>
          {STEPS.map(([t, d], i) => <li key={t}><span className={s.num}>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section id="pricing" className={s.section}>
        <div className={s.head}><p className={s.eyebrow}>Pricing</p><h2>Start free. Pay when you want more.</h2></div>
        <div className={s.prices}>
          <div className={s.price}>
            <p className={s.eyebrow}>First reel</p><p className={s.amt}>$0</p>
            <ul><li><Check />Any format</li><li><Check />Built from your real openings</li><li><Check />No card needed</li></ul>
            <a href="#start" className={s.ghost}>Get your free reel</a>
          </div>
          <div className={s.price}>
            <p className={s.eyebrow}>Single reel</p><p className={s.amt}>${PRICE.single}</p>
            <ul><li><Check />One reel, any format</li><li><Check />Back in 48 hours</li><li><Check />Yours to keep</li></ul>
            <a href="#start" className={s.ghost}>Order one</a>
          </div>
          <div className={`${s.price} ${s.best}`}>
            <p className={s.eyebrow}>Weekly</p><p className={s.amt}>${PRICE.weekly}<span>/month</span></p>
            <ul><li><Check />Up to {PRICE.weeklyReels} reels a month</li><li><Check />A roundup of your openings every week</li><li><Check />Cancel anytime</li></ul>
            <a href={STRIPE || '#start'} className={s.btn}>{STRIPE ? 'Subscribe' : 'Start with a free reel'}</a>
          </div>
        </div>
      </section>

      <section id="start" className={s.section}>
        <div className={s.startCard}>
          <div className={s.startCopy}>
            <p className={s.eyebrow}>Free sample</p>
            <h2>Get your first reel free.</h2>
            <p className={s.lead}>Tell us a few roles you’re hiring for. We build the reel and send it to your inbox.</p>
            <ul className={s.ticks}><li><Check />Your agency name and colors</li><li><Check />Your real openings and pay</li><li><Check />In your inbox within 48 hours</li></ul>
          </div>
          <StartForm />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.head}><p className={s.eyebrow}>Questions</p><h2>Before you ask.</h2></div>
        <div className={s.faq}>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span className={s.brand}>MONTERO</span>
          <span>ai@montero.cool</span>
          <span>Sample reels use a fictional agency and jobs.</span>
        </div>
      </footer>
    </div>
  )
}
