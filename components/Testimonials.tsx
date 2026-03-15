'use client'

import { motion } from 'framer-motion'

const QUOTES = [
  {
    quote: "Montero built our market intelligence dashboard in a week. What used to take my team 3 hours of manual data pulling now updates automatically every morning.",
    name: 'Charles Magyar',
    title: "The Magyar Team · Sotheby's International Realty",
    initials: 'CM',
  },
  {
    quote: "Two hours after our first call I had a working AI remarks tool generating MLS copy in my voice. Signed the next day.",
    name: 'Sarah Villanueva',
    title: 'Residential Agent · Greenwich, CT',
    initials: 'SV',
  },
  {
    quote: "Montero was the only agency who showed us a live demo before asking for a dollar. It wasn't even close.",
    name: 'Marco Bellini',
    title: 'Owner · Bellini Restaurant Group',
    initials: 'MB',
  },
]

export function Testimonials() {
  return (
    <section style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
            Client Results
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600 }}>
            Don't take our word for it.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {QUOTES.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '28px 24px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, flex: 1, fontStyle: 'italic' }}>
                &ldquo;{q.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-cinzel)', fontSize: '12px', fontWeight: 600, color: 'var(--gold)',
                }}>
                  {q.initials}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{q.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{q.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
