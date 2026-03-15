'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SERVICES = [
  {
    label: 'AI Automation',
    body: 'We map your repetitive workflows — intake forms, follow-ups, data entry, reporting — and replace them with AI-driven pipelines that run without supervision. The result is fewer errors, faster turnaround, and hours back every week.',
  },
  {
    label: 'Custom Workflows',
    body: 'Not every process fits a SaaS template. We build n8n and custom API workflows tailored to your exact operation: CRM sync, document generation, conditional logic, multi-step approvals. If it can be automated, we automate it.',
  },
  {
    label: 'Market Intelligence',
    body: 'Raw data does not make decisions — interpreted data does. We build dashboards and automated reports that pull from MLS feeds, public records, and business data to give your team a clear, current view of what the market is doing.',
  },
  {
    label: 'Content Generation',
    body: 'AI-written copy in your voice, not a generic template. MLS remarks, email campaigns, social captions, and listing presentations generated in seconds from property data and photos. Consistent, professional, and ready to publish.',
  },
]

export function Services() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section id="services" style={{ padding: '100px 24px', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '16px' }}>
            What we build
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: '#FFFFFF', maxWidth: '520px' }}>
            Purpose-built tools for every industry.
          </h2>
        </div>

        <div style={
          isMobile
            ? { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: '12px', paddingBottom: '16px' }
            : { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', border: '1px solid rgba(255,166,0,0.10)', borderRadius: '16px', overflow: 'hidden' }
        }>
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              style={{
                padding: '36px 30px',
                background: i % 2 === 0 ? '#0e0e0e' : '#111111',
                borderRight: '1px solid rgba(255,166,0,0.07)',
                ...(isMobile ? { flexShrink: 0, width: '80vw', scrollSnapAlign: 'start', borderRadius: '12px', border: '1px solid rgba(255,166,0,0.10)' } : {}),
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                style={{ height: '2px', background: '#ffa600', marginBottom: '14px', borderRadius: '1px' }}
              />
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '14px' }}>
                {s.label}
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
