'use client'

import { useState, useEffect } from 'react'
import { colors } from '@/lib/portal/styles'
import { AutomationRow } from '@/components/portal/AutomationRow'
import type { PortalAutomation } from '@/lib/portal/types'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<PortalAutomation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/automations')
      .then(r => r.json())
      .then(d => { setAutomations(d.automations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleToggle(id: string, active: boolean) {
    const res = await fetch('/api/portal/automations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automation_id: id, active }),
    })
    if (!res.ok) throw new Error('Toggle failed')
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active } : a))
  }

  const activeCount = automations.filter(a => a.active).length

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          Automations
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          {activeCount} of {automations.length} automations active. Toggle any automation on or off.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>
          Loading automations...
        </div>
      ) : automations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>
          No automations configured yet. Your account manager will set these up for you.
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
