'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const OUTCOMES = [
  'Weekly contract data published automatically — no manual entry',
  'MLS remarks written from listing photos in under 60 seconds',
  'Seller pitch packages generated end-to-end in a single workflow',
  'District-level market breakdowns for buyer consultations',
]

export function RECaseStudy() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  const blue = '#2563eb'
  const textDark = '#1e293b'
  const textMuted = '#64748b'
  const borderLight = '#e2e8f0'

  return (
    <section style={{ padding: '100px 24px', background: '#ffffff', borderTop: `1px solid ${borderLight}`, borderBottom: `1px solid ${borderLight}` }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }} ref={ref}>
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>
          Live case study
        </p>
        <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, marginBottom: '20px', color: textDark }}>
          The Magyar Team, Greenwich CT
        </h2>
        <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.75, marginBottom: '32px' }}>
          $1B+ in closed transactions. We built The Magyar Report: a live market intelligence platform with an integrated Agent OS for generating listing content, seller presentations, and market summaries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {OUTCOMES.map((outcome, i) => (
            <div key={outcome} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  border: `1px solid ${blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M2 5l2 2 4-4" stroke={blue} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </motion.div>
              <span style={{ fontSize: '14px', color: textMuted, lineHeight: 1.7 }}>{outcome}</span>
            </div>
          ))}
        </div>

        <a href="https://themagyarreport.com" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block', fontSize: '14px', fontWeight: 600,
          color: blue, padding: '11px 22px',
          border: `1px solid #bfdbfe`, borderRadius: 'var(--radius)',
          background: '#eff6ff', transition: 'background 0.2s',
        }}>
          View live: themagyarreport.com →
        </a>
      </div>
    </section>
  )
}
