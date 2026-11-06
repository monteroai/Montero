'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useCleanAnchors } from '@/components/site/useCleanAnchors'
import s from './recruiting.module.css'

// The builder pulls in the Remotion player; load it in the browser only, with the sample reel as a stand-in.
const Builder = dynamic(() => import('./Builder'), { ssr: false, loading: () => <div className={s.builderWait}><div className={s.phone}><img className={s.video} src="/recruiting/jobmap.jpg" alt="" /></div></div> })

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
  ['Type your roles', 'In plain words, the way you’d text them. Or paste a few lines from your job board.'],
  ['Watch it build', 'Your reel plays as you go. Ask for any change: a new role, the pay, your colors.'],
  ['Get the HD file', 'Full quality with sound, sized for Instagram, TikTok, LinkedIn and your job posts.'],
]

const FAQ = [
  ['Do we need to film anything?', 'No. Every reel is animated from your job details. Nobody goes on camera, candidates included.'],
  ['Will it look like our brand?', 'Yes. Your name, your colors and your website on the end card. Send a logo if you have one.'],
  ['What if a role fills?', 'Tell us and we swap it out of the next reel.'],
  ['Who owns the reels?', 'You do. Post them on Instagram, TikTok, LinkedIn, Facebook or your job posts.'],
  ['Is the preview the real reel?', 'Yes. It’s the same reel, played live in your browser. The HD file is full resolution, without the preview tag.'],
  ['What happens after I send my email?', `The HD file comes to your inbox, usually the same day. After that, single reels are $${PRICE.single}, or $${PRICE.weekly} a month for a weekly roundup.`],
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

export function RecruitingPage() {
  useCleanAnchors()
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <a href="/" className={s.brand} aria-label="Montero home">MONTERO</a>
          <nav className={s.links}><a href="#formats">Formats</a><a href="#pricing">Pricing</a><a href="#start" className={s.btnSm}>Build a free reel</a></nav>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.label}>For staffing and recruiting agencies</p>
          <h1>Every opening gets its own <em>video ad.</em></h1>
          <p className={s.lead}>You sell people, not a product, so there’s nothing to film. Send us your job orders and we send back short animated reels, sized for Instagram, TikTok, LinkedIn and your job posts.</p>
          <div className={s.ctas}><a href="#start" className={s.btn}>Build my reel free</a><a href="#formats" className={s.ghost}>See the formats</a></div>
          <p className={s.sub}>First reel free · Preview in seconds · Nothing to film</p>
        </div>
        <div className={s.stage}>
          <div className={s.glow} aria-hidden="true" />
          <div className={s.phone}><Reel name="jobmap" label="Job Map sample reel" eager /></div>
          <div className={s.order} aria-hidden="true">
            <p className={s.label}>Job order in</p>
            <p className={s.orderRole}>Forklift Operator</p>
            <p className={s.orderMeta}>Newark, NJ · $24/hr · Full-time</p>
            <p className={s.orderOut}><span className={s.dot} />Preview ready in seconds</p>
          </div>
        </div>
      </section>

      <section id="start" className={s.section}>
        <div className={`${s.startCard} ${s.builderCard}`}>
          <div className={s.head}>
            <p className={s.label}>Try it free · Live</p>
            <h2>Type your roles. Watch your reel build.</h2>
            <p className={s.lead}>No call and no waiting on an email. Tell it what you’re hiring for in plain words, then change anything by asking.</p>
          </div>
          <Builder />
        </div>
      </section>

      <section id="formats" className={s.section}>
        <div className={s.head}><p className={s.label}>Formats</p><h2>Three formats, all from your job details.</h2></div>
        <div className={s.grid}>
          {FORMATS.map((f) => (
            <article key={f.key} className={s.card}>
              <div className={s.cardVid}><Reel name={f.key} label={`${f.name} sample reel`} /></div>
              <div className={s.cardBody}><p className={s.label}>{f.tag}</p><h3>{f.name}</h3><p>{f.what}</p></div>
            </article>
          ))}
        </div>
        <p className={s.note}>Samples use a fictional agency and jobs. Yours carry your name, colors and real openings.</p>
      </section>

      <section className={s.section}>
        <div className={s.head}><p className={s.label}>How it works</p><h2>No call, no software, no shoot.</h2></div>
        <ol className={s.steps}>
          {STEPS.map(([t, d], i) => <li key={t}><span className={s.num}>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section id="pricing" className={s.section}>
        <div className={s.head}><p className={s.label}>Pricing</p><h2>Start free. Pay when you want more.</h2></div>
        <div className={s.prices}>
          <div className={s.price}>
            <p className={s.label}>First reel</p><p className={s.amt}>$0</p>
            <ul><li><Check />Build it yourself above</li><li><Check />HD file with sound</li><li><Check />No card needed</li></ul>
            <a href="#start" className={s.ghost}>Build your free reel</a>
          </div>
          <div className={s.price}>
            <p className={s.label}>Single reel</p><p className={s.amt}>${PRICE.single}</p>
            <ul><li><Check />One reel, any format</li><li><Check />HD file with sound</li><li><Check />Yours to keep</li></ul>
            <a href="#start" className={s.ghost}>Order one</a>
          </div>
          <div className={`${s.price} ${s.best}`}>
            <p className={s.label}>Weekly</p><p className={s.amt}>${PRICE.weekly}<span>/month</span></p>
            <ul><li><Check />Up to {PRICE.weeklyReels} reels a month</li><li><Check />A roundup of your openings every week</li><li><Check />Cancel anytime</li></ul>
            <a href={STRIPE || '#start'} className={s.btn}>{STRIPE ? 'Subscribe' : 'Start with a free reel'}</a>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.head}><p className={s.label}>Questions</p><h2>Before you ask.</h2></div>
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
