'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

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

function WaitlistForm({ plan }: { plan: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [focused, setFocused] = useState(false)

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
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          flex: 1, minWidth: '180px', padding: '10px 12px', fontSize: '13px',
          background: 'rgba(255,255,255,0.05)',
          border: focused ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', color: '#FFFFFF', outline: 'none',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          transition: 'border-color 0.2s ease',
        }}
      />
      <button type="submit" disabled={status === 'sending'} style={{
        padding: '10px 18px', fontSize: '13px', fontWeight: 600,
        background: '#C9A84C', color: '#0a0a0a', border: 'none', borderRadius: '8px',
        cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {status === 'sending' && (
          <div style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(0,0,0,0.3)',
            borderTopColor: '#0a0a0a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
        )}
        {status === 'sending' ? 'Sending…' : 'Notify me'}
      </button>
      {status === 'error' && <p style={{ width: '100%', fontSize: '12px', color: '#f87171' }}>Something went wrong. Try again.</p>}
    </form>
  )
}

export function REPricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })

  return (
    <section ref={sectionRef} id="pricing" style={{ padding: '100px 24px', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
            Pricing
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
            Start free. Scale when it pays for itself.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)' }}>
            Every plan includes MLS remarks, social captions, and the seller presentation builder.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', perspective: '1000px' }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={inView ? { rotateY: 0, opacity: 1 } : { rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.2 }}
              style={{
                background: plan.highlight ? '#111111' : '#0e0e0e',
                border: plan.highlight ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(201,168,76,0.12)',
                borderRadius: '16px',
                padding: '36px 28px',
                boxShadow: plan.highlight ? '0 0 40px rgba(201,168,76,0.08)' : 'none',
                position: 'relative',
                ...(plan.highlight ? { animation: 'goldPulse 3s ease-in-out infinite' } : {}),
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '11px', fontWeight: 600, padding: '4px 14px',
                  background: '#C9A84C', color: '#0a0a0a', borderRadius: '9999px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(201,168,76,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '44px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-cinzel)' }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.40)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.60)' }}>
                    <span style={{ color: '#C9A84C' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {plan.cta === 'Contact us' ? (
                <a href="#contact" style={{
                  display: 'block', textAlign: 'center', padding: '12px',
                  border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C',
                  borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                  background: 'rgba(201,168,76,0.06)',
                }}>
                  Contact us
                </a>
              ) : (
                <WaitlistForm plan={plan.name.toLowerCase()} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
