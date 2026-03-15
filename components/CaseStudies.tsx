'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BullMark } from './BullMark'

/* ── Abstract data-viz SVG backgrounds instead of stock photos ── */
const CHART_BARS = [58, 82, 44, 92, 67, 78, 86, 61, 95, 72, 88, 55]
const HEAT = [0.9, 0.3, 0.6, 0.8, 0.2, 0.7, 0.4, 0.5, 0.8, 0.9, 0.2, 0.6, 0.7, 0.1, 0.8, 0.3, 0.9, 0.5, 0.4, 0.6, 0.7, 0.8, 0.2, 0.3, 0.6, 0.9, 0.4, 0.7, 0.3, 0.8, 0.5, 0.1, 0.9, 0.6, 0.2, 0.8]

function DashboardViz({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Gradient bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(9,9,11,0.95) 0%, rgba(20,18,12,0.92) 50%, rgba(9,9,11,0.95) 100%)',
      }} />
      {/* Animated parallax chart */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '20px', right: '20px', height: '120px',
        display: 'flex', alignItems: 'flex-end', gap: '4px', opacity: 0.35,
        transform: `translate(${mouse.x * 0.02}px, ${mouse.y * 0.02}px)`,
        transition: 'transform 0.3s ease',
      }}>
        {CHART_BARS.map((h, j) => (
          <motion.div
            key={j}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: j * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              background: 'linear-gradient(to top, var(--gold), rgba(212,162,74,0.3))',
              borderRadius: '2px 2px 0 0',
            }}
          />
        ))}
      </div>
      {/* Grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
        {[0.25, 0.5, 0.75].map(y => (
          <line key={y} x1="0" y1={`${y * 100}%`} x2="100%" y2={`${y * 100}%`} stroke="var(--gold)" strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
      </svg>
      {/* Floating data point */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '25%', right: '15%',
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--gold)', boxShadow: '0 0 12px rgba(212,162,74,0.4)',
        }}
      />
    </div>
  )
}

function HeatmapViz({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(9,9,11,0.95) 0%, rgba(12,18,12,0.92) 50%, rgba(9,9,11,0.95) 100%)',
      }} />
      {/* Heatmap grid */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(calc(-50% + ${mouse.x * 0.03}px), calc(-50% + ${mouse.y * 0.03}px))`,
        transition: 'transform 0.3s ease',
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', opacity: 0.4,
      }}>
        {HEAT.map((v, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: j * 0.02 }}
            style={{
              width: 16, height: 16, borderRadius: 3,
              background: `rgba(34,197,94,${v * 0.8})`,
            }}
          />
        ))}
      </div>
      {/* Radar circle */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute', top: '20%', left: '20%',
          width: 60, height: 60, borderRadius: '50%',
          border: '1px solid rgba(34,197,94,0.3)',
        }}
      />
    </div>
  )
}

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
    Viz: DashboardViz,
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
    Viz: HeatmapViz,
  },
]

function CaseCard({ c, i }: { c: typeof CASES[0]; i: number }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({
      x: (e.clientX - rect.left) / rect.width * 2 - 1,
      y: (e.clientY - rect.top) / rect.height * 2 - 1,
    })
  }, [])

  const Viz = c.Viz

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setMouse({ x: 0, y: 0 }) }}
      style={{
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-raised)',
        position: 'relative',
        transform: `perspective(800px) rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 3}deg)`,
        transition: hovering ? 'transform 0.1s ease, box-shadow 0.3s, border-color 0.3s' : 'transform 0.5s ease, box-shadow 0.3s, border-color 0.3s',
        boxShadow: hovering ? '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,162,74,0.12)' : 'none',
        borderColor: hovering ? 'rgba(212,162,74,0.15)' : 'var(--border)',
      }}
    >
      {/* Abstract data-viz background */}
      <div style={{ position: 'relative', height: '200px' }}>
        <Viz mouse={mouse} />
        <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
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
      <div style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.06, pointerEvents: 'none' }}>
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
              <span style={{ color: 'var(--gold)', flexShrink: 0 }}>--</span>{o}
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
  )
}

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
            <CaseCard key={i} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
