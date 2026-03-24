import { colors } from '@/lib/portal/styles'

const dotColors: Record<string, string> = {
  success: colors.success,
  active: colors.success,
  running: colors.success,
  error: colors.error,
  idle: colors.textLight,
  stopped: colors.textLight,
}

export function SystemStatusDot({ status }: { status: string }) {
  const color = dotColors[status] || colors.textLight
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8, borderRadius: '50%',
      background: color,
      boxShadow: color === colors.success ? `0 0 6px ${color}` : 'none',
    }} />
  )
}
