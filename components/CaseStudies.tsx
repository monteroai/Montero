'use client'
import { motion } from 'framer-motion'
import { BullMark } from './BullMark'

// Seeded heat values for CT card (avoids hydration mismatch from Math.random)
const HEAT = [0.9,0.3,0.6,0.8,0.2,0.7,0.4,0.5,0.8,0.9,0.2,0.6,0.7,0.1,0.8,0.3,0.9,0.5,0.4,0.6,0.7,0.8,0.2,0.3,0.6,0.9,0.4,0.7,0.3,0.8,0.5,0.1,0.9,0.6,0.2,0.8,0.4,0.7,0.3,0.5]
const CHART = [58,82,44,92,67,78,86,61,95,72]

const CASES = [
  {
    client: 'The Magyar Team',
    category: 'Real Estate AI · Market Intelligence',
    headline: 'From weekly spreadsheets to a live market intelligence platform.',
    outcomes: [
      'Weekly contract dashboard pulls live MLS data — no manual updates',
      'AI remarks generator produces MLS copy from listing photos in under 60 seconds',
      'Branded seller presentation sites deployed from a single form',
      'District-level market breakdowns replace hours of comparable research',
    ],
    link: 'https://themagyarreport.com',
    linkLabel: 'themagyarreport.com →',
    tag: 'Live',
    // TODO: NanoBanana — luxury Greenwich CT waterfront home
    background: 'linear-gradient(135deg, #0a1628 0%, #1B2B5E 60%, #0e2040 100%)',
  },
  {
    client: 'CT Restaurant Location Analysis',
    category: 'Market Entry Intelligence',
    headline: 'Data-driven site selection for a restaurant group entering Connecticut.',
    outcomes: [
      'Foot traffic, demographic, and competitor density analysis across 12 candidate sites',
      'Automated scoring model ranking locations by revenue potential',
      'Executive summary report generated from raw data in under 2 hours',
      'Final recommendation backed by publicly verifiable data sources',
    ],
    link: null,
    linkLabel: null,
    tag: 'Completed',
    // TODO: NanoBanana — aerial Stamford CT
    background: 'linear-gradient(135deg, #0a0f0a 0%, #1a2e1a 60%, #0f1a0f 100%)',
  },
]

export function CaseStudies() {
  return (
    <section id="case-studies" style={{ padding: '100px 24px', background: '#050505' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '16px' }}>
            Case Studies
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: '#FFFFFF', maxWidth: '560px' }}>
            Real work. Measurable outcomes.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {CASES.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              style={{
                background: c.background,
                border: '1px solid rgba(255,166,0,0.12)',
                borderRadius: '16px',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative mock visual — card 0 = dashboard chart, card 1 = heatmap */}
              {i === 0 ? (
                <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.13, pointerEvents: 'none' }}>
                  <div style={{ width: 130, height: 84, border: '1px solid #ffa600', borderRadius: 6, padding: '8px 8px 6px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ height: 5, background: 'rgba(255,166,0,0.4)', borderRadius: 3, marginBottom: 6, width: '75%' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
                      {CHART.map((h, j) => (
                        <div key={j} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #ffa600, #ffd470)', borderRadius: '2px 2px 0 0' }} />
                      ))}
                    </div>
                    <div style={{ marginTop: 5, display: 'flex', gap: 5 }}>
                      <div style={{ flex: 2, height: 6, background: 'rgba(255,166,0,0.5)', borderRadius: 2 }} />
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,166,0,0.3)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.12, pointerEvents: 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3 }}>
                    {HEAT.map((v, j) => (
                      <div key={j} style={{ width: 12, height: 12, borderRadius: 2, background: `rgba(34,197,94,${v})` }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 7, color: 'rgba(34,197,94,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'right' }}>
                    foot traffic density
                  </div>
                </div>
              )}

              {/* Bull corner mark */}
              <div style={{ position: 'absolute', bottom: 18, right: 18, opacity: 0.08, pointerEvents: 'none' }}>
                <BullMark size={52} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,166,0,0.7)', marginBottom: '6px' }}>
                    {c.category}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.3 }}>
                    {c.client}
                  </h3>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                  borderRadius: '9999px',
                  background: c.tag === 'Live' ? 'rgba(34,197,94,0.12)' : 'rgba(255,166,0,0.1)',
                  border: c.tag === 'Live' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,166,0,0.25)',
                  color: c.tag === 'Live' ? '#4ade80' : '#ffa600',
                }}>
                  {c.tag}
                </span>
              </div>

              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {c.headline}
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {c.outcomes.map((o, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                    <span style={{ color: '#ffa600', flexShrink: 0, marginTop: '2px' }}>—</span>
                    {o}
                  </li>
                ))}
              </ul>

              {c.link && (
                <a href={c.link} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: '13px', fontWeight: 600, color: '#ffa600', textDecoration: 'none',
                  paddingTop: '8px', borderTop: '1px solid rgba(255,166,0,0.10)',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ffd470')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#ffa600')}>
                  {c.linkLabel}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
