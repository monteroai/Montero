'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ElectricalGrid } from './ElectricalGrid'
import { BullMark } from './BullMark'

const ROTATING = [
  'AI Automation',
  'Custom Workflows',
  'Market Intelligence',
  'Content Generation',
]

// Ambient orb configs
const ORBS = [
  { size: 480, top: '5%',  left: '10%',  delay: 0,  dur: 20, x: [0, 80, -30, 50, 0], y: [0, -60, 40, -30, 0], color: 'rgba(255,166,0,0.07)' },
  { size: 360, top: '50%', left: '65%',  delay: 4,  dur: 26, x: [0, -60, 40, -20, 0], y: [0, 50, -40, 20, 0],  color: 'rgba(255,191,31,0.05)' },
  { size: 280, top: '70%', left: '20%',  delay: 8,  dur: 18, x: [0, 40, -50, 30, 0],  y: [0, -30, 60, -40, 0], color: 'rgba(255,166,0,0.04)' },
]

export function MainHero() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false })

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    })
  }, [])

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight(s => ({ ...s, active: false }))}
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {/* Electrical grid (parallax) */}
      <motion.div style={{ position: 'absolute', inset: 0, y: gridY }}>
        <ElectricalGrid />
      </motion.div>

      {/* Ambient glow orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ x: orb.x, y: orb.y }}
          transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
          style={{
            position: 'absolute',
            width: orb.size, height: orb.size,
            top: orb.top, left: orb.left,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}

      {/* Mouse spotlight */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `radial-gradient(700px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,166,0,0.06) 0%, transparent 70%)`,
        opacity: spotlight.active ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }} />

      {/* Bull watermark */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 3,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <BullMark size={340} opacity={0.055} />
        </motion.div>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '120px 24px 80px', maxWidth: '860px' }}>

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
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
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
            filter: 'drop-shadow(0 0 60px rgba(255,166,0,0.18))',
          }}>
          MONTERO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, maxWidth: '600px', margin: '0 auto 40px' }}>
          Automation &amp; AI for businesses that move fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
          style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#case-studies" style={{
            padding: '14px 30px', fontSize: '15px', fontWeight: 600,
            border: '1px solid rgba(255,166,0,0.4)', color: '#ffa600',
            borderRadius: '10px', textDecoration: 'none',
            background: 'rgba(255,166,0,0.06)',
            transition: 'background 0.25s ease, box-shadow 0.25s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,166,0,0.14)'
              el.style.boxShadow = '0 0 20px rgba(255,166,0,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,166,0,0.06)'
              el.style.boxShadow = 'none'
            }}>
            See Our Work
          </a>
          <a href="#contact" style={{
            padding: '14px 30px', fontSize: '15px', fontWeight: 600,
            background: '#ffa600', color: '#0a0a0a',
            borderRadius: '10px', textDecoration: 'none',
            transition: 'opacity 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 0 rgba(255,166,0,0)',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.opacity = '0.9'
              el.style.boxShadow = '0 0 32px rgba(255,166,0,0.35)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.opacity = '1'
              el.style.boxShadow = '0 0 0 rgba(255,166,0,0)'
            }}>
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
