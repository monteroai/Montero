'use client'

import { useState, useEffect } from 'react'
import { card, colors, secondaryButton, gradientButton } from '@/lib/portal/styles'
import { AutomationRow } from '@/components/portal/AutomationRow'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/portal/templates'
import type { PortalAutomation } from '@/lib/portal/types'

type MapNode = { id: string; name: string; category: string; channel: string; outputs: string[]; active: boolean; linked: boolean }
type SystemMap = { nodes: MapNode[]; edges: Array<{ from: string; to: string }> }

const CHANNEL_META: Record<string, { icon: string; color: string; blurb: string }> = {
  Phone: { icon: '☎', color: '#0891b2', blurb: 'calls in & out' },
  Website: { icon: '🌐', color: '#2563eb', blurb: 'forms & site visitors' },
  Chat: { icon: '💬', color: '#d97706', blurb: 'chat widget' },
  Email: { icon: '✉', color: '#64748b', blurb: 'inbound email' },
  Schedule: { icon: '◷', color: '#7c3aed', blurb: 'runs on a timer' },
  Internal: { icon: '⚙', color: '#475569', blurb: 'supports other automations' },
}
const OUTPUT_ICON: Record<string, string> = { sms: '☎ SMS', email: '✉ email', calls: '☎ calls', ai: '✦ AI', data: '▤ records' }

// Aerial view: workflows grouped by their entry channel, with cross-workflow
// call edges rendered as "→ works with" tags on each card.
function SystemMapView({ map }: { map: SystemMap }) {
  const nameById = new Map(map.nodes.map(n => [n.id, n.name]))
  const channels = Array.from(new Set(map.nodes.map(n => n.channel)))
  const callsFrom = (id: string) => map.edges.filter(e => e.from === id).map(e => nameById.get(e.to)).filter(Boolean) as string[]
  const calledBy = (id: string) => map.edges.filter(e => e.to === id).map(e => nameById.get(e.from)).filter(Boolean) as string[]

  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px', alignItems: 'stretch' }}>
      {channels.map(ch => {
        const meta = CHANNEL_META[ch] || CHANNEL_META.Internal
        const nodes = map.nodes.filter(n => n.channel === ch)
        return (
          <div key={ch} style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '2px 4px' }}>
              <span style={{ color: meta.color }}>{meta.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: colors.textDark }}>{ch}</span>
              <span style={{ fontSize: '10.5px', color: colors.textLight }}>{meta.blurb}</span>
            </div>
            {nodes.map(n => {
              const outgoing = callsFrom(n.id)
              const incoming = calledBy(n.id)
              return (
                <div key={n.id} style={{
                  background: '#fff', border: `1px solid ${colors.border}`, borderTop: `3px solid ${meta.color}`,
                  borderRadius: '12px', padding: '10px 12px', opacity: n.active ? 1 : 0.55,
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: colors.textDark, lineHeight: 1.35 }}>
                    {n.name} {!n.active && <span style={{ fontSize: '10px', color: colors.textLight }}>(off)</span>}
                  </div>
                  {n.outputs.length > 0 && (
                    <div style={{ fontSize: '10.5px', color: colors.textMuted, marginTop: '5px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {n.outputs.map(o => <span key={o}>{OUTPUT_ICON[o] || o}</span>)}
                    </div>
                  )}
                  {(outgoing.length > 0 || incoming.length > 0) && (
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: `1px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {outgoing.map(t => <span key={`o${t}`} style={{ fontSize: '10.5px', color: '#7c3aed' }}>→ hands off to {t}</span>)}
                      {incoming.map(t => <span key={`i${t}`} style={{ fontSize: '10.5px', color: colors.textLight }}>← receives from {t}</span>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

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
  const [mapOpen, setMapOpen] = useState(true)

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
          {systemMap && systemMap.nodes.length > 1 && (
            <div style={{ ...card, padding: '16px 18px' }}>
              <button
                onClick={() => setMapOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'baseline', gap: '10px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: colors.navy }}>
                  {mapOpen ? '▾' : '▸'} System map
                </span>
                <span style={{ fontSize: '11.5px', color: colors.textMuted }}>
                  how your automations work together — grouped by where each one starts
                </span>
              </button>
              {mapOpen && (
                <div style={{ marginTop: '14px' }}>
                  <SystemMapView map={systemMap} />
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {automations.map(a => (
              <AutomationRow key={a.id} automation={a} onToggle={handleToggle} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
