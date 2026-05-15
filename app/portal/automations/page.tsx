'use client'

import { useState, useEffect } from 'react'
import { colors, secondaryButton } from '@/lib/portal/styles'
import { AutomationRow } from '@/components/portal/AutomationRow'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { createClient } from '@/lib/supabase/client'
import type { PortalAutomation } from '@/lib/portal/types'

export default function AutomationsPage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [automations, setAutomations] = useState<PortalAutomation[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Check admin flag once for this user (drives visibility of the Sync button)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('portal_clients').select('is_admin').eq('user_id', data.user.id).maybeSingle()
        .then(({ data: c }) => setIsAdmin(Boolean(c?.is_admin)))
    })
  }, [])

  function loadAutomations() {
    if (!activeBusinessId) {
      setAutomations([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/portal/automations?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => { setAutomations(d.automations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadAutomations, [activeBusinessId])

  async function handleToggle(id: string, active: boolean) {
    const res = await fetch('/api/portal/automations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automation_id: id, active }),
    })
    if (!res.ok) throw new Error('Toggle failed')
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active } : a))
  }

  async function syncFromN8n() {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const r = await fetch('/api/admin/sync-n8n', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const d = await r.json()
      if (!r.ok || d.error) {
        setSyncMessage(d.error || `Sync failed (${r.status})`)
      } else {
        setSyncMessage(`Synced ${d.synced} of ${d.total} workflows from n8n.`)
        loadAutomations()
      }
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const activeCount = automations.filter(a => a.active).length

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
            Automations {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>· {activeBusiness.business_name}</span>}
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            {activeBusinessId
              ? `${activeCount} of ${automations.length} automations active. Toggle any automation on or off.`
              : 'Add a business to see its automations.'}
          </p>
        </div>
        {isAdmin && activeBusinessId && (
          <button
            onClick={syncFromN8n}
            disabled={syncing}
            style={{ ...secondaryButton, fontFamily: 'inherit', fontSize: '12px', padding: '8px 14px', opacity: syncing ? 0.5 : 1 }}
            title="Admin only — pulls workflows from this client's n8n account into the dashboard"
          >
            {syncing ? 'Syncing…' : '⟳ Sync from n8n'}
          </button>
        )}
      </div>

      {isAdmin && syncMessage && (
        <div style={{ fontSize: '12px', color: syncMessage.includes('Synced') ? colors.success : colors.error, padding: '6px 4px 0' }}>
          {syncMessage}
        </div>
      )}

      {!activeBusinessId ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>
          No business selected.
        </div>
      ) : loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>
          Loading automations...
        </div>
      ) : automations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>
          No automations configured yet for {activeBusiness?.business_name}. Your account manager will set these up for you.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {automations.map(a => (
            <AutomationRow key={a.id} automation={a} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </>
  )
}
