'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['3 AI generations/month', 'MLS remarks + social captions', '1 listing presentation/month', 'Community support'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$69',
    period: '/month',
    badge: 'Most popular',
    features: ['60 AI generations/month', 'MLS remarks + social + email', 'Unlimited presentations', 'DNA voice profile', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$299',
    period: '/month',
    features: ['5 agents included', '300 AI generations/month', 'All Pro features', 'Team DNA profiles', 'Dedicated onboarding', 'Custom integrations'],
    highlight: false,
  },
]

function WaitlistForm({ plan }: { plan: string }) {
  const [email, setEmail] = useState('')
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
    <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500, padding: '10px 0' }}>
      You're on the list.
    </p>
  )

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{
          flex: 1, minWidth: '160px', padding: '10px 12px', fontSize: '13px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', color: '#1e293b', outline: 'none',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          transition: 'border-color 0.2s',
        }}
      />
      <button type="submit" disabled={status === 'sending'} style={{
        padding: '10px 18px', fontSize: '13px', fontWeight: 600,
        background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px',
        cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      }}>
        {status === 'sending' ? 'Sending…' : 'Notify me'}
      </button>
      {status === 'error' && <p style={{ width: '100%', fontSize: '12px', color: '#ef4444' }}>Something went wrong.</p>}
    </form>
  )
}

export function REPricing() {
  const blue = '#2563eb'
  const textDark = '#1e293b'
  const textMuted = '#64748b'
  const borderLight = '#e2e8f0'

  return (
    <section id="pricing" style={{ padding: '100px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>
            Pricing
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, marginBottom: '12px', color: textDark }}>
            Start free. Scale when it pays for itself.
          </h2>
          <p style={{ fontSize: '15px', color: textMuted }}>
            Every plan includes MLS remarks, social captions, and the seller presentation builder.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: '#ffffff',
                border: plan.highlight ? `2px solid ${blue}` : `1px solid ${borderLight}`,
                borderRadius: 'var(--radius)',
                padding: '32px 24px',
                position: 'relative',
                boxShadow: plan.highlight ? '0 8px 30px rgba(37,99,235,0.1)' : 'none',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                if (!plan.highlight) e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                if (!plan.highlight) e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '11px', fontWeight: 600, padding: '4px 14px',
                  background: blue, color: '#ffffff', borderRadius: '9999px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ fontSize: '13px', fontWeight: 600, color: blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: 700, fontFamily: 'var(--font-cinzel)', color: textDark }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: textMuted }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: textMuted }}>
                    <span style={{ color: blue }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              {plan.name === 'Agency' ? (
                <a href="#contact" style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  border: `1px solid #bfdbfe`, color: blue,
                  borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                  background: '#eff6ff',
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
