'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    n: '01',
    title: 'Build your DNA profile',
    body: 'Tell us your voice, your market, and your tone. Takes 5 minutes once. Every piece of content after that sounds like you.',
  },
  {
    n: '02',
    title: 'Upload your listing',
    body: 'Drop your photos and the property address. Agent OS reads every room, identifies features, and pulls context automatically.',
  },
  {
    n: '03',
    title: 'Get your full package',
    body: 'MLS remarks, Instagram caption, SMS teaser, email content, and a live branded presentation website — all in under 60 seconds.',
  },
]

export function HowItWorksRE() {
  return (
    <section id="how-it-works" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--re-gold)', marginBottom: '14px' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600 }}>
            Three steps. Sixty seconds.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr',
                gap: '24px',
                padding: '36px 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Step number */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid var(--gold-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-cinzel)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--re-gold)',
                flexShrink: 0,
              }}>
                {step.n}
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px' }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
