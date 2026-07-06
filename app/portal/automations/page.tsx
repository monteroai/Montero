'use client'

import { useState, useEffect } from 'react'
import { card, colors, secondaryButton, gradientButton } from '@/lib/portal/styles'
import { AutomationRow } from '@/components/portal/AutomationRow'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/portal/templates'
import type { PortalAutomation } from '@/lib/portal/types'

import { AutomationCanvas, type SystemMap } from '@/components/portal/AutomationCanvas'

export default function AutomationsPage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [automations, setAutomations] = useState<PortalAutomation[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [deployOpen, setDeployOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0]?.key || '')
  const [deploying, setDeploying] = useState(false)
  const [deployMessage, setDeployMessage] = useState<string | null>(null)
  const [systemMap, setSystemMap] = useState<SystemMap | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [focusId, setFocusId] = useState<string | null>(null)

  // Deep-link support: /portal/automations?focus=<automation_id> (used by the
  // AI assistant to open a specific node on the map)
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('focus')
    if (f) setFocusId(f)
  }, [])

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
    setSystemMap(null)
    fetch(`/api/portal/automations/system-map?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => { if (d.nodes) setSystemMap(d) })
      .catch(() => {})
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
      const r = await fetch('/api/admin/sync-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_business_id: activeBusinessId }),
      })
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

  async function deployTemplate() {
    if (!selectedTemplate) return
    setDeploying(true)
    setDeployMessage(null)
    try {
      const r = await fetch('/api/admin/deploy-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_key: selectedTemplate, target_business_id: activeBusinessId }),
      })
      const d = await r.json()
      if (!r.ok || d.error) {
        setDeployMessage(d.error || `Deploy failed (${r.status})`)
      } else {
        setDeployMessage(`✓ Deployed "${d.workflow_name}" — open n8n.cloud to confirm, then click Sync to pull it into your dashboard.`)
      }
    } catch (e) {
      setDeployMessage(e instanceof Error ? e.message : 'Deploy failed')
    } finally {
      setDeploying(false)
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDeployOpen(o => !o)}
              style={{ ...secondaryButton, fontFamily: 'inherit', fontSize: '12px', padding: '8px 14px' }}
              title="Admin only — push a workflow template into the active client's n8n"
            >
              ＋ Deploy workflow
            </button>
            <button
              onClick={syncFromN8n}
              disabled={syncing}
              style={{ ...secondaryButton, fontFamily: 'inherit', fontSize: '12px', padding: '8px 14px', opacity: syncing ? 0.5 : 1 }}
              title="Admin only — pulls workflows from this client's n8n account into the dashboard"
            >
              {syncing ? 'Syncing…' : '⟳ Sync from n8n'}
            </button>
          </div>
        )}
      </div>

      {/* Deploy panel — collapses inline below the header */}
      {isAdmin && deployOpen && (
        <div style={{
          padding: '14px 16px', background: 'rgba(255,255,255,0.85)', borderRadius: '12px',
          border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px',
          margin: '6px 4px 0',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.navy }}>Deploy a workflow into the active client&apos;s n8n</div>
          <div style={{ display: 'grid', gap: '6px' }}>
            {TEMPLATES.map(t => (
              <label key={t.key} style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${selectedTemplate === t.key ? colors.blue : colors.border}`, background: selectedTemplate === t.key ? 'rgba(37,99,235,0.06)' : '#fff', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={selectedTemplate === t.key}
                  onChange={() => setSelectedTemplate(t.key)}
                  style={{ marginTop: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark }}>{t.name}</div>
                  <div style={{ fontSize: '11.5px', color: colors.textMuted, marginTop: '2px', lineHeight: 1.4 }}>{t.description}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => { setDeployOpen(false); setDeployMessage(null) }}
              style={{ ...secondaryButton, fontFamily: 'inherit', fontSize: '12px', padding: '8px 14px' }}
            >
              Cancel
            </button>
            <button
              onClick={deployTemplate}
              disabled={deploying || !selectedTemplate}
              style={{ ...gradientButton, fontFamily: 'inherit', fontSize: '12px', padding: '8px 16px', opacity: deploying ? 0.5 : 1 }}
            >
              {deploying ? 'Deploying…' : 'Deploy to active client'}
            </button>
          </div>
          {deployMessage && (
            <div style={{ fontSize: '12px', color: deployMessage.startsWith('✓') ? colors.success : colors.error, padding: '4px 2px 0' }}>
              {deployMessage}
            </div>
          )}
        </div>
      )}

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
        <>
          <div style={{ display: 'flex', gap: '8px', padding: '2px 4px' }}>
            <button onClick={() => setView('map')} style={{ ...(view === 'map' ? gradientButton : secondaryButton), fontSize: '12px', padding: '7px 16px' }}>
              ⊞ Map
            </button>
            <button onClick={() => setView('list')} style={{ ...(view === 'list' ? gradientButton : secondaryButton), fontSize: '12px', padding: '7px 16px' }}>
              ☰ List
            </button>
          </div>

          {view === 'map' ? (
            systemMap ? (
              <div style={{ ...card, padding: '10px' }}>
                <AutomationCanvas map={systemMap} automations={automations} onToggle={handleToggle} focusId={focusId} />
              </div>
            ) : (
              <div style={{ ...card, padding: '32px', textAlign: 'center', fontSize: '13px', color: colors.textMuted }}>
                Building the map…
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {automations.map(a => (
                <AutomationRow key={a.id} automation={a} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
