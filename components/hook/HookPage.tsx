'use client'

import { useEffect, useRef, useState } from 'react'
import { useCleanAnchors } from '@/components/site/useCleanAnchors'
import s from './hook.module.css'

export const STRIPE = 'https://buy.stripe.com/14A8wRdwn0Yl9X4aLhfbq02'
const ORIGINAL = 'https://www.instagram.com/reel/DfdbBaxC4gz/'
const COPY = 'https://www.instagram.com/reel/DfhieBZuLML/'
const THIRD = 'https://www.instagram.com/reel/DffaQnRPtd2/'

/* The 3D render in the phone: ant bite (0-6.2s), then a cut to the car, which stands in for the client's own clips. */
const CUT = 6.2
function useVisiblePlay() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return ref
}

function Phone3D({ dream, service, compare = false }: { dream: string; service: string; compare?: boolean }) {
  const [t, setT] = useState(0)
  const [pos, setPos] = useState(50)
  const vref = useVisiblePlay()
  const aref = useRef<HTMLVideoElement>(null)
  // Keep the finished video locked to the render without constant seeking (seeks cause the stutter):
  // nudge its playback speed for small drift, hard-seek only on big drift (loop restart, tab wake).
  useEffect(() => {
    if (!compare) return
    let raf = 0
    const tick = () => {
      const v = vref.current, a = aref.current
      if (v && a && !v.paused && a.readyState >= 2) {
        const d = v.currentTime - a.currentTime
        if (Math.abs(d) > 0.5) { a.currentTime = v.currentTime; a.playbackRate = 1 }
        else a.playbackRate = Math.abs(d) > 0.04 ? 1 + Math.max(-0.15, Math.min(0.15, d * 1.5)) : 1
        if (a.paused) a.play().catch(() => {})
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [compare, vref])
  const sync = (v: HTMLVideoElement) => setT(v.currentTime)
  const fadeL = Math.max(0, Math.min(1, (pos - 10) / 22)), fadeR = Math.max(0, Math.min(1, (90 - pos) / 22))
  const cap = t < 2.9 ? <>When an ant bites you, it grabs your skin with its pinchers</>
    : t < CUT ? <>But it’s not the pinchers that hurt you</>
    : t < 8.3 ? <>What actually hurts is not owning <b>{dream}</b></>
    : <>But if you do, we can <b>{service}</b></>
  const beat = t < 2.9 ? 0 : t < CUT ? 1 : t < 8.3 ? 2 : 3
  return (
    <div className={s.screen}>
      <video ref={vref} className={s.vid} src={compare ? '/hook/ant.mp4' : '/hook/ant_ai.mp4'} poster={compare ? '/hook/ant.jpg' : '/hook/ant_ai.jpg'} muted loop playsInline preload="auto"
        onTimeUpdate={(e) => sync(e.currentTarget)}
        onPlay={() => aref.current?.play().catch(() => {})} onPause={() => aref.current?.pause()}
        aria-label={compare ? '3D grid render of the ant and the car, made by Montero' : 'Finished ant reel: an ant pulls up skin, then a cut to a Porsche 911'} />
      {compare && <>
        <video ref={aref} className={s.vid} src="/hook/ant_ai.mp4" poster="/hook/ant_ai.jpg" muted loop playsInline preload="auto"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }} aria-hidden="true" />
        <span className={s.cmpLine} style={{ left: `${pos}%` }} aria-hidden="true"><i /></span>
        <span className={`${s.cmpLab} ${s.cmpL}`} style={{ opacity: fadeL, transform: `scale(${0.7 + 0.3 * fadeL})` }}>3D render</span>
        <span className={`${s.cmpLab} ${s.cmpR}`} style={{ opacity: fadeR, transform: `scale(${0.7 + 0.3 * fadeR})` }}>Finished</span>
        <input id="hk-compare" className={s.cmpRange} type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)}
          aria-label="Drag to compare the 3D render with the finished reel" />
      </>}
      <p key={beat} className={`${s.cap} ${s.capIn}`}>{cap}</p>
      {t >= CUT ? <span className={`${s.badge} ${s.badgeAd}`}>This part is your ad</span> : <span className={s.badge}>{compare ? 'Drag to compare' : 'Made in 3D by Montero'}</span>}
    </div>
  )
}

/* Illustration of an audience-retention curve: a typical open vs. a pattern-interrupt hook. Not measured data. */
function Retention() {
  const ref = useRef<HTMLDivElement>(null)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPlay(true); io.disconnect() } }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // x: 0..15s -> 40..600, y: 100%..0% -> 20..260
  const X = (t: number) => 40 + (t / 15) * 560, Y = (p: number) => 20 + (1 - p / 100) * 240
  const path = (pts: [number, number][]) => pts.map(([t, p], i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ')
  const typical = path([[0, 100], [0.5, 88], [1, 70], [1.5, 55], [2, 45], [3, 36], [5, 29], [8, 24], [11, 21], [15, 18]])
  const hooked = path([[0, 100], [0.5, 97], [1, 93], [1.5, 89], [2, 85], [3, 79], [5, 70], [8, 62], [11, 56], [15, 51]])
  return (
    <div ref={ref} className={`${s.chart} ${play ? s.play : ''}`}>
      <svg viewBox="0 0 620 300" role="img" aria-label="Illustration: a typical reel loses most viewers in the first 3 seconds; a reel with a pattern-interrupt hook keeps far more of them.">
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}><line x1="40" x2="600" y1={Y(p)} y2={Y(p)} className={s.grid} /><text x="32" y={Y(p) + 4} className={s.axis} textAnchor="end">{p}%</text></g>
        ))}
        {[0, 3, 6, 9, 12, 15].map((t) => <text key={t} x={X(t)} y="284" className={s.axis} textAnchor="middle">{t}s</text>)}
        <rect x={X(0)} y="20" width={X(3) - X(0)} height="240" className={s.zone} />
        <text x={X(1.5)} y="36" className={s.zoneTxt} textAnchor="middle">THE FIRST 3 SECONDS</text>
        <path d={typical} className={`${s.line} ${s.lineDim}`} pathLength={1} />
        <path d={hooked} className={`${s.line} ${s.lineGold}`} pathLength={1} />
        <circle cx={X(15)} cy={Y(51)} r="5" className={s.endGold} />
        <circle cx={X(15)} cy={Y(18)} r="4" className={s.endDim} />
        <text x={X(15) - 8} y={Y(51) - 12} className={s.tagGold} textAnchor="end">With the hook</text>
        <text x={X(15) - 8} y={Y(18) - 10} className={s.tagDim} textAnchor="end">Typical opening</text>
      </svg>
      <p className={s.note}>Illustration of how retention curves behave, not data from a specific reel.</p>
    </div>
  )
}

/* ROI calculator: the visitor's own numbers. No claims about other businesses' sales. */
function Roi() {
  const [views, setViews] = useState(50000)
  const [inq, setInq] = useState(2)      // inquiries per 10,000 views
  const [close, setClose] = useState(30) // % of inquiries that book
  const [job, setJob] = useState(800)    // average job value
  const leads = (views / 10000) * inq, jobs = leads * (close / 100), rev = jobs * job, x = rev / 447
  const f = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const Row = ({ id, label, val, set, min, max, step, show }: { id: string; label: string; val: number; set: (n: number) => void; min: number; max: number; step: number; show: string }) => (
    <div className={s.roiRow}><label htmlFor={id}>{label}</label><output htmlFor={id}>{show}</output>
      <input id={id} type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} /></div>
  )
  return (
    <div className={s.roi}>
      <div className={s.roiIn}>
        <Row id="roi-v" label="Views on your reel" val={views} set={setViews} min={5000} max={500000} step={5000} show={f(views)} />
        <Row id="roi-i" label="People who reach out, per 10,000 views" val={inq} set={setInq} min={0.5} max={10} step={0.5} show={String(inq)} />
        <Row id="roi-c" label="Of those, how many book" val={close} set={setClose} min={5} max={80} step={5} show={close + '%'} />
        <Row id="roi-j" label="Your average job" val={job} set={setJob} min={100} max={5000} step={50} show={'$' + f(job)} />
      </div>
      <div className={s.roiOut}>
        <p className={s.label}>What one reel could bring in</p>
        <p className={s.roiBig}>${f(rev)}</p>
        <p className={s.muted}>{f(leads)} inquiries, about {jobs < 10 ? jobs.toFixed(1) : f(jobs)} booked jobs. That’s {x < 10 ? x.toFixed(1) : f(x)}x the $447 cost.</p>
        <p className={s.note}>These are your numbers, not a promise. Move the sliders to match your shop.</p>
      </div>
    </div>
  )
}

export function HookPage() {
  useCleanAnchors()
  const dream = 'a Porsche 911', service = 'keep it looking perfect'
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <a href="/" className={s.brand} aria-label="Montero home">MONTERO</a>
          <nav className={s.links}><a href="#how">How it works</a><a href="#why">Why it works</a><a href="#price">Price</a><a href={STRIPE} className={s.btnSm}>Get my reel</a></nav>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.label}>For businesses that sell the dream</p>
          <h1>One ant reel. <em>370,000 likes.</em> Yours next.</h1>
          <p className={s.lead}>The funniest ad format on Instagram right now, built for your business. A 3D ant, your punchline, your work. Ready to post.</p>
          <div className={s.ctas}><a href={STRIPE} className={s.btn}>Get my reel · $447</a><a href="#proof" className={s.ghost}>Watch the original</a></div>
          <p className={s.sub}>Delivered in 24 hours · 2 free rounds of changes · No filming needed</p>
        </div>
        <div className={s.stage}>
          <div className={s.glow} aria-hidden="true" />
          <div className={s.phone}><Phone3D dream={dream} service={service} compare /></div>
          <p className={s.stageNote}>Drag across the video: our 3D render on the left, the finished reel on the right.</p>
        </div>
      </section>

      <section id="proof" className={s.section}>
        <p className={s.label}>The proof</p>
        <h2>One bug. Three accounts. Same joke.</h2>
        <p className={s.lead}>A detailing shop posted it with no budget and no actors. A car creator made his own version, and a car app copied it with a spider. That’s over half a million likes from one joke. People share it because it lands before they realize it’s an ad.</p>
        <div className={s.proof}>
          <figure className={s.proofCard}>
            <div className={s.stats}><span><b>370K+</b> likes</span><span><b>2,100+</b> comments</span></div>
            <p className={s.who}>Car detailer · the original</p>
            <iframe className={s.embed} src="https://www.instagram.com/reel/DfdbBaxC4gz/embed/" title="Original ant reel on Instagram" loading="lazy" allowFullScreen />
            <a className={s.lnk} href={ORIGINAL} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
          </figure>
          <figure className={s.proofCard}>
            <div className={s.stats}><span><b>165K+</b> likes</span><span><b>1,200+</b> comments</span></div>
            <p className={s.who}>Car creator · his version</p>
            <iframe className={s.embed} src="https://www.instagram.com/reel/DffaQnRPtd2/embed/" title="Car creator version of the reel on Instagram" loading="lazy" allowFullScreen />
            <a className={s.lnk} href={THIRD} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
          </figure>
          <figure className={s.proofCard}>
            <div className={s.stats}><span><b>15K+</b> likes</span><span><b>90+</b> comments</span></div>
            <p className={s.who}>Car app · the spider version</p>
            <iframe className={s.embed} src="https://www.instagram.com/reel/DfhieBZuLML/embed/" title="Spider version of the reel on Instagram" loading="lazy" allowFullScreen />
            <a className={s.lnk} href={COPY} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
          </figure>
        </div>
      </section>

      <section id="how" className={s.section}>
        <p className={s.label}>How we remake it</p>
        <h2>Here’s what we’d make for you.</h2>
        <div className={s.howGrid}>
        <div className={s.phone}><Phone3D dream={dream} service={service} /></div>
        <div className={s.steps}>
          <article className={s.step}>
            <p className={s.when}>0–3s</p>
            <h3>The hook</h3>
            <p>A 3D ant grabs someone’s skin with its pinchers. “It’s not the pinchers that hurt you.” Want a different creature or your own twist? We build it with you. We handle the direction and the animation, and you have the final say on anything that touches your brand.</p>
          </article>
          <article className={s.step}>
            <p className={s.when}>3–8s</p>
            <h3>The punchline</h3>
            <p>“What actually hurts is not owning…” and then the car your customers wish they had. A Porsche, a BMW, a Hellcat.</p>
          </article>
          <article className={s.step}>
            <p className={s.when}>8–15s</p>
            <h3>Your offer</h3>
            <p>“But if you do, we can…” over a 3D car built in the same style, then your name, handle and number on the last frame. By the time they realize it’s an ad, they’ve watched it.</p>
          </article>
        </div>
        </div>

      </section>

      <section id="why" className={s.section}>
        <div className={s.why}>
          <div>
            <p className={s.label}>Why it works</p>
            <h2>Most reels lose their viewers in the first three seconds.</h2>
            <p className={s.lead}>Instagram decides who else sees your reel by how many people keep watching. A normal opening, like a logo, a slow pan or someone saying hi, gives people a reason to scroll. A giant ant grabbing someone’s skin doesn’t. Once they’re curious about the joke, they stay for your offer.</p>
          </div>
          <Retention />
        </div>
      </section>

      <section id="roi" className={s.section}>
        <p className={s.label}>The math</p>
        <h2>What’s one reel worth to your shop?</h2>
        <p className={s.lead}>The original passed 370,000 likes, and likes are only a slice of the people who watched. Plug in your own numbers.</p>
        <Roi />
      </section>

      <section id="price" className={s.section}>
        <div className={s.priceCard}>
          <div className={s.priceTop}>
            <div>
              <p className={s.label}>One reel, made for you</p>
              <p className={s.price}>$447</p>
              <p className={s.muted}>Paid once. No subscription.</p>
            </div>
            <a href={STRIPE} className={s.btn}>Get my reel</a>
          </div>
          <ul className={s.incl}>
            <li>A 3D hook scene made from scratch for your reel, the ant or your own idea</li>
            <li>Your line, voiced and captioned, ending on your logo, handle and number. No logo? We make you one.</li>
            <li>No filming: the whole reel is 3D. Want your own clips in it? Add them and we cut them in.</li>
            <li>Vertical 9:16 file ready for Reels, TikTok and Shorts</li>
            <li>Delivered within 24 hours, ready to post. After that, 2 rounds of changes are free: your logo, your clips, new words.</li>
            <li>You own the finished video</li>
          </ul>
          <ol className={s.flow}>
            <li><b>Pay</b><span>Secure checkout through Stripe.</span></li>
            <li><b>Two-minute brief</b><span>Right after checkout: your line, your website and your logo.</span></li>
            <li><b>Your reel within 24 hours</b><span>We email it to you, ready to post.</span></li>
            <li><b>Post it</b><span>Or send changes first. Two rounds are free.</span></li>
          </ol>
        </div>
      </section>

      <section className={s.section}>
        <p className={s.label}>Questions</p>
        <div className={s.faq}>
          <details><summary>Do I need to film anything?</summary><p>No. The whole reel is 3D: the ant, the car and your branded ending. If you’d like your own clips in it too, add a link in the brief and we’ll cut them in.</p></details>
          <details><summary>Will it go viral?</summary><p>No one can promise that. What we can promise is the opening that’s working right now, built properly for your business, and two free rounds of changes until it’s right.</p></details>
          <details><summary>What do you need from me after I pay?</summary><p>Checkout takes you straight to a short form: your business name, your Instagram handle, the thing your customers dream about, and what you do for them. It takes about two minutes, and your reel arrives within 24 hours.</p></details>
          <details><summary>What if I change my mind?</summary><p>Your reel goes into production as soon as you send your brief, so payments are non-refundable once production starts. If something isn’t right, you get two free rounds of changes.</p></details>
          <details><summary>Can I use it as an ad?</summary><p>Yes. You own the video, so you can post it, boost it or run it as a paid ad.</p></details>
        </div>
      </section>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span className={s.brand}>MONTERO</span>
          <span className={s.muted}>Questions? Email ai@montero.cool</span>
        </div>
        <p className={s.disc}>The Instagram reels shown above belong to their creators and are shown as examples of the format. Montero is not affiliated with them.</p>
      </footer>
    </div>
  )
}
