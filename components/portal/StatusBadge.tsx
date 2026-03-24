import { colors } from '@/lib/portal/styles'

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: colors.successBg, color: colors.success, label: 'Active' },
  running: { bg: colors.successBg, color: colors.success, label: 'Running' },
  success: { bg: colors.successBg, color: colors.success, label: 'Success' },
  idle: { bg: '#f1f5f9', color: '#64748b', label: 'Idle' },
  stopped: { bg: '#f1f5f9', color: '#64748b', label: 'Stopped' },
  error: { bg: colors.errorBg, color: colors.error, label: 'Error' },
  pending: { bg: colors.warningBg, color: colors.warning, label: 'Pending' },
  approved: { bg: colors.successBg, color: colors.success, label: 'Approved' },
  rejected: { bg: colors.errorBg, color: colors.error, label: 'Rejected' },
  signed: { bg: colors.successBg, color: colors.success, label: 'Signed' },
  live: { bg: colors.successBg, color: colors.success, label: 'Live' },
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = statusMap[status] || { bg: '#f1f5f9', color: '#64748b', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {label || s.label}
    </span>
  )
}
