import { card, colors } from '@/lib/portal/styles'
import { StatusBadge } from './StatusBadge'
import type { PortalDocument } from '@/lib/portal/types'

const typeIcons: Record<string, string> = {
  contract: '📄',
  invoice: '💰',
  onboarding: '📋',
  upload: '📎',
  'automation-guide': '🤖',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function DocumentCard({ doc }: { doc: PortalDocument }) {
  return (
    <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '24px' }}>{typeIcons[doc.type] || '📄'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textDark }}>{doc.title}</div>
        <div style={{ fontSize: '12px', color: colors.textLight, marginTop: '2px' }}>{formatDate(doc.created_at)}</div>
      </div>
      <StatusBadge status={doc.status} />
      {doc.file_url && (
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)',
            color: colors.blue, textDecoration: 'none',
          }}
        >
          Download
        </a>
      )}
    </div>
  )
}
