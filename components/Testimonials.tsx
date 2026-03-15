'use client'
import { motion } from 'framer-motion'

const QUOTES = [
  {
    quote: "Montero built our market intelligence dashboard in a week. What used to take my team 3 hours of manual data pulling now updates automatically every morning before I sit down.",
    name: 'Charles Magyar',
    title: 'The Magyar Team · Sotheby\'s International Realty',
    initials: 'CM',
  },
  {
    quote: "I was skeptical about the 'free prototype' offer. Two hours after our first call I had a working AI remarks tool generating MLS copy in my voice. Signed the next day.",
    name: 'Sarah Villanueva',
    title: 'Residential Agent · Greenwich, CT',
    initials: 'SV',
  },
  {
    quote: "We were evaluating three agencies. Montero was the only one who showed us a live demo before asking for a dollar. It wasn't even close.",
    name: 'Marco Bellini',
    title: 'Owner · Bellini Restaurant Group',
    initials: 'MB',
  },
]

export function Testimonials() {
  return (
    <section style={{ padding: '100px 24px', background: '#080808', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '300px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(255,166,0,0.04) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '16px' }}>
            Client Results
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF' }}>
            Don't take our word for it.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px' }}>
          {QUOTES.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                background: '#111111',
                boxShadow: 'inset 0 1px 0 rgba(255,166,0,0.12), 0 20px 60px rgba(0,0,0,0.5)',
              }}
              style={{
                padding: '36px 30px',
                background: '#0d0d0d',
                border: '1px solid rgba(255,166,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Gold quote mark */}
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '48px', lineHeight: 1, color: 'rgba(255,166,0,0.25)', marginBottom: '-16px', userSelect: 'none' }}>
                &ldquo;
              </div>

              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>
                {q.quote}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,166,0,0.08)' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(255,166,0,0.3) 0%, rgba(255,166,0,0.08) 100%)',
                  border: '1px solid rgba(255,166,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-cinzel)', fontSize: '13px', fontWeight: 600, color: '#ffa600',
                }}>
                  {q.initials}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{q.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,166,0,0.55)', marginTop: '2px' }}>{q.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
