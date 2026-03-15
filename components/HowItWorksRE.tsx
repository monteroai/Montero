'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

const STEPS = [
  {
    n: '01',
    title: 'Build your DNA profile',
    body: 'Tell us your voice, your market, and your tone. Takes 5 minutes once. Every piece of content after that sounds like you — not a generic AI template.',
  },
  {
    n: '02',
    title: 'Upload your listing',
    body: 'Drop your photos and the property address. Agent OS reads every room, identifies features, and pulls context from the listing automatically.',
  },
  {
    n: '03',
    title: 'Get your full package',
    body: 'MLS remarks, Instagram caption, SMS teaser, email content, and a live branded presentation website — all ready in under 60 seconds.',
  },
]

const CIRCUMFERENCE = 2 * Math.PI * 28

function StepSVG({ index, inView }: { index: number; inView: boolean }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 320 240" width="320" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="240" rx="12" fill="#0d1829" />
        <rect x="20" y="18" width="280" height="1" stroke="rgba(201,168,76,0.15)" strokeWidth="1" fill="none" />
        <text x="24" y="42" fontFamily="Inter, sans-serif" fontSize="12" fill="rgba(201,168,76,0.9)" fontWeight="600">Your Voice Profile</text>
        <text x="24" y="72" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Your Name</text>
        <rect x="24" y="78" width="160" height="28" rx="8" stroke="rgba(201,168,76,0.4)" strokeWidth="1" fill="rgba(201,168,76,0.04)" />
        <text x="24" y="124" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Writing Style</text>
        <rect x="24" y="130" width="160" height="28" rx="8" stroke="rgba(201,168,76,0.4)" strokeWidth="1" fill="rgba(201,168,76,0.04)" />
        <text x="24" y="176" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Market Area</text>
        <rect x="24" y="182" width="160" height="28" rx="8" stroke="rgba(201,168,76,0.4)" strokeWidth="1" fill="rgba(201,168,76,0.08)" />
        <rect x="26" y="184" width={inView ? 80 : 0} height="24" rx="6" fill="rgba(201,168,76,0.2)" style={{ transition: 'width 1s ease' }} />
        <rect x="220" y="194" width="76" height="28" rx="8" fill="rgba(201,168,76,0.3)" />
        <text x="258" y="213" fontFamily="Inter, sans-serif" fontSize="11" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontWeight="600">Save Profile</text>
      </svg>
    )
  }
  if (index === 1) {
    const cells = [
      { x: 24, y: 60 }, { x: 112, y: 60 }, { x: 200, y: 60 },
      { x: 24, y: 128 }, { x: 112, y: 128 }, { x: 200, y: 128 },
    ]
    const filled = [0, 1, 2, 3]
    return (
      <svg viewBox="0 0 320 240" width="320" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="240" rx="12" fill="#0d1829" />
        {cells.map((c, i) => (
          filled.includes(i) ? (
            <g key={i}>
              <rect x={c.x} y={c.y} width="80" height="60" rx="8" fill="#1B2B5E" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
              <rect x={c.x + 20} y={c.y + 22} width="40" height="22" rx="2" fill="rgba(201,168,76,0.2)" />
              <polygon points={`${c.x + 25},${c.y + 22} ${c.x + 55},${c.y + 22} ${c.x + 40},${c.y + 10}`} fill="rgba(201,168,76,0.35)" />
            </g>
          ) : (
            <rect key={i} x={c.x} y={c.y} width="80" height="60" rx="8" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1" strokeDasharray="6 3" />
          )
        ))}
        <rect x="24" y="200" width="272" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
        <rect x="24" y="200" width="182" height="6" rx="3" fill="rgba(201,168,76,0.6)" />
        <text x="24" y="220" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.5)">4 of 6 photos</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 320 240" width="320" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="240" rx="12" fill="#0d1829" />
      <text x="24" y="36" fontFamily="Inter, sans-serif" fontSize="11" fill="rgba(201,168,76,0.8)" fontWeight="600" letterSpacing="0.1em">MLS REMARKS</text>
      <rect x="24" y="44" width="272" height="1" fill="rgba(201,168,76,0.15)" />
      {[
        { y: 72, w: 280 },
        { y: 96, w: 260 },
        { y: 120, w: 270 },
        { y: 144, w: 240 },
        { y: 168, w: 180 },
      ].map((line, i) => (
        <motion.line
          key={i}
          x1="24" y1={line.y} x2={24 + line.w} y2={line.y}
          stroke="rgba(255,255,255,0.6)" strokeWidth="8" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.12 }}
        />
      ))}
      <rect x="218" y="196" width="78" height="28" rx="8" fill="rgba(201,168,76,0.25)" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
      <text x="257" y="215" fontFamily="Inter, sans-serif" fontSize="11" fill="rgba(201,168,76,0.9)" textAnchor="middle" fontWeight="600">Copy</text>
    </svg>
  )
}

export function HowItWorksRE() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  const { scrollYProgress } = useScroll({ target: sectionRef })
  const stepMotion = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])

  useMotionValueEvent(stepMotion, 'change', (v) => {
    setActiveStep(Math.round(v))
  })

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      style={{ position: 'relative', height: '300vh', background: '#050A1A' }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', overflow: 'hidden', alignItems: 'stretch' }}>

        {/* Left panel */}
        <div style={{
          width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 60px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '48px' }}>
            How it works
          </div>
          {STEPS.map((step, i) => {
            const isActive = activeStep === i
            return (
              <motion.div
                key={step.n}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                style={{ position: i === 0 ? 'relative' : 'absolute', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', pointerEvents: isActive ? 'auto' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" stroke="rgba(201,168,76,0.15)" strokeWidth="2" fill="none" />
                    <motion.circle
                      cx="32" cy="32" r="28"
                      stroke="#C9A84C" strokeWidth="2" fill="none"
                      strokeDasharray={CIRCUMFERENCE}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: isActive ? 0 : CIRCUMFERENCE }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
                    />
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C' }}>
                    {step.n}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '28px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                  {step.body}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Right panel */}
        <div style={{
          width: '40%',
          background: '#0d1829',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
          className="hide-on-mobile"
        >
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: activeStep === i ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                pointerEvents: activeStep === i ? 'auto' : 'none',
              }}
            >
              <StepSVG index={i} inView={activeStep === i} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
