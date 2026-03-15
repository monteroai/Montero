'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { BullMark } from './BullMark'

const CASES = [
  {
    client: 'The Magyar Team',
    category: 'Real Estate AI',
    headline: 'From weekly spreadsheets to a live market intelligence platform.',
    outcomes: [
      'Weekly contract dashboard pulls live MLS data automatically',
      'AI remarks generator produces MLS copy in under 60 seconds',
      'Branded seller presentations deployed from a single form',
      'District-level market breakdowns replace hours of research',
    ],
    link: 'https://themagyarreport.com',
    linkLabel: 'themagyarreport.com',
    tag: 'Live',
    image: '/images/case-magyar.jpg',
  },
  {
    client: 'CT Restaurant Analysis',
    category: 'Market Intelligence',
    headline: 'Data-driven site selection for a restaurant group entering Connecticut.',
    outcomes: [
      'Foot traffic and demographic analysis across 12 candidate sites',
      'Automated scoring model ranking locations by revenue potential',
      'Executive summary report generated in under 2 hours',
      'Final recommendation backed by verifiable data sources',
    ],
    link: null,
    linkLabel: null,
    tag: 'Completed',
    image: '/images/case-restaurant.jpg',
  },
]

export function CaseStudies() {
  return (
    <section id="case-studies" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '64px' }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
            Case Studies
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, maxWidth: '480px' }}>
            Real work. Measurable outcomes.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {CASES.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -6,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,162,74,0.15)',
              }}
              style={{
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--bg-raised)',
                transition: 'border-color 0.3s',
                position: 'relative',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image src={c.image} alt={c.client} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </motion.div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(9,9,11,0.2) 0%, rgba(9,9,11,0.88) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                    {c.category}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '9999px',
                    background: c.tag === 'Live' ? 'rgba(34,197,94,0.12)' : 'var(--gold-dim)',
                    color: c.tag === 'Live' ? '#4ade80' : 'var(--gold)',
                    border: c.tag === 'Live' ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--gold-border)',
                  }}>
                    {c.tag}
                  </span>
                </div>
              </div>

              {/* Bull corner mark */}
              <div style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.08, pointerEvents: 'none' }}>
                <BullMark size={44} />
              </div>

              {/* Content */}
              <div style={{ padding: '24px 20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{c.client}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>{c.headline}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {c.outcomes.map((o, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: j * 0.08 }}
                      style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}
                    >
                      <span style={{ color: 'var(--gold)', flexShrink: 0 }}>—</span>{o}
                    </motion.li>
                  ))}
                </ul>
                {c.link && (
                  <a href={c.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'block', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8c774')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}>
                    {c.linkLabel} →
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
