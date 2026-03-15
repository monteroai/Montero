'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ElectricalGrid } from './ElectricalGrid'
import { BullMark } from './BullMark'

const ROTATING = [
  'AI Automation',
  'Custom Workflows',
  'Market Intelligence',
  'Content Generation',
]

export function MainHero() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const { scrollY } = useScroll()
  const gridY = useTransform(scrollY, [0, 500], [0, -150])

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % ROTATING.length)
        setVisible(true)
      }, 400)
    }, 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <motion.div style={{ position: 'absolute', inset: 0, y: gridY }}>
        <ElectricalGrid />
      </motion.div>

      {/* Bull watermark */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Radial glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '520px', height: '520px',
              background: 'radial-gradient(circle, rgba(255,166,0,0.10) 0%, transparent 68%)',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {/* Bull icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          >
            <BullMark size={340} opacity={0.055} />
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 24px 80px', maxWidth: '860px' }}>

        {/* Rotating tag */}
        <div style={{
          fontSize: '13px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#ffa600', marginBottom: '28px',
          opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
        }}>
          {ROTATING[idx]}
        </div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: 'clamp(52px, 9vw, 96px)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            background: 'linear-gradient(135deg, #ffd470 0%, #ffa600 50%, #ffbf1f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px',
            lineHeight: 1.05,
          }}>
          MONTERO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
          style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, maxWidth: '600px', margin: '0 auto 40px' }}>
          Automation &amp; AI for businesses that move fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.65 }}
          style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#case-studies" style={{
            padding: '14px 30px', fontSize: '15px', fontWeight: 600,
            border: '1px solid rgba(255,166,0,0.4)', color: '#ffa600',
            borderRadius: '10px', textDecoration: 'none',
            background: 'rgba(255,166,0,0.06)',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,166,0,0.14)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,166,0,0.06)')}>
            See Our Work
          </a>
          <a href="#contact" style={{
            padding: '14px 30px', fontSize: '15px', fontWeight: 600,
            background: '#ffa600', color: '#0a0a0a',
            borderRadius: '10px', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
            Get Started
          </a>
        </motion.div>

        {/* Scroll hint */}
        <div style={{ marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,166,0,0.3)' }}>scroll</span>
          <div style={{
            width: '1px', height: '48px',
            background: 'linear-gradient(to bottom, rgba(255,166,0,0.5), transparent)',
          }} />
        </div>
      </div>
    </section>
  )
}
