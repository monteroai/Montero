'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const GENERIC = `This charming and exceptional property nestled in a strategic location offers seamless living with robust amenities. Leverage this innovative opportunity in this world-class building.`

const BANNED = ['charming', 'exceptional', 'nestled', 'seamless', 'robust', 'leverage', 'innovative']

const AGENT_TEXT = `Unit 10 at 25 West Elm offers 1,240 square feet of recently updated living space in one of downtown Greenwich's most established co-op buildings. The kitchen was fully renovated in 2022 with Calacatta marble counters and Bosch appliances.`

const HIGHLIGHTS = ['1,240 square feet', 'Calacatta marble', 'Bosch appliances']

function renderGeneric(text: string) {
  return text.split(/(\s+)/).map((seg, i) => {
    const w = seg.trim().replace(/[.,!?]$/, '').toLowerCase()
    if (BANNED.includes(w)) {
      return <span key={i} style={{ textDecoration: 'line-through', color: '#ef4444' }}>{seg}</span>
    }
    return <span key={i}>{seg}</span>
  })
}

function renderAgent(text: string) {
  let parts: Array<{ text: string; hl: boolean }> = [{ text, hl: false }]
  for (const phrase of HIGHLIGHTS) {
    const next: typeof parts = []
    for (const p of parts) {
      if (p.hl) { next.push(p); continue }
      const idx = p.text.indexOf(phrase)
      if (idx === -1) { next.push(p); continue }
      if (idx > 0) next.push({ text: p.text.slice(0, idx), hl: false })
      next.push({ text: phrase, hl: true })
      const rest = p.text.slice(idx + phrase.length)
      if (rest) next.push({ text: rest, hl: false })
    }
    parts = next
  }
  return parts.map((p, i) =>
    p.hl ? (
      <mark key={i} style={{ background: 'rgba(37,99,235,0.08)', borderBottom: '1px solid #2563eb', color: 'inherit', padding: '0 2px' }}>
        {p.text}
      </mark>
    ) : <span key={i}>{p.text}</span>
  )
}

export function VoiceComparison() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  const navy = '#1B2B5E'
  const blue = '#2563eb'
  const textDark = '#1e293b'
  const textMuted = '#64748b'
  const borderLight = '#e2e8f0'

  const card: React.CSSProperties = {
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  }

  return (
    <section ref={ref} style={{ padding: '100px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: textDark }}>
            The difference is your voice.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* Generic */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ ...card, border: `1px solid ${borderLight}`, background: '#ffffff' }}
          >
            <div style={{ padding: '12px 20px', background: '#f1f5f9', borderBottom: `1px solid ${borderLight}` }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Generic AI
              </span>
            </div>
            <div style={{ padding: '24px 20px' }}>
              <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.8 }}>
                {renderGeneric(GENERIC)}
              </p>
            </div>
          </motion.div>

          {/* Agent OS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ ...card, border: `1px solid #bfdbfe`, background: '#ffffff' }}
          >
            <div style={{ padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: blue, display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: blue }}>
                Agent OS
              </span>
            </div>
            <div style={{ padding: '24px 20px' }}>
              <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.8 }}>
                {renderAgent(AGENT_TEXT)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
