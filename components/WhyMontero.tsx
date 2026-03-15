'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const CARDS = [
  { title: 'See It Before You Pay', body: 'We build a working prototype before you commit. Test it, break it, then decide.' },
  { title: 'Built for Your Business', body: 'Not a template. Custom systems designed around how you actually work.' },
  { title: 'Results in Days', body: "While other agencies are still in discovery calls, we're delivering working solutions." },
  { title: 'Zero Upfront Risk', body: "If the prototype doesn't solve your problem, you walk away. No invoice." },
]

const STATS = [
  { value: '15+', label: 'hours saved weekly per client' },
  { value: '2hr', label: 'time to working prototype' },
  { value: '$0', label: 'upfront cost before you see results' },
]

export function WhyMontero() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <>
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
              Why MONTERO
            </p>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, maxWidth: '460px' }}>
              The way it should have always worked.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ padding: '32px 28px', background: 'var(--bg)' }}
              >
                <div style={{ width: '28px', height: '2px', background: 'var(--gold)', marginBottom: '20px', borderRadius: '1px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.3 }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ref} style={{ padding: '56px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.12 }}>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '8px' }}>{s.value}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: '180px', margin: '0 auto' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 700, marginBottom: '20px', lineHeight: 1.15 }}>
            Start with a free prototype.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
            We build your solution and show you exactly how it works — before you spend a dollar.
          </p>
          <a href="#contact" style={{
            display: 'inline-block', padding: '14px 32px', fontSize: '15px', fontWeight: 700,
            background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius)',
          }}>
            Get Your Free Prototype
          </a>
        </div>
      </section>
    </>
  )
}
