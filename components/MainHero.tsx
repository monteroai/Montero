'use client'

import { motion } from 'framer-motion'
import { BullMark } from './BullMark'

export function MainHero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '600px',
        background: 'radial-gradient(ellipse, rgba(212,162,74,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        textAlign: 'center',
        padding: '120px 24px 80px',
        maxWidth: '720px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '32px' }}
        >
          <BullMark size={48} opacity={0.35} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 'clamp(52px, 9vw, 88px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #e8c774 0%, #d4a24a 50%, #b8892e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.05,
            marginBottom: '20px',
          }}
        >
          MONTERO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
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
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="#case-studies" style={{
            padding: '13px 28px',
            fontSize: '14px',
            fontWeight: 600,
            border: '1px solid var(--gold-border)',
            color: 'var(--gold)',
            borderRadius: 'var(--radius)',
            background: 'var(--gold-dim)',
            transition: 'background 0.2s, border-color 0.2s',
          }}>
            See Our Work
          </a>
          <a href="#contact" style={{
            padding: '13px 28px',
            fontSize: '14px',
            fontWeight: 600,
            background: 'var(--gold)',
            color: 'var(--bg)',
            borderRadius: 'var(--radius)',
            transition: 'opacity 0.2s',
          }}>
            Get Started
          </a>
        </motion.div>
      </div>
    </section>
  )
}
