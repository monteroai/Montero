'use client'

import { useState } from 'react'
import { Nav } from '@/components/Nav'
import { ElectricalGrid } from '@/components/ElectricalGrid'

// ── Waitlist form ──────────────────────────────────────────────
function WaitlistForm({ plan }: { plan: string }) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') return (
    <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 500, padding: '10px 0' }}>
      You are on the list.
    </p>
  )

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
      <input type="email" placeholder="your@email.com" value={email}
        onChange={e => setEmail(e.target.value)} required
        style={{
          flex: 1, minWidth: '180px', padding: '10px 12px', fontSize: '13px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,166,0,0.20)',
          borderRadius: '8px', color: '#FFFFFF', outline: 'none',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }} />
      <button type="submit" disabled={status === 'sending'} style={{
        padding: '10px 18px', fontSize: '13px', fontWeight: 600,
        background: '#ffa600', color: '#0a0a0a', border: 'none', borderRadius: '8px',
        cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      }}>
        {status === 'sending' ? '…' : 'Notify me'}
      </button>
      {status === 'error' && <p style={{ width: '100%', fontSize: '12px', color: '#f87171' }}>Something went wrong. Try again.</p>}
    </form>
  )
}

// ── Pricing ────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['3 AI generations/month', 'MLS remarks + social captions', '1 listing presentation/month', 'Community support'],
    cta: 'Join waitlist',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$69',
    period: '/month',
    badge: 'Most popular',
    features: ['60 AI generations/month', 'MLS remarks + social + email content', 'Unlimited listing presentations', 'DNA voice profile', 'Priority support'],
    cta: 'Join waitlist',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$299',
    period: '/month',
    features: ['5 agents included', '300 AI generations/month', 'All Pro features', 'Team DNA profiles', 'Dedicated onboarding', 'Custom integrations'],
    cta: 'Contact us',
    highlight: false,
  },
]

export default function RealEstatePage() {
  return (
    <>
      <Nav variant="real-estate" />
      <main style={{ background: '#0a0a0a', color: '#FFFFFF', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

        {/* ── HERO ────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <ElectricalGrid />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 24px 80px', maxWidth: '800px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '24px' }}>
              Agent OS by montero.
            </div>
            <h1 style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: 'clamp(36px, 6.5vw, 72px)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '24px',
              letterSpacing: '-0.01em',
            }}>
              AI tools built for<br />agents who close.
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 16px' }}>
              MLS remarks in your voice. Seller presentations in 60 seconds. Market intelligence that makes you look like the expert in the room.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,166,0,0.75)', fontStyle: 'italic', marginBottom: '40px' }}>
              68% of agents use AI. Only 17% say it works. The difference is tools built around your voice.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#how-it-works" style={{
                padding: '14px 28px', fontSize: '15px', fontWeight: 600,
                border: '1px solid rgba(255,166,0,0.35)', color: '#ffa600',
                borderRadius: '10px', textDecoration: 'none', background: 'rgba(255,166,0,0.06)',
              }}>
                See How It Works
              </a>
              <a href="#pricing" style={{
                padding: '14px 28px', fontSize: '15px', fontWeight: 600,
                background: '#ffa600', color: '#0a0a0a',
                borderRadius: '10px', textDecoration: 'none',
              }}>
                Start Free
              </a>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────── */}
        <section id="how-it-works" style={{ padding: '100px 24px', background: '#050505' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '14px' }}>
                How it works
              </div>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF' }}>
                From zero to published in three steps.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px' }}>
              {[
                {
                  n: '01',
                  title: 'Build your DNA profile',
                  body: 'Tell us your voice, your market, and your tone. Takes 5 minutes once. Every piece of content after that sounds like you — not a generic AI template.',
                },
                {
                  n: '02',
                  title: 'Upload your listing',
                  body: 'Drop your photos and the property address. Agent OS reads every room, identifies features, and pulls context from the listing automatically.',
                },
                {
                  n: '03',
                  title: 'Get your full package',
                  body: 'MLS remarks, Instagram caption, SMS teaser, email content, and a live branded presentation website — all ready in under 60 seconds.',
                },
              ].map(step => (
                <div key={step.n} style={{ padding: '48px 36px', background: '#0e0e0e', border: '1px solid rgba(255,166,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: '12px', right: '20px',
                    fontFamily: 'var(--font-cinzel)', fontSize: '72px', fontWeight: 700,
                    color: 'rgba(255,166,0,0.05)', lineHeight: 1, userSelect: 'none',
                  }}>
                    {step.n}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '12px' }}>
                    Step {step.n}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75 }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AGENT OS PRODUCT DETAIL ──────────────────────────── */}
        <section style={{ padding: '100px 24px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '14px' }}>
                Agent OS
              </div>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', maxWidth: '560px', marginBottom: '16px' }}>
                Your voice. Your market. Your listings.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, maxWidth: '560px' }}>
                Agent OS is the tool we built for the Magyar Team — and are now opening to agents across the country. It starts with your DNA: a profile of your writing style, market focus, and tone. Every generation after that is personalized, consistent, and ready to publish.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255,166,0,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
              {[
                ['MLS Remarks', 'AI reads your photos and writes remarks that sound exactly like you. No editing, no templates.'],
                ['Social Captions', 'Instagram, SMS teaser, and email content generated alongside your remarks — same source, one click.'],
                ['Presentation Sites', 'Branded one-page listing sites deployed to a live URL. Sellers see a deliverable that looks like it took a week.'],
                ['DNA System', 'Your voice profile persists across every listing. The longer you use it, the sharper it gets.'],
              ].map(([title, body]) => (
                <div key={title as string} style={{ padding: '30px 24px', background: '#0e0e0e' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffa600', marginBottom: '10px' }}>{title}</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CASE STUDY ──────────────────────────────────────── */}
        <section style={{ padding: '100px 24px', background: '#050505' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '14px' }}>
              Live case study
            </div>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
              The Magyar Team, Greenwich CT
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '32px' }}>
              $1B+ in closed transactions. Charles Magyar needed a platform that matched the quality of his work — not a generic CRM add-on. We built The Magyar Report: a live market intelligence platform with an integrated Agent OS for generating listing content, seller presentations, and market summaries.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {[
                'Weekly contract data published automatically — no manual entry',
                'MLS remarks written from listing photos in under 60 seconds',
                'Seller pitch packages generated end-to-end in a single workflow',
                'District-level market breakdowns for buyer consultations',
              ].map(o => (
                <div key={o} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ color: '#ffa600', flexShrink: 0 }}>—</span>
                  {o}
                </div>
              ))}
            </div>
            <a href="https://themagyarreport.com" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', fontSize: '14px', fontWeight: 600,
              color: '#ffa600', textDecoration: 'none',
              padding: '12px 24px', border: '1px solid rgba(255,166,0,0.3)',
              borderRadius: '10px', background: 'rgba(255,166,0,0.06)',
            }}>
              View live: themagyarreport.com →
            </a>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: '100px 24px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '14px' }}>
                Pricing
              </div>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                Start free. Scale when it pays for itself.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)' }}>
                Every plan includes MLS remarks, social captions, and the seller presentation builder.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
              {PLANS.map(plan => (
                <div key={plan.name} style={{
                  background: plan.highlight ? '#111111' : '#0e0e0e',
                  border: plan.highlight ? '1px solid rgba(255,166,0,0.45)' : '1px solid rgba(255,166,0,0.12)',
                  borderRadius: '16px',
                  padding: '36px 28px',
                  boxShadow: plan.highlight ? '0 0 40px rgba(255,166,0,0.08)' : 'none',
                  position: 'relative',
                }}>
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '11px', fontWeight: 600, padding: '4px 14px',
                      background: '#ffa600', color: '#0a0a0a', borderRadius: '9999px',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,166,0,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '44px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-cinzel)' }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.40)' }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.60)' }}>
                        <span style={{ color: '#ffa600' }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {plan.cta === 'Contact us' ? (
                    <a href="#contact" style={{
                      display: 'block', textAlign: 'center', padding: '12px',
                      border: '1px solid rgba(255,166,0,0.3)', color: '#ffa600',
                      borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                      background: 'rgba(255,166,0,0.06)',
                    }}>
                      Contact us
                    </a>
                  ) : (
                    <WaitlistForm plan={plan.name.toLowerCase()} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,166,0,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.20)' }}>
            © {new Date().getFullYear()} montero. · <a href="mailto:ai@montero.cool" style={{ color: 'rgba(255,166,0,0.5)', textDecoration: 'none' }}>ai@montero.cool</a>
          </p>
        </div>

      </main>
    </>
  )
}
