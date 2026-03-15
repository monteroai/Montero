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
    // TODO: Replace background with NanoBanana image URL — luxury Greenwich CT property
    <section style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #0a1628 0%, #1B2B5E 100%)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }} ref={ref}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
          Live case study
        </div>
        <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          The Magyar Team, Greenwich CT
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '32px' }}>
          $1B+ in closed transactions. Charles Magyar needed a platform that matched the quality of his work — not a generic CRM add-on. We built The Magyar Report: a live market intelligence platform with an integrated Agent OS for generating listing content, seller presentations, and market summaries.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
          {OUTCOMES.map((outcome, index) => (
            <div key={outcome} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
                <motion.path
                  d="M7 12l3 3 7-7"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                />
              </svg>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{outcome}</span>
            </div>
          ))}
        </div>
        <a href="https://themagyarreport.com" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block', fontSize: '14px', fontWeight: 600,
          color: '#C9A84C', textDecoration: 'none',
          padding: '12px 24px', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '10px', background: 'rgba(201,168,76,0.06)',
        }}>
          View live: themagyarreport.com →
        </a>
      </div>
    </section>
  )
}
