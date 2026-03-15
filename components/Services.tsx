'use client'

import { motion } from 'framer-motion'

const SERVICES = [
  {
    icon: '⚡',
    label: 'AI Automation',
    body: 'We map your repetitive workflows and replace them with AI-driven pipelines that run without supervision. Fewer errors, faster turnaround, hours back every week.',
  },
  {
    icon: '🔧',
    label: 'Custom Workflows',
    body: 'n8n and custom API workflows tailored to your operation: CRM sync, document generation, conditional logic, multi-step approvals.',
  },
  {
    icon: '📊',
    label: 'Market Intelligence',
    body: 'Dashboards and automated reports that pull from MLS feeds, public records, and business data to give your team a clear, current view of the market.',
  },
  {
    icon: '✍️',
    label: 'Content Generation',
    body: 'AI-written copy in your voice. MLS remarks, email campaigns, social captions, and listing presentations generated in seconds.',
  },
]

export function Services() {
  return (
    <section id="services" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '64px' }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
            What we build
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, maxWidth: '480px' }}>
            Purpose-built tools for every industry.
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,162,74,0.12)',
                borderColor: 'rgba(212,162,74,0.2)',
              }}
              style={{
                padding: '32px 28px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                transition: 'border-color 0.3s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Ghost number */}
              <div style={{
                position: 'absolute', bottom: '-8px', right: '12px',
                fontFamily: 'var(--font-cinzel)', fontSize: '72px', fontWeight: 700,
                color: 'rgba(212,162,74,0.04)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              <div style={{ fontSize: '28px', marginBottom: '16px' }}>{s.icon}</div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 28 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
                style={{ height: '2px', background: 'var(--gold)', marginBottom: '14px', borderRadius: '1px' }}
              />
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>
                {s.label}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
