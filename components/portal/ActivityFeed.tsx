'use client'

import { useState } from 'react'
import { card, colors } from '@/lib/portal/styles'
import { StatusBadge } from './StatusBadge'
import { INTERACTION_ICONS } from '@/lib/portal/constants'
import type { PortalInteraction } from '@/lib/portal/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface ActivityFeedProps {
  interactions: PortalInteraction[]
  compact?: boolean
}

export function ActivityFeed({ interactions, compact }: ActivityFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (interactions.length === 0) {
    return (
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: colors.textMuted }}>No activity yet. Interactions will appear here once your automations are running.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {interactions.map(item => {
        const icon = INTERACTION_ICONS[item.type] || { label: item.type, emoji: '📌' }
        const expanded = expandedId === item.id
        return (
          <div
            key={item.id}
            onClick={() => setExpandedId(expanded ? null : item.id)}
            style={{
              ...card,
              padding: compact ? '10px 14px' : '14px 18px',
              cursor: item.detail ? 'pointer' : 'default',
              borderLeft: item.flagged ? `3px solid ${item.flag_reason?.includes('error') ? colors.error : colors.warning}` : undefined,
              transition: 'box-shadow 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: compact ? '16px' : '20px' }}>{icon.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : undefined }}>
                  {item.summary}
                </div>
                {!compact && item.flagged && item.flag_reason && (
                  <div style={{ fontSize: '12px', color: colors.warning, marginTop: '2px' }}>
                    Flag: {item.flag_reason}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {item.flagged && <StatusBadge status="pending" label="Flagged" />}
                <span style={{ fontSize: '12px', color: colors.textLight, whiteSpace: 'nowrap' }}>
                  {timeAgo(item.created_at)}
                </span>
              </div>
            </div>
            {expanded && item.detail && (
              <div style={{
                marginTop: '10px', padding: '12px', borderRadius: '10px',
                background: '#f8fafc', fontSize: '13px', color: colors.textDark, lineHeight: '1.6',
              }}>
                {item.detail}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
