import { card, colors } from '@/lib/portal/styles'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: string
}

export function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <div style={{ ...card, padding: '20px', flex: 1, minWidth: '160px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: accent || colors.infoBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.blue,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: colors.textDark }}>
        {value}
      </div>
    </div>
  )
}
