'use client'

import { useState, useEffect } from 'react'
import { colors, gradientButton } from '@/lib/portal/styles'
import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { useBusiness } from '@/lib/portal/BusinessContext'
import type { PortalInteraction } from '@/lib/portal/types'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'call', label: 'Calls' },
  { key: 'form', label: 'Forms' },
  { key: 'email', label: 'Emails' },
  { key: 'chat', label: 'Chat' },
  { key: 'flagged', label: 'Flagged' },
]

export default function ActivityPage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [interactions, setInteractions] = useState<PortalInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!activeBusinessId) {
      setInteractions([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const params = new URLSearchParams({ business_id: activeBusinessId, limit: '50' })
    if (filter === 'flagged') params.set('filter', 'flagged')
    else if (filter) params.set('type', filter)

    fetch(`/api/portal/activity?${params}`)
      .then(r => r.json())
      .then(d => { setInteractions(d.interactions || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeBusinessId, filter])

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          Activity {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>· {activeBusiness.business_name}</span>}
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          {activeBusinessId ? `${total} total interactions recorded.` : 'Add a business to see its activity.'}
        </p>
      </div>

      {activeBusinessId && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === f.key ? colors.navy : 'rgba(255,255,255,0.7)',
                color: filter === f.key ? '#ffffff' : colors.textMuted,
                fontFamily: 'inherit',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {!activeBusinessId ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>No business selected.</div>
      ) : loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
      ) : (
        <ActivityFeed interactions={interactions} />
      )}

      {activeBusinessId && interactions.length >= 50 && (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <button style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px' }}>
            Load More
          </button>
        </div>
      )}
    </>
  )
}
