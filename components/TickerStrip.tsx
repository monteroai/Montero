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
  'Agent OS',
  'Zero Upfront Risk',
]

export function TickerStrip() {
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, var(--bg) 0%, transparent 8%, transparent 92%, var(--bg) 100%)',
      }} />

      <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 30s linear infinite' }}>
        {[0, 1].map(idx => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingRight: '24px' }}>
            {ITEMS.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', whiteSpace: 'nowrap' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(212,162,74,0.5)',
                }}>
                  {item}
                </span>
                <span style={{ color: 'rgba(212,162,74,0.15)', fontSize: '8px' }}>●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
