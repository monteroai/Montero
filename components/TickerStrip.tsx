'use client'

const ITEMS = [
  'AI Automation',
  'Custom Workflows',
  'Market Intelligence',
  'Content Generation',
  'n8n Pipelines',
  'Real Estate AI',
  'Restaurant Analytics',
  'Law Firm Automation',
  'Zero Upfront Risk',
  'Results in Days',
  'Agent OS',
  'Supabase Integration',
]

const SEP = '·'

export function TickerStrip() {
  const content = ITEMS.flatMap(item => [item, SEP]).join(' ')

  return (
    <div style={{
      background: '#050505',
      borderTop: '1px solid rgba(255,166,0,0.08)',
      borderBottom: '1px solid rgba(255,166,0,0.08)',
      padding: '14px 0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, #050505 0%, transparent 8%, transparent 92%, #050505 100%)',
      }} />

      <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 28s linear infinite' }}>
        {/* Duplicate for seamless loop */}
        {[0, 1].map(idx => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '20px' }}>
            {ITEMS.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', whiteSpace: 'nowrap' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'rgba(255,166,0,0.55)',
                }}>
                  {item}
                </span>
                <span style={{ color: 'rgba(255,166,0,0.2)', fontSize: '10px' }}>·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
