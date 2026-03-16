'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/* ── SVG outline icons ─────────────────────────────────────── */
function IconBolt() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}
function IconWorkflow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17.5 14v7M14 17.5h7" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-7" />
    </svg>
  )
}
function IconPen() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

const ICONS = [IconBolt, IconWorkflow, IconChart, IconPen]

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

/* ── 3D tilt card ──────────────────────────────────────────── */
function TiltCard({ children, i }: { children: React.ReactNode; i: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 8 })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setTilt({ x: 0, y: 0 }) }}
      style={{
        padding: '32px 28px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: hovering ? 'transform 0.1s ease, box-shadow 0.3s, border-color 0.3s' : 'transform 0.4s ease, box-shadow 0.3s, border-color 0.3s',
        boxShadow: hovering ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,162,74,0.12)' : 'none',
        borderColor: hovering ? 'rgba(212,162,74,0.2)' : 'var(--border)',
      }}
    >
      {/* Spotlight on hover */}
      {hovering && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(300px circle at ${(tilt.y / 8 + 0.5) * 100}% ${(-tilt.x / 8 + 0.5) * 100}%, rgba(212,162,74,0.06) 0%, transparent 70%)`,
        }} />
      )}
      {children}
    </motion.div>
  )
}

export function Services() {
  return (
    <section id="services" data-circuit-zone="2" style={{ padding: '120px 24px' }}>
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
          {SERVICES.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <TiltCard key={i} i={i}>
                {/* Ghost number */}
                <div style={{
                  position: 'absolute', bottom: '-8px', right: '12px',
                  fontFamily: 'var(--font-cinzel)', fontSize: '72px', fontWeight: 700,
                  color: 'rgba(212,162,74,0.04)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Icon />
                </div>
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
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
