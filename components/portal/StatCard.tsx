import { card, colors } from '@/lib/portal/styles'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: string
  delta?: string
  deltaUp?: boolean
}

// Soft-glass stat tile: label top-left, icon floating in a soft circle
// top-right, large value beneath, optional green/red delta chip.
export function StatCard({ icon, label, value, accent, delta, deltaUp = true }: StatCardProps) {
  return (
    <div style={{ ...card, padding: '20px 22px', flex: 1, minWidth: '170px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500, paddingTop: '6px' }}>{label}</span>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: accent || 'rgba(37,99,235,0.09)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 2px 6px rgba(23,32,64,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.blue, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '30px', fontWeight: 700, color: colors.textDark, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </span>
        {delta && (
          <span style={{
            fontSize: '12px', fontWeight: 600,
            color: deltaUp ? colors.success : colors.error,
            display: 'inline-flex', alignItems: 'center', gap: '3px',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaUp ? undefined : 'rotate(90deg)' }}>
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
