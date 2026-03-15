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

  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }} ref={ref}>
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--re-gold)', marginBottom: '14px' }}>
          Live case study
        </p>
        <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, marginBottom: '20px' }}>
          The Magyar Team, Greenwich CT
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '32px' }}>
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
                  border: '1px solid var(--re-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M2 5l2 2 4-4" stroke="var(--re-gold)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </motion.div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{outcome}</span>
            </div>
          ))}
        </div>

        <a href="https://themagyarreport.com" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block', fontSize: '14px', fontWeight: 600,
          color: 'var(--re-gold)', padding: '11px 22px',
          border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--radius)',
          background: 'rgba(201,168,76,0.06)',
        }}>
          View live: themagyarreport.com →
        </a>
      </div>
    </section>
  )
}
