'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BullMark } from './BullMark'

const ROTATING = [
  'AI Automation',
  'Custom Workflows',
  'Market Intelligence',
  'Content Generation',
  'n8n Pipelines',
  'Agent OS',
]

export function MainHero() {
  const [idx, setIdx] = useState(0)
  const [mouse, setMouse] = useState({ x: 50, y: 50, active: false })

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ROTATING.length), 2600)
    return () => clearInterval(t)
  }, [])

  const handleMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    })
  }, [])

  return (
    <section
      data-circuit-zone="1"
      onMouseMove={handleMouse}
      onMouseLeave={() => setMouse(s => ({ ...s, active: false }))}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(212,162,74,0.12) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 10%, transparent 65%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 10%, transparent 65%)',
      }} />

      {/* Scan line sweeping over grid */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to bottom, transparent, rgba(212,162,74,0.04), transparent)',
        animation: 'gridScan 10s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Ambient glow orbs */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '10%', left: '15%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,74,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{
          position: 'absolute', top: '50%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,74,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }}
      />

      {/* Mouse-follow glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(212,162,74,0.05) 0%, transparent 70%)`,
        opacity: mouse.active ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }} />

      {/* Bull watermark */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          <BullMark size={320} opacity={0.04} />
        </motion.div>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center',
        padding: '120px 24px 80px',
        maxWidth: '800px',
      }}>
        {/* Rotating tag */}
        <div style={{ height: '24px', marginBottom: '28px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              {ROTATING[idx]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 'clamp(56px, 10vw, 96px)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, #e8c774 0%, #d4a24a 40%, #b8892e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.05,
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 40px rgba(212,162,74,0.15))',
          }}
        >
          MONTERO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{
            fontSize: 'clamp(17px, 2.5vw, 20px)',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: '520px',
            margin: '0 auto 40px',
          }}
        >
          AI automation for businesses that move fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="#case-studies" style={{
            padding: '13px 28px', fontSize: '14px', fontWeight: 600,
            border: '1px solid var(--gold-border)', color: 'var(--gold)',
            borderRadius: 'var(--radius)', background: 'var(--gold-dim)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212,162,74,0.18)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(212,162,74,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--gold-dim)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            See Our Work
          </a>
          <a href="#contact" style={{
            padding: '13px 28px', fontSize: '14px', fontWeight: 600,
            background: 'var(--gold)', color: 'var(--bg)',
            borderRadius: 'var(--radius)',
            transition: 'all 0.25s ease',
            boxShadow: '0 0 0 rgba(212,162,74,0)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(212,162,74,0.3)'
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 0 rgba(212,162,74,0)'
              e.currentTarget.style.opacity = '1'
            }}
          >
            Get Started
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            scroll
          </span>
          <motion.div
            animate={{ height: [24, 48, 24] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              background: 'linear-gradient(to bottom, var(--gold), transparent)',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
