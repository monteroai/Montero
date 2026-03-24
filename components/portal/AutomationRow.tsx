'use client'

import { useState } from 'react'
import { card, colors } from '@/lib/portal/styles'
import { StatusBadge } from './StatusBadge'
import { CATEGORY_LABELS } from '@/lib/portal/constants'
import type { PortalAutomation } from '@/lib/portal/types'

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface AutomationRowProps {
  automation: PortalAutomation
  onToggle: (id: string, active: boolean) => Promise<void>
}

export function AutomationRow({ automation, onToggle }: AutomationRowProps) {
  const [toggling, setToggling] = useState(false)
  const [active, setActive] = useState(automation.active)
  const cat = CATEGORY_LABELS[automation.category] || { label: automation.category, color: '#64748b', bg: '#f1f5f9' }

  async function handleToggle() {
    setToggling(true)
    try {
      await onToggle(automation.id, !active)
      setActive(!active)
    } catch { /* error handled upstream */ }
    setToggling(false)
  }

  return (
    <div style={{ ...card, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: toggling ? 'wait' : 'pointer',
            background: active ? colors.success : '#cbd5e1',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            opacity: toggling ? 0.6 : 1,
          }}
        >
          <span style={{
            position: 'absolute', top: '2px',
            left: active ? '22px' : '2px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s',
          }} />
        </button>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textDark }}>{automation.friendly_name}</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: cat.bg, color: cat.color }}>
              {cat.label}
            </span>
          </div>
          {automation.description && (
            <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: '1.5' }}>{automation.description}</div>
          )}
        </div>

        {/* Status + last run */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <StatusBadge status={active ? (automation.last_status === 'error' ? 'error' : 'running') : 'stopped'} />
          <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '4px' }}>
            Last run: {timeAgo(automation.last_run)}
          </div>
        </div>
      </div>
    </div>
  )
}
