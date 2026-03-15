'use client'

import { motion } from 'framer-motion'

const SERVICES = [
  {
    label: 'AI Automation',
    body: 'We map your repetitive workflows and replace them with AI-driven pipelines that run without supervision. Fewer errors, faster turnaround, hours back every week.',
  },
  {
    label: 'Custom Workflows',
    body: 'n8n and custom API workflows tailored to your operation: CRM sync, document generation, conditional logic, multi-step approvals.',
  },
  {
    label: 'Market Intelligence',
    body: 'Dashboards and automated reports that pull from MLS feeds, public records, and business data to give your team a clear, current view of the market.',
  },
  {
    label: 'Content Generation',
    body: 'AI-written copy in your voice. MLS remarks, email campaigns, social captions, and listing presentations generated in seconds.',
  },
]

export function Services() {
  return (
    <section id="services" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
            What we build
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, maxWidth: '480px' }}>
            Purpose-built tools for every industry.
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '32px 28px',
                background: 'var(--bg)',
                transition: 'background 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
            >
              <div style={{ width: '28px', height: '2px', background: 'var(--gold)', marginBottom: '16px', borderRadius: '1px' }} />
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>
                {s.label}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
