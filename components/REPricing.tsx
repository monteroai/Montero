'use client'

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

import Link from 'next/link'

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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/agent-os" style={{
                  display: 'block', textAlign: 'center', padding: '12px',
                  background: plan.highlight ? blue : '#eff6ff',
                  color: plan.highlight ? '#ffffff' : blue,
                  border: plan.highlight ? 'none' : `1px solid #bfdbfe`,
                  borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                  transition: 'opacity 0.2s',
                }}>
                  Launch Agent OS
                </Link>
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Coming soon
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
