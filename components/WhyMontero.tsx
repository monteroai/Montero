const CARDS = [
  {
    title: 'See It Before You Pay',
    body: 'We build a working prototype before you commit. Test it, break it, validate it — then decide.',
  },
  {
    title: 'Built for Your Business',
    body: 'Not a template. Custom systems designed around how you actually work.',
  },
  {
    title: 'Results in Days',
    body: 'While other agencies are still in discovery calls, we\'re delivering working solutions.',
  },
  {
    title: 'Zero Upfront Risk',
    body: 'If the prototype doesn\'t solve your problem, you walk away. No invoice.',
  },
]

const STATS = [
  { number: '15+', unit: 'Hours', label: 'saved weekly per client through automation' },
  { number: '2',   unit: 'hrs',   label: 'time to working prototype from first call' },
  { number: '0',   unit: '',      label: 'upfront cost before you see your solution' },
]

export function WhyMontero() {
  return (
    <>
      {/* ── Why Montero ─────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#050505' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '16px' }}>
              Why montero.
            </div>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: '#FFFFFF', maxWidth: '500px' }}>
              The way it should have always worked.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px' }}>
            {CARDS.map((card, i) => (
              <div key={i} style={{
                padding: '36px 30px',
                background: i % 2 === 0 ? '#0e0e0e' : '#111111',
                border: '1px solid rgba(255,166,0,0.08)',
              }}>
                <div style={{
                  width: '32px', height: '2px', background: '#ffa600',
                  marginBottom: '20px', borderRadius: '1px',
                }} />
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px', lineHeight: 1.3 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <section style={{ padding: '64px 24px', background: '#0a0a0a', borderTop: '1px solid rgba(255,166,0,0.08)', borderBottom: '1px solid rgba(255,166,0,0.08)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 700, color: '#ffa600', lineHeight: 1 }}>
                  {s.number}
                </span>
                {s.unit && (
                  <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,166,0,0.6)' }}>{s.unit}</span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: '200px', margin: '0 auto' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Free Prototype CTA ──────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#050505', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px', lineHeight: 1.15 }}>
            Start with a free prototype.
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, marginBottom: '40px' }}>
            Before you spend a dollar, we build your solution and show you exactly how it works. Real estate teams, restaurants, law firms — if your business has repetitive processes, we can automate them.
          </p>
          <a href="#contact" style={{
            display: 'inline-block',
            padding: '16px 36px', fontSize: '16px', fontWeight: 700,
            background: '#ffa600', color: '#0a0a0a',
            borderRadius: '10px', textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Get Your Free Prototype
          </a>
        </div>
      </section>
    </>
  )
}
