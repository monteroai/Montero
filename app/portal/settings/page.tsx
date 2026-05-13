'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { card, colors, gradientButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'

interface AccountInfo {
  owner_name: string
  primary_email: string
  primary_phone: string
}

export default function SettingsPage() {
  const { businesses } = useBusiness()
  const [info, setInfo] = useState<AccountInfo>({ owner_name: '', primary_email: '', primary_phone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    flagged_issues: true,
    daily_digest: false,
    weekly_report: true,
  })

  useEffect(() => {
    fetch('/api/portal/onboarding')
      .then(r => r.json())
      .then(d => {
        const account = d.account || {}
        const data = d.data || {}
        setInfo({
          owner_name: (account.owner_name as string) || '',
          primary_email: (account.primary_email as string) || '',
          primary_phone: (account.primary_phone as string) || '',
        })
        if (data.notification_prefs) setNotifications(data.notification_prefs)
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/portal/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...info, notification_prefs: notifications } }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `Save failed (${res.status})`)

      // Refetch to confirm what's actually in the DB
      const fresh = await fetch('/api/portal/onboarding').then(r => r.json()).catch(() => null)
      if (fresh?.account) {
        setInfo({
          owner_name: fresh.account.owner_name || '',
          primary_email: fresh.account.primary_email || '',
          primary_phone: fresh.account.primary_phone || '',
        })
      }
      if (fresh?.data?.notification_prefs) setNotifications(fresh.data.notification_prefs)

      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          Manage your account. To edit business-specific details (name, brand, logo), go to <Link href="/portal/businesses" style={{ color: colors.blue }}>Businesses</Link>.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '16px' }}>Account</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} value={info.owner_name} onChange={e => setInfo(p => ({ ...p, owner_name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={info.primary_email} onChange={e => setInfo(p => ({ ...p, primary_email: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={info.primary_phone} onChange={e => setInfo(p => ({ ...p, primary_phone: e.target.value }))} />
            </div>

            <button onClick={handleSave} disabled={saving} style={{ ...gradientButton, fontFamily: 'inherit', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
            {saveError && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: colors.error }}>
                {saveError}
              </p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Notifications</h2>
            {[
              { key: 'flagged_issues', label: 'Flagged Issues', desc: 'Get notified when the AI flags a bad call or error' },
              { key: 'daily_digest', label: 'Daily Digest', desc: 'Summary of all activity from the past 24 hours' },
              { key: 'weekly_report', label: 'Weekly Report', desc: 'Weekly performance report with metrics' },
            ].map(n => (
              <label key={n.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifications[n.key as keyof typeof notifications]}
                  onChange={e => setNotifications(prev => ({ ...prev, [n.key]: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: colors.textDark }}>{n.label}</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>{n.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Your businesses</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '12px' }}>
              You currently manage {businesses.length} business{businesses.length === 1 ? '' : 'es'}.
            </p>
            <Link href="/portal/businesses" style={{ display: 'inline-block', fontSize: '13px', color: colors.blue, textDecoration: 'none', fontWeight: 500 }}>
              Manage businesses →
            </Link>
          </div>

          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '12px' }}>Support</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6' }}>
              Need help? Reply to your most recent Montero email, or reach out anytime.
            </p>
            <a
              href="mailto:ai@montero.cool"
              style={{ display: 'inline-block', marginTop: '12px', fontSize: '14px', color: colors.blue, textDecoration: 'none', fontWeight: 500 }}
            >
              ai@montero.cool
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
