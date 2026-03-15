'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const CARDS = [
  { title: 'See It Before You Pay', body: 'We build a working prototype before you commit. Test it, break it, then decide.' },
  { title: 'Built for Your Business', body: 'Not a template. Custom systems designed around how you actually work.' },
  { title: 'Results in Days', body: "While other agencies are still in discovery calls, we're delivering working solutions." },
  { title: 'Zero Upfront Risk', body: "If the prototype doesn't solve your problem, you walk away. No invoice." },
]

const STATS_DATA = [
  { target: 15, suffix: '+', unit: 'hrs', label: 'saved weekly per client' },
  { target: 2, suffix: '', unit: 'hr', label: 'time to working prototype' },
  { target: 0, suffix: '', unit: '$', label: 'upfront cost to get started' },
]

function AnimatedStat({ stat, inView }: { stat: typeof STATS_DATA[0]; inView: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView || stat.target === 0) return
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 1000, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * stat.target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, stat.target])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>
        {stat.target === 0 ? (
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
            {stat.unit}0
          </span>
        ) : (
          <>
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
              {count}{stat.suffix}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(212,162,74,0.5)' }}>{stat.unit}</span>
          </>
        )}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: '180px', margin: '0 auto' }}>
        {stat.label}
      </p>
    </motion.div>
  )
}

export function WhyMontero() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <>
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '64px' }}
          >
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
              Why MONTERO
            </p>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, maxWidth: '460px' }}>
              The way it should have always worked.
            </h2>
          </motion.div>

          <div style={{ position: 'relative', paddingLeft: '48px' }}>
            {/* Connecting timeline line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', left: '15px', top: 0,
                width: '1px', background: 'linear-gradient(to bottom, var(--gold), rgba(212,162,74,0.1))',
              }}
            />

            {CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'relative',
                  padding: '28px 28px 28px 32px',
                  marginBottom: i < CARDS.length - 1 ? '8px' : 0,
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,162,74,0.2)'
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,162,74,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Timeline node */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 + 0.1 }}
                  style={{
                    position: 'absolute', left: '-40px', top: '32px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: 'var(--bg)', border: '2px solid var(--gold)',
                    boxShadow: '0 0 12px rgba(212,162,74,0.25)',
                  }}
                />

                {/* Step number */}
                <span style={{
                  fontFamily: 'var(--font-cinzel)', fontSize: '11px', fontWeight: 700,
                  color: 'var(--gold)', letterSpacing: '0.1em', display: 'block', marginBottom: '10px',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.3 }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section ref={ref} style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {STATS_DATA.map((s, i) => (
            <AnimatedStat key={i} stat={s} inView={inView} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 700, marginBottom: '20px', lineHeight: 1.15 }}
          >
            Start with a free prototype.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}
          >
            We build your solution and show you exactly how it works — before you spend a dollar.
          </motion.p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(212,162,74,0.25)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-block', padding: '14px 32px', fontSize: '15px', fontWeight: 700,
              background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius)',
            }}
          >
            Get Your Free Prototype
          </motion.a>
        </div>
      </section>
    </>
  )
}
