'use client'

import { motion } from 'framer-motion'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const borderLight = '#e2e8f0'

function IconProfile() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

const ICONS = [IconProfile, IconUpload, IconPackage]

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
    <section id="how-it-works" style={{ padding: '100px 24px', background: '#ffffff' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '64px' }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: textDark }}>
            Three steps. Sixty seconds.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', position: 'relative' }}>
          {/* Connecting line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: '36px', left: '16.66%', right: '16.66%',
              height: '2px', background: `linear-gradient(to right, ${blue}, ${borderLight})`,
              zIndex: 0, width: '66.66%',
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 16px' }}
              >
                {/* Step circle with icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.1, type: 'spring', stiffness: 200 }}
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: '#ffffff', border: `2px solid ${borderLight}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = blue
                    e.currentTarget.style.boxShadow = `0 8px 30px rgba(37,99,235,0.15)`
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = borderLight
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
                  }}
                >
                  <Icon />
                </motion.div>

                <span style={{
                  fontFamily: 'var(--font-cinzel)', fontSize: '11px', fontWeight: 700,
                  color: blue, letterSpacing: '0.1em', display: 'block', marginBottom: '10px',
                }}>
                  STEP {step.n}
                </span>

                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.3, color: textDark }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.7 }}>
                  {step.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
