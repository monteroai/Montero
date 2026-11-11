'use client'

import { useEffect, useRef, useState } from 'react'
import { useCleanAnchors } from '@/components/site/useCleanAnchors'
import s from './hook.module.css'

export const FOOD_STRIPE = 'https://buy.stripe.com/3cI28tcsj8qN4CK3iPfbq04'
const PAPA = 'https://www.instagram.com/reel/DfWqQlJiolq/'
const SHAMS = 'https://www.instagram.com/reel/Dc4FqZEgsAk/'

/* The demo reel: 3D tanks + drone (0-13s), then the cut to food, which stands in for the restaurant's own clips. */
const CUT = 13
function DronePhone() {
  const [t, setT] = useState(0)
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const cap = t < 5 ? <>Soldiers started covering their tanks in QR codes</>
    : t < 9 ? <>Because enemy drones kept finding them</>
    : t < CUT ? <>But now, when a drone scans the tank…</>
    : <>it finds <b>your restaurant</b> instead</>
  const beat = t < 5 ? 0 : t < 9 ? 1 : t < CUT ? 2 : 3
  return (
    <div className={s.screen}>
      <video ref={ref} className={s.vid} src="/drone/drone.mp4" poster="/drone/drone.jpg" muted loop playsInline preload="auto"
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} aria-label="Demo reel: a soldier covers a tank in QR codes, a drone scans it, then a cut to a burger" />
      <p key={beat} className={`${s.cap} ${s.capIn}`}>{cap}</p>
      {t >= CUT ? <span className={`${s.badge} ${s.badgeAd}`}>This part is your food</span> : <span className={s.badge}>Made by Montero</span>}
    </div>
  )
}

function Roi() {
  const [views, setViews] = useState(30000)
  const [visit, setVisit] = useState(5)   // new customers per 10,000 views
  const [ticket, setTicket] = useState(25)
  const [repeat, setRepeat] = useState(3) // visits per new regular in a year
  const cust = (views / 10000) * visit, rev = cust * ticket * repeat, x = rev / 235
  const f = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const Row = ({ id, label, val, set, min, max, step, show }: { id: string; label: string; val: number; set: (n: number) => void; min: number; max: number; step: number; show: string }) => (
    <div className={s.roiRow}><label htmlFor={id}>{label}</label><output htmlFor={id}>{show}</output>
      <input id={id} type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} /></div>
  )
  return (
    <div className={s.roi}>
      <div className={s.roiIn}>
        <Row id="droi-v" label="Views on your reel" val={views} set={setViews} min={5000} max={300000} step={5000} show={f(views)} />
        <Row id="droi-c" label="New customers per 10,000 views" val={visit} set={setVisit} min={1} max={30} step={1} show={String(visit)} />
        <Row id="droi-t" label="Average ticket" val={ticket} set={setTicket} min={8} max={80} step={1} show={'$' + ticket} />
        <Row id="droi-r" label="Visits per new customer, first year" val={repeat} set={setRepeat} min={1} max={12} step={1} show={String(repeat)} />
      </div>
      <div className={s.roiOut}>
        <p className={s.label}>What one reel could bring in</p>
        <p className={s.roiBig}>${f(rev)}</p>
        <p className={s.muted}>About {f(cust)} new customers. That’s {x < 10 ? x.toFixed(1) : f(x)}x the $235 cost.</p>
        <p className={s.note}>These are your numbers, not a promise. Move the sliders to match your restaurant.</p>
      </div>
    </div>
  )
}

export function DronePage() {
  useCleanAnchors()
  return (
    <div className={s.page}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <a href="/" className={s.brand} aria-label="Montero home">MONTERO</a>
          <nav className={s.links}><a href="#how">How it works</a><a href="#proof">Proof</a><a href="#price">Price</a><a href={FOOD_STRIPE} className={s.btnSm}>Get my reel</a></nav>
        </div>
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.label}>For restaurants</p>
          <h1>A war story that ends <em>at your counter.</em></h1>
          <p className={s.lead}>Tanks, drones, QR codes, and then your food. People watch to see where it goes, and by the time they realize it’s an ad, they want your burger.</p>
          <div className={s.ctas}><a href={FOOD_STRIPE} className={s.btn}>Get my reel · $235</a><a href="#proof" className={s.ghost}>See the originals</a></div>
          <p className={s.sub}>Preview in 24 hours · Love it or your money back · Your food, your name</p>
        </div>
        <div className={s.stage}>
          <div className={s.glow} aria-hidden="true" />
          <div className={s.phone}><DronePhone /></div>
          <p className={s.stageNote}>The demo ends on a burger. Yours ends on your food, your name and your address.</p>
        </div>
      </section>

      <section id="proof" className={s.section}>
        <p className={s.label}>The proof</p>
        <h2>Small restaurants, big numbers.</h2>
        <p className={s.lead}>A local burger spot and a hot chicken shop each opened with a story that had nothing to do with food, then cut to their kitchen. Tens of thousands of likes each, and the comments call it marketing genius.</p>
        <div className={s.proof}>
          <figure className={s.proofCard}>
            <div className={s.stats}><span><b>49K+</b> likes</span><span><b>180+</b> comments</span></div>
            <p className={s.who}>Burger spot · the drone story</p>
            <iframe className={s.embed} src="https://www.instagram.com/reel/DfWqQlJiolq/embed/" title="Burger spot reel on Instagram" loading="lazy" allowFullScreen />
            <a className={s.lnk} href={PAPA} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
          </figure>
          <figure className={s.proofCard}>
            <div className={s.stats}><span><b>32K+</b> likes</span><span><b>420+</b> comments</span></div>
            <p className={s.who}>Hot chicken shop · the 3D story</p>
            <iframe className={s.embed} src="https://www.instagram.com/reel/Dc4FqZEgsAk/embed/" title="Hot chicken shop reel on Instagram" loading="lazy" allowFullScreen />
            <a className={s.lnk} href={SHAMS} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
          </figure>
        </div>
      </section>

      <section id="how" className={s.section}>
        <p className={s.label}>How it works</p>
        <h2>Here’s what we’d make for you.</h2>
        <div className={s.steps}>
          <article className={s.step}>
            <p className={s.when}>0–9s</p>
            <h3>The story</h3>
            <p>A soldier covers his tank in QR codes to fool the drones. It’s strange enough that nobody scrolls. We build every scene in 3D, so there’s nothing for you to stage.</p>
          </article>
          <article className={s.step}>
            <p className={s.when}>9–13s</p>
            <h3>The scan</h3>
            <p>A drone locks onto one of the codes and scans it. Everyone watching wants to know what it finds.</p>
          </article>
          <article className={s.step}>
            <p className={s.when}>13s on</p>
            <h3>Your food</h3>
            <p>It finds your restaurant. Your signature item, your sauce, your counter, then your name and address on the last frame. Send us a few phone clips, or we build it from the photos already on your site.</p>
          </article>
        </div>
      </section>

      <section id="roi" className={s.section}>
        <p className={s.label}>The math</p>
        <h2>What’s one reel worth to your restaurant?</h2>
        <Roi />
      </section>

      <section id="price" className={s.section}>
        <div className={s.priceCard}>
          <div className={s.priceTop}>
            <div>
              <p className={s.label}>One reel, made for you</p>
              <p className={s.price}>$235</p>
              <p className={s.muted}>Paid once. No subscription.</p>
            </div>
            <a href={FOOD_STRIPE} className={s.btn}>Get my reel</a>
          </div>
          <ul className={s.incl}>
            <li>The 3D tank and drone story, made for your reel</li>
            <li>Your food, your name and your address, voiced and captioned</li>
            <li>Your own clips cut in, or we build the ending from your photos</li>
            <li>Vertical 9:16 file ready for Reels, TikTok and Shorts</li>
            <li>A watermarked preview within 24 hours. Approve it to get the full file, or ask for changes. 2 rounds are free.</li>
            <li>You own the finished video</li>
          </ul>
          <ol className={s.flow}>
            <li><b>Pay</b><span>Secure checkout through Stripe.</span></li>
            <li><b>Two-minute brief</b><span>Right after checkout: your signature item, your logo, your clips or photos.</span></li>
            <li><b>Preview within 24 hours</b><span>Watch it with our watermark. Approve it or ask for changes.</span></li>
            <li><b>Approve and post</b><span>You get the full-quality file, ready for Instagram.</span></li>
          </ol>
        </div>
      </section>

      <section className={s.section}>
        <p className={s.label}>Questions</p>
        <div className={s.faq}>
          <details><summary>Do I need to film anything?</summary><p>No. The story is all 3D. For the ending, a few phone clips of your food look best, but we can build it from the photos already on your website or Instagram.</p></details>
          <details><summary>Will it go viral?</summary><p>No one can promise that. What we can promise is a format that’s working for restaurants right now, built properly for yours, and a preview before you get the final file.</p></details>
          <details><summary>What if I don’t like it?</summary><p>You see a watermarked preview first. Ask for changes and we send a new one, with 2 rounds free. If you still don’t love it after that, we refund you in full. Once you approve and receive the final file, the sale is final.</p></details>
          <details><summary>How do I reach you?</summary><p>Email ai@montero.cool. A real person answers, usually within a few hours on business days. Payments run through Stripe.</p></details>
          <details><summary>Can I use it as an ad?</summary><p>Yes. You own the video, so you can post it, boost it or run it as a paid ad.</p></details>
        </div>
      </section>

      <footer className={s.foot}>
        <div className={s.footIn}>
          <span className={s.brand}>MONTERO</span>
          <span className={s.muted}>Questions? Email ai@montero.cool. A real person replies, usually within a few hours.</span>
        </div>
        <p className={s.disc}>The Instagram reels shown above belong to their creators and are shown as examples of the format. Montero is not affiliated with them. The demo food shot is AI-generated.</p>
      </footer>
    </div>
  )
}
