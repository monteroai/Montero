'use client'

import { useEffect, useState } from 'react'
import { card, colors } from '@/lib/portal/styles'

type Automation = {
  id: string
  friendly_name: string
  category: string
  active: boolean
  last_run: string | null
  last_status: 'idle' | 'success' | 'error'
}

type Business = {
  id: string
  business_name: string
  industry: string | null
  business_phone: string | null
  website_url: string | null
  brand_logo_url: string | null
  automation_count: number
  automations_active: number
  automations_error: number
  interactions_24h: number
  flagged_24h: number
  last_interaction_at: string | null
  automations: Automation[]
}

type Client = {
  id: string
  owner_name: string
  primary_email: string | null
  is_admin: boolean
  onboarding_complete: boolean
  created_at: string
  businesses: Business[]
}

type Interaction = {
  id: string
  business_id: string
  type: 'call' | 'form' | 'email' | 'chat'
  summary: string
  detail: string | null
  flagged: boolean
  flag_reason: string | null
  created_at: string
  business_name: string
  client_name: string
}

type Overview = {
  totals: {
    clients: number
    businesses: number
    automations_total: number
    automations_active: number
    automations_error: number
    interactions_24h: number
    flagged_24h: number
  }
  clients: Client[]
  recent: Interaction[]
  system_env: {
    twilio: boolean
    twilio_from: string | null
    resend: boolean
    vapi: boolean
    higgsfield: boolean
    n8n_central: string | null
    sdt_test_business_id: string | null
    consulting_business_id: string | null
    janeth_notify_phone: string | null
  }
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function statusColor(status: string): string {
  if (status === 'error') return colors.error
  if (status === 'success') return colors.success
  return colors.textLight
}

function StatTile({ label, value, accent, sublabel }: { label: string; value: number | string; accent?: string; sublabel?: string }) {
  return (
    <div style={{
      ...card,
      flex: '1 1 130px',
      padding: '14px 16px',
      background: accent || 'rgba(255,255,255,0.85)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: colors.navy, marginTop: '4px', fontFamily: 'var(--font-cinzel)' }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '2px' }}>{sublabel}</div>
      )}
    </div>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
      background: color, flexShrink: 0,
    }} />
  )
}

function BusinessCard({ b }: { b: Business }) {
  const [expanded, setExpanded] = useState(false)
  const totalShipped = b.automation_count
  return (
    <div style={{ ...card, padding: '14px 16px', marginBottom: '8px' }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        {b.brand_logo_url ? (
          <img src={b.brand_logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textLight, fontWeight: 700, fontSize: '12px' }}>
            {b.business_name?.[0] || '?'}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.business_name}
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
            {b.industry || 'no industry'} · {totalShipped} item{totalShipped === 1 ? '' : 's'} shipped · {b.interactions_24h} event{b.interactions_24h === 1 ? '' : 's'} 24h
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {b.automations_error > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: colors.error, padding: '3px 8px', borderRadius: '8px', background: colors.errorBg }}>
              {b.automations_error} error
            </span>
          )}
          {b.flagged_24h > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: colors.warning, padding: '3px 8px', borderRadius: '8px', background: colors.warningBg }}>
              {b.flagged_24h} flagged
            </span>
          )}
          <span style={{ fontSize: '11px', fontWeight: 600, color: colors.success, padding: '3px 8px', borderRadius: '8px', background: colors.successBg }}>
            {b.automations_active}/{b.automation_count} on
          </span>
          <span style={{ color: colors.textLight, fontSize: '13px' }}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.border}` }}>
          {b.automations.length === 0 ? (
            <div style={{ fontSize: '12px', color: colors.textMuted, fontStyle: 'italic' }}>No automations shipped yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {b.automations.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '13px' }}>
                  <Dot color={a.last_status === 'error' ? colors.error : a.active ? colors.success : colors.textLight} />
                  <span style={{ flex: 1, color: colors.textDark, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.friendly_name}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9' }}>
                    {a.category || 'general'}
                  </span>
                  <span style={{ fontSize: '11px', color: statusColor(a.last_status), minWidth: '60px', textAlign: 'right' }}>
                    {a.active ? a.last_status : 'off'}
                  </span>
                  <span style={{ fontSize: '11px', color: colors.textLight, minWidth: '70px', textAlign: 'right' }}>
                    {timeAgo(a.last_run)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: colors.textMuted }}>
            {b.business_phone && <span>📞 {b.business_phone}</span>}
            {b.website_url && <a href={b.website_url} target="_blank" rel="noreferrer" style={{ color: colors.blue, textDecoration: 'none' }}>↗ site</a>}
            <span>id: <code style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px' }}>{b.id.slice(0, 8)}…</code></span>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientGroup({ c }: { c: Client }) {
  const [open, setOpen] = useState(true)
  const totalShipped = c.businesses.reduce((sum, b) => sum + b.automation_count, 0)
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 4px', marginBottom: '6px' }}
      >
        <span style={{ color: colors.textLight, fontSize: '12px' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          {c.owner_name}
        </span>
        {c.is_admin && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.blue, padding: '2px 6px', borderRadius: '6px', background: 'rgba(37,99,235,0.1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            admin
          </span>
        )}
        <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: 'auto' }}>
          {c.businesses.length} biz · {totalShipped} shipped · joined {timeAgo(c.created_at)}
        </span>
      </div>
      {open && (
        <div style={{ paddingLeft: '6px' }}>
          {c.businesses.length === 0 ? (
            <div style={{ ...card, padding: '12px 16px', fontSize: '12px', color: colors.textMuted, fontStyle: 'italic' }}>
              No businesses added yet.
            </div>
          ) : (
            c.businesses.map(b => <BusinessCard key={b.id} b={b} />)
          )}
        </div>
      )}
    </div>
  )
}

const TYPE_ICON: Record<string, string> = { call: '📞', form: '📋', email: '📧', chat: '💬' }

function ActivityRow({ i }: { i: Interaction }) {
  const bg = i.flagged ? (i.flag_reason === 'new_lead' ? colors.warningBg : '#fef3f2') : 'rgba(255,255,255,0.7)'
  return (
    <div style={{ ...card, padding: '10px 12px', background: bg }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '14px', lineHeight: 1.2, paddingTop: '2px' }}>{TYPE_ICON[i.type] || '•'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark }}>{i.summary}</span>
            {i.flagged && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: colors.warning, padding: '1px 6px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {i.flag_reason || 'flagged'}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
            {i.client_name} → {i.business_name} · {timeAgo(i.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

function EnvPill({ label, set, value }: { label: string; set: boolean; value?: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: set ? colors.successBg : '#f1f5f9', flex: '1 1 140px' }}>
      <Dot color={set ? colors.success : colors.textLight} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDark }}>{label}</div>
        <div style={{ fontSize: '10px', color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {set ? (value || 'configured') : 'not set'}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const r = await fetch('/api/portal/admin/overview')
      if (r.status === 403) {
        setError('You are not an admin. This page is restricted.')
        setLoading(false)
        return
      }
      if (!r.ok) {
        const d = await r.json().catch(() => ({ error: `HTTP ${r.status}` }))
        setError(d.error || `HTTP ${r.status}`)
        setLoading(false)
        return
      }
      const d = await r.json()
      setData(d)
      setLoading(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus) }
  }, [])

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '14px' }}>Loading admin overview…</div>
  }
  if (error) {
    return (
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Admin</h1>
        <div style={{ ...card, padding: '24px', marginTop: '16px', color: colors.error, background: colors.errorBg }}>
          {error}
        </div>
      </div>
    )
  }
  if (!data) return null

  const env = data.system_env
  const t = data.totals

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
            Admin · System Overview
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            All clients, all businesses, everything shipped. Refreshes every 30s.
          </p>
        </div>
        <button
          onClick={load}
          style={{
            background: 'transparent', border: `1px solid ${colors.border}`, padding: '6px 12px',
            borderRadius: '10px', fontSize: '12px', fontWeight: 500, color: colors.textDark, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <StatTile label="Clients" value={t.clients} />
        <StatTile label="Businesses" value={t.businesses} />
        <StatTile label="Automations On" value={`${t.automations_active}/${t.automations_total}`} accent={t.automations_active > 0 ? colors.successBg : undefined} />
        <StatTile label="Errors" value={t.automations_error} accent={t.automations_error > 0 ? colors.errorBg : undefined} />
        <StatTile label="Events 24h" value={t.interactions_24h} />
        <StatTile label="Flagged 24h" value={t.flagged_24h} accent={t.flagged_24h > 0 ? colors.warningBg : undefined} />
      </div>

      {/* System env health row */}
      <div>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: colors.textDark, marginBottom: '8px', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          System Config
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <EnvPill label="Vapi" set={env.vapi} value="API key in env" />
          <EnvPill label="Twilio" set={env.twilio} value={env.twilio_from || undefined} />
          <EnvPill label="Resend" set={env.resend} value="email auto-reply" />
          <EnvPill label="Higgsfield" set={env.higgsfield} value="not wired yet" />
          <EnvPill label="n8n central" set={Boolean(env.n8n_central)} value={env.n8n_central || undefined} />
          <EnvPill label="SDT test biz" set={Boolean(env.sdt_test_business_id)} value={env.sdt_test_business_id?.slice(0, 8) + '…'} />
          <EnvPill label="Consulting biz" set={Boolean(env.consulting_business_id)} value={env.consulting_business_id?.slice(0, 8) + '…'} />
          <EnvPill label="Notify phone" set={Boolean(env.janeth_notify_phone)} value={env.janeth_notify_phone || undefined} />
        </div>
      </div>

      {/* Two-column main */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {/* LEFT: Build manifest by client */}
        <div style={{ flex: 2, minWidth: '340px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: colors.textDark, marginBottom: '12px', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Build Manifest · what we shipped, per client
          </h2>
          {data.clients.length === 0 ? (
            <div style={{ ...card, padding: '24px', textAlign: 'center', color: colors.textMuted }}>No clients yet.</div>
          ) : (
            data.clients.map(c => <ClientGroup key={c.id} c={c} />)
          )}
        </div>

        {/* RIGHT: Live activity */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: colors.textDark, marginBottom: '12px', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Activity · all clients
          </h2>
          {data.recent.length === 0 ? (
            <div style={{ ...card, padding: '24px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
              Nothing yet. Submit a form or call Maya to populate.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.recent.map(i => <ActivityRow key={i.id} i={i} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
