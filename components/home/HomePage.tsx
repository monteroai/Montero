'use client'

import { useEffect, useRef } from 'react'
import { useCleanAnchors } from '@/components/site/useCleanAnchors'
import s from './home.module.css'

// montero.cool front page (2026-11 refresh): black + gold, dark glass. Leads with animated video ads (the core product),
// then the upsells: realistic AI video, websites + landing pages, automations. Staffing is the first industry page.
const SERVICES = [
  { name: 'Animated video ads', what: 'Short reels built from what you already have: job orders, menus, listings, price sheets. Nothing to film.', price: 'From $39 a reel', href: '/recruiting' },
  { name: 'Realistic AI video', what: 'When a cartoon won’t do: lifelike scenes and product shots, made without a shoot.', price: 'Quoted per project' },
  { name: 'Websites and landing pages', what: 'One page that does one job, so the people your ads reach have somewhere to go.', price: 'Quoted per project' },
  { name: 'Automations', what: 'Missed calls texted back, every inquiry answered in minutes, and a short report each morning.', price: 'Quoted per project' },
]

const STEPS = [
  ['Send what you have', 'A job order, a menu, a listing link. Whatever you’d tell a customer.'],
  ['Approve it in your inbox', 'The first reel is free. Ask for changes by replying.'],
  ['Pay online', 'No calls needed. Keep one reel, or get new ones every week.'],
]

function Reel({ name, eager }: { name: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.3 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} className={s.video} src={`/recruiting/${name}.mp4`} poster={`/recruiting/${name}.jpg`} muted loop playsInline preload={eager ? 'auto' : 'none'} aria-hidden="true" />
}

const Arrow = () => <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>

export function HomePage() {
  useCleanAnchors()
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <a href="/" className={s.brand}>MONTERO</a>
          <nav className={s.links}>
            <a href="#services">Services</a><a href="/recruiting">Staffing</a><a href="/portal">Client login</a>
            <a href="/recruiting#start" className={s.btnSm}>Get a free reel</a>
          </nav>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.label}>Montero · video ads, sites, automations</p>
          <h1>Video ads for businesses with <em>nothing to film.</em></h1>
          <p className={s.lead}>We turn what you already have into short animated reels, then build the page and the follow-up they point to. You send the details; we send back the work.</p>
          <div className={s.ctas}>
            <a href="/recruiting#start" className={s.btn}>Get a free reel</a>
            <a href="#work" className={s.ghost}>See the work</a>
          </div>
        </div>
        <div className={s.fan} aria-hidden="true">
          <div className={s.fanGlow} />
          <div className={`${s.phone} ${s.left}`}><img className={s.video} src="/recruiting/departures.jpg" alt="" /></div>
          <div className={`${s.phone} ${s.right}`}><img className={s.video} src="/recruiting/jobdrop.jpg" alt="" /></div>
          <div className={`${s.phone} ${s.mid}`}><Reel name="jobmap" eager /></div>
        </div>
      </section>

      <section id="work" className={s.section}>
        <a href="/recruiting" className={s.feature}>
          <div className={s.featureText}>
            <p className={s.label}>First industry · Staffing and recruiting</p>
            <h2>Every opening gets its own video ad.</h2>
            <p className={s.lead}>Agencies sell people, not a product, so there’s nothing to film. We turn their job orders into weekly reels: a map of this week’s openings, a hot-jobs board, one reel per urgent role.</p>
            <span className={s.more}>See the staffing reels <Arrow /></span>
          </div>
          <div className={s.featureVid}><Reel name="jobdrop" /></div>
        </a>
      </section>

      <section id="services" className={s.section}>
        <div className={s.head}><p className={s.label}>Services</p><h2>Start with the reel. Add the rest when it pays.</h2></div>
        <div className={s.services}>
          {SERVICES.map((v, i) => {
            const body = <>
              <span className={s.idx}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{v.name}</h3>
              <p>{v.what}</p>
              <p className={s.price}>{v.price}{v.href && <Arrow />}</p>
            </>
            return v.href ? <a key={v.name} href={v.href} className={`${s.svc} ${s.svcLink}`}>{body}</a> : <div key={v.name} className={s.svc}>{body}</div>
          })}
        </div>
      </section>

      <section className={s.section}>
        <div className={s.head}><p className={s.label}>How it works</p><h2>No meetings. Just the work.</h2></div>
        <ol className={s.steps}>
          {STEPS.map(([t, d], i) => <li key={t}><span className={s.num}>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section className={s.section}>
        <div className={s.cta}>
          <div><h2>Your first reel is free.</h2><p className={s.lead}>Tell us what you sell. We’ll show you what it looks like as an ad.</p></div>
          <a href="/recruiting#start" className={s.btn}>Get a free reel</a>
        </div>
      </section>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span className={s.brand}>MONTERO</span>
          <nav className={s.footLinks}><a href="/recruiting">Staffing</a><a href="/portal">Client login</a><span>ai@montero.cool</span></nav>
          <span>Sample reels use a fictional agency and jobs.</span>
        </div>
      </footer>
    </div>
  )
}
