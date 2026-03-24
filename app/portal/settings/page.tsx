'use client'

import { useState, useEffect } from 'react'
import { card, colors, gradientButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { SystemStatusDot } from '@/components/portal/SystemStatusDot'

interface ClientInfo {
  business_name: string
  owner_name: string
  phone: string
  email: string
  industry: string
}

export default function SettingsPage() {
  const [info, setInfo] = useState<ClientInfo>({ business_name: '', owner_name: '', phone: '', email: '', industry: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    flagged_issues: true,
    daily_digest: false,
    weekly_report: true,
  })

  useEffect(() => {
    fetch('/api/portal/onboarding')
      .then(r => r.json())
      .then(d => {
        const data = d.data || {}
        setInfo({
          business_name: (data.business_name as string) || '',
          owner_name: (data.owner_name as string) || '',
          phone: (data.phone as string) || '',
          email: (data.email as string) || '',
          industry: (data.industry as string) || '',
        })
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/portal/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { ...info, notification_prefs: notifications } }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          Settings
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          Manage your account and preferences.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Account info */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, marginBottom: '20px' }}>Account Information</h2>

            {[
              { key: 'business_name', label: 'Business Name' },
              { key: 'owner_name', label: 'Your Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  style={inputStyle}
                  value={info[f.key as keyof ClientInfo]}
                  onChange={e => setInfo(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Industry</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={info.industry}
                onChange={e => setInfo(prev => ({ ...prev, industry: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="dental-staffing">Dental Staffing</option>
                <option value="dental-practice">Dental Practice</option>
                <option value="real-estate">Real Estate</option>
                <option value="restaurant">Restaurant</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button onClick={handleSave} disabled={saving} style={{ ...gradientButton, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Notifications */}
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, marginBottom: '16px' }}>Notifications</h2>
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

          {/* API Connections */}
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, marginBottom: '16px' }}>Connections</h2>
            {[
              { name: 'n8n Automations', status: 'active' },
              { name: 'VAPI Voice Agent', status: 'active' },
              { name: 'Airtable CRM', status: 'active' },
              { name: 'Website (Netlify)', status: 'active' },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <SystemStatusDot status={c.status} />
                <span style={{ fontSize: '13px', color: colors.textDark, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: '12px', color: colors.success, fontWeight: 500 }}>Connected</span>
              </div>
            ))}
          </div>

          {/* Support */}
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, marginBottom: '12px' }}>Support</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6' }}>
              Need help? Contact your account manager directly.
            </p>
            <div style={{ marginTop: '12px', fontSize: '14px', color: colors.textDark }}>
              <strong>Emilio Montero</strong>
            </div>
            <div style={{ fontSize: '13px', color: colors.blue, marginTop: '4px' }}>
              emilio@montero.cool
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
