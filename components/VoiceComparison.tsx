'use client'
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const GENERIC = `This charming and exceptional property nestled in a strategic location offers seamless living with robust amenities. Leverage this innovative opportunity in this world-class building. The holistic approach to design creates a transformative living experience for the most discerning buyers.`

const BANNED_WORDS = ['charming', 'exceptional', 'nestled', 'seamless', 'robust', 'leverage', 'innovative']

const AGENT_TEXT = `Unit 10 at 25 West Elm offers 1,240 square feet of recently updated living space in one of downtown Greenwich's most established co-op buildings. The kitchen was fully renovated in 2022 with Calacatta marble counters and Bosch appliances. Corner exposure brings afternoon light through oversized south-facing windows.`

const HIGHLIGHTS = ['1,240 square feet', 'Calacatta marble', 'afternoon light', 'oversized south-facing windows']

function renderGenericText(text: string) {
  const words = text.split(/(\s+)/)
  return words.map((segment, i) => {
    const lower = segment.trim().replace(/[.,!?]$/, '').toLowerCase()
    if (BANNED_WORDS.includes(lower)) {
      return (
        <span key={i} style={{ textDecoration: 'line-through', color: '#ef4444' }}>
          {segment}
        </span>
      )
    }
    return <span key={i}>{segment}</span>
  })
}

function renderAgentText(text: string) {
  let parts: Array<{ text: string; highlight: boolean }> = [{ text, highlight: false }]
  for (const phrase of HIGHLIGHTS) {
    const next: typeof parts = []
    for (const part of parts) {
      if (part.highlight) { next.push(part); continue }
      const idx = part.text.indexOf(phrase)
      if (idx === -1) { next.push(part); continue }
      if (idx > 0) next.push({ text: part.text.slice(0, idx), highlight: false })
      next.push({ text: phrase, highlight: true })
      const rest = part.text.slice(idx + phrase.length)
      if (rest) next.push({ text: rest, highlight: false })
    }
    parts = next
  }
  return parts.map((p, i) =>
    p.highlight ? (
      <mark key={i} style={{ background: 'rgba(201,168,76,0.15)', borderBottom: '1px solid #C9A84C', color: 'inherit', padding: '0 2px' }}>
        {p.text}
      </mark>
    ) : (
      <span key={i}>{p.text}</span>
    )
  )
}

export function VoiceComparison() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const prefersReduced = useReducedMotion()

  const leftAnim = prefersReduced
    ? {}
    : { initial: { opacity: 0, x: -30 }, animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }, transition: { duration: 0.6 } }

  const rightAnim = prefersReduced
    ? {}
    : { initial: { opacity: 0, x: 30 }, animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }, transition: { duration: 0.6, delay: 0.2 } }

  return (
    <section ref={ref} style={{ padding: '100px 24px', background: '#050A1A' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF' }}>
            The difference is your voice.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          {/* Left: Generic AI */}
          <motion.div {...leftAnim} style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Generic AI
              </span>
            </div>
            <div style={{ padding: '28px 24px', position: 'relative', background: '#0d0d0d' }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                fontSize: '72px', fontWeight: 900, color: 'rgba(239, 68, 68, 0.08)',
                whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
              }}>
                GENERIC
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
                {renderGenericText(GENERIC)}
              </p>
            </div>
          </motion.div>

          {/* Right: Agent OS */}
          <motion.div {...rightAnim} style={{ border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C' }}>
                Agent OS
              </span>
            </div>
            <div style={{ padding: '28px 24px', background: '#0a1020' }}>
              <p style={{ fontSize: '14px', color: '#FFFFFF', lineHeight: 1.8 }}>
                {renderAgentText(AGENT_TEXT)}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
