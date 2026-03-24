import { card, colors } from '@/lib/portal/styles'
import { StatusBadge } from './StatusBadge'
import type { PortalChangeRequest } from '@/lib/portal/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function ChangeRequestCard({ cr }: { cr: PortalChangeRequest }) {
  return (
    <div style={{ ...card, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark, textTransform: 'capitalize' }}>
          {cr.section}
        </span>
        <StatusBadge status={cr.status} />
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: colors.textLight }}>
          {formatDate(cr.requested_at)}
        </span>
      </div>
      {cr.reviewer_note && (
        <div style={{ fontSize: '12px', color: colors.textMuted, padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
          Note: {cr.reviewer_note}
        </div>
      )}
    </div>
  )
}
