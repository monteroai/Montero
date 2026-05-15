'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { INTEGRATIONS, type IntegrationDef, type IntegrationStatus } from '@/lib/portal/integrations'

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    try {
      const r = await fetch('/api/portal/integrations')
      const d = await r.json()
      const map: Record<string, IntegrationStatus> = {}
      for (const s of (d.integrations as IntegrationStatus[]) || []) {
        map[s.service] = s
      }
      setStatuses(map)
    } finally {
      setLoading(false)
    }
  }

  const connectedCount = Object.values(statuses).filter(s => s.verification_status === 'verified').length
  const totalCount = INTEGRATIONS.length

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px', maxWidth: '640px' }}>
          Paste the API keys for tools you already use. We store them encrypted with{' '}
          <span style={{ fontWeight: 600, color: colors.textDark }}>Supabase Vault</span> — no one (including us) can read them through this dashboard. We use them server-side to build the automations you need.
        </p>
        <div style={{ fontSize: '12px', color: colors.textLight, marginTop: '12px' }}>
          {loading ? '—' : `${connectedCount} of ${totalCount} connected`}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
        {INTEGRATIONS.map(def => (
          <IntegrationCard
            key={def.key}
            def={def}
            status={statuses[def.service]}
            onChanged={refresh}
          />
        ))}
      </div>

      <div style={{ ...card, padding: '20px', marginTop: '20px', background: 'rgba(255,255,255,0.5)', borderStyle: 'dashed' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark, marginBottom: '6px' }}>
          What happens after I connect these?
        </div>
        <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
          Once a credential is verified, you don&apos;t need to do anything else. Emilio will use it to build the automations you discussed — phone agents, SMS broadcasts, lead intake, etc. You&apos;ll see each one appear under <Link href="/portal/automations" style={{ color: colors.blue, textDecoration: 'none', fontWeight: 600 }}>Automations</Link> when it&apos;s ready, and you can toggle them on/off from there. If anything goes wrong with a key, this page will show it as Failed — just rotate it from your provider and re-paste here.
        </p>
      </div>
    </>
  )
}

function IntegrationCard({
  def,
  status,
  onChanged,
}: {
  def: IntegrationDef
  status: IntegrationStatus | undefined
  onChanged: () => void
}) {
  const verified = status?.verification_status === 'verified'
  const failed = status?.verification_status === 'failed'

  const [value, setValue] = useState('')
  const [showValue, setShowValue] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(!verified)
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const [justVerified, setJustVerified] = useState<{ synced?: number; total?: number; sync_error?: string } | null>(null)

  async function save() {
    if (!value || value.trim().length < 4) {
      setError('Looks too short — make sure you pasted the full value.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const r = await fetch('/api/portal/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: def.service, value: value.trim(), label: def.name }),
      })
      const d = await r.json()
      if (!d.ok) {
        setError(d.error || 'Could not verify')
      } else {
        setValue('')
        setShowInstructions(false)
        setJustVerified({ synced: d.synced, total: d.total, sync_error: d.sync_error })
        onChanged()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setSaving(false)
    }
  }

  async function disconnect() {
    if (!confirmingDisconnect) {
      setConfirmingDisconnect(true)
      setTimeout(() => setConfirmingDisconnect(false), 4000)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await fetch(`/api/portal/integrations?service=${def.service}`, { method: 'DELETE' })
      onChanged()
      setShowInstructions(true)
    } finally {
      setSaving(false)
      setConfirmingDisconnect(false)
    }
  }

  // Status pill
  let statusLabel = 'Not connected'
  let statusBg: string = colors.inputBg
  let statusFg: string = colors.textMuted
  if (verified) { statusLabel = 'Verified'; statusBg = colors.successBg; statusFg = colors.success }
  else if (failed) { statusLabel = 'Failed'; statusBg = colors.errorBg; statusFg = colors.error }
  else if (status?.verification_status === 'pending' && status.updated_at) { statusLabel = 'Saved'; statusBg = colors.warningBg; statusFg = colors.warning }

  return (
    <div style={{ ...card, padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.navy}, ${colors.blue})`,
          color: '#fff', fontWeight: 700, fontSize: '15px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {def.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.textDark, margin: 0 }}>{def.name}</h3>
            {def.recommended && (
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: colors.infoBg, color: colors.blue, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Required
              </span>
            )}
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: statusBg, color: statusFg, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {statusLabel}
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: colors.textMuted, margin: '4px 0 0', lineHeight: 1.5 }}>{def.blurb}</p>
        </div>
      </div>

      {/* What we'll do with this — always visible */}
      <details style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
        <summary style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, cursor: 'pointer', listStyle: 'none' }}>
          ▸ What we&apos;ll do with this
        </summary>
        <p style={{ fontSize: '12.5px', color: colors.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>{def.purpose}</p>
      </details>

      {/* What's next — only after a fresh verify in this session */}
      {verified && justVerified && (
        <div style={{
          background: colors.infoBg, padding: '14px 16px', borderRadius: '10px',
          border: `1px solid rgba(37,99,235,0.2)`, fontSize: '12.5px', color: colors.textDark, lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 600, color: colors.navy, marginBottom: '6px', fontSize: '13px' }}>
            ✓ Connected. Here&apos;s what happens now:
          </div>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Your key is encrypted in our vault — you can rotate it any time from this page.</li>
            {def.service === 'n8n' && justVerified.synced !== undefined && (
              justVerified.synced > 0
                ? <li>We pulled in <strong>{justVerified.synced} workflow{justVerified.synced === 1 ? '' : 's'}</strong> from your n8n account. Find them under <Link href="/portal/automations" style={{ color: colors.blue, fontWeight: 600, textDecoration: 'none' }}>Automations</Link>.</li>
                : <li>Your n8n account doesn&apos;t have any workflows yet — that&apos;s fine. Emilio will build them for you.</li>
            )}
            {def.service === 'n8n' && justVerified.sync_error && (
              <li style={{ color: colors.warning }}>We couldn&apos;t auto-pull workflows: {justVerified.sync_error}. Don&apos;t worry — Emilio will sync them manually.</li>
            )}
            <li>Emilio will build the automations you discussed in the next 24-48 hours. You&apos;ll see each one appear under Automations as it goes live.</li>
            <li>When an automation is ready, you&apos;ll get an email. Open the dashboard, flip the toggle, you&apos;re running.</li>
          </ol>
        </div>
      )}

      {/* Verified state — show masked + rotate/disconnect */}
      {verified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: colors.successBg, padding: '10px 14px', borderRadius: '10px' }}>
          <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', color: colors.textDark }}>•••••••••• (saved)</span>
          {status?.last_verified_at && (
            <span style={{ fontSize: '11px', color: colors.textMuted }}>
              verified {new Date(status.last_verified_at).toLocaleDateString()}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => { setShowInstructions(true); setValue(''); setError(null) }}
            style={{ ...secondaryButton, fontSize: '12px', padding: '6px 12px', fontFamily: 'inherit' }}
          >
            Rotate
          </button>
          <button
            onClick={disconnect}
            disabled={saving}
            style={{
              fontSize: '12px', padding: '6px 12px', borderRadius: '10px',
              fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${confirmingDisconnect ? colors.error : colors.border}`,
              background: confirmingDisconnect ? colors.errorBg : 'transparent',
              color: confirmingDisconnect ? colors.error : colors.textMuted,
            }}
          >
            {confirmingDisconnect ? 'Confirm?' : 'Disconnect'}
          </button>
        </div>
      )}

      {/* Form (visible when not yet verified, or when rotating) */}
      {(!verified || showInstructions) && (
        <>
          {showInstructions && (
            <div style={{ background: colors.inputBg, padding: '14px 16px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textDark, marginBottom: '8px' }}>
                How to find your {def.name} key
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.7 }}>
                {def.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              {def.docsUrl && (
                <a href={def.docsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.blue, textDecoration: 'none', fontWeight: 600, marginTop: '10px' }}>
                  Provider docs ↗
                </a>
              )}
            </div>
          )}

          <div>
            <label style={labelStyle}>{def.fields[0].label}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showValue ? 'text' : 'password'}
                value={value}
                onChange={e => { setValue(e.target.value); if (error) setError(null) }}
                placeholder={def.fields[0].placeholder}
                disabled={saving}
                style={{
                  ...inputStyle,
                  paddingRight: '40px',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  borderColor: error ? colors.error : colors.border,
                }}
              />
              <button
                type="button"
                onClick={() => setShowValue(v => !v)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: colors.textLight,
                }}
                tabIndex={-1}
                aria-label={showValue ? 'Hide value' : 'Show value'}
              >
                {showValue ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {error && (
              <p style={{ fontSize: '12px', color: colors.error, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {showInstructions && (
              <button
                onClick={() => setShowInstructions(false)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '12px', cursor: 'pointer', padding: '8px 4px', fontFamily: 'inherit' }}
              >
                Hide instructions
              </button>
            )}
            <button
              onClick={save}
              disabled={saving || !value}
              style={{
                ...gradientButton,
                fontFamily: 'inherit',
                fontSize: '13px',
                padding: '9px 18px',
                opacity: saving || !value ? 0.5 : 1,
                cursor: saving || !value ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Verifying…' : 'Test & Save'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
