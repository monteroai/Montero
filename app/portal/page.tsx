'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { card, colors, gradientButton } from '@/lib/portal/styles'
import { StatCard } from '@/components/portal/StatCard'
import { ActivityFeed } from '@/components/portal/ActivityFeed'
import { SystemStatusDot } from '@/components/portal/SystemStatusDot'
import { useBusiness } from '@/lib/portal/BusinessContext'
import type { PortalInteraction, PortalAutomation } from '@/lib/portal/types'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { activeBusinessId, activeBusiness, businesses, loading: bizLoading } = useBusiness()
  const [interactions, setInteractions] = useState<PortalInteraction[]>([])
  const [automations, setAutomations] = useState<PortalAutomation[]>([])
  const [stats, setStats] = useState({ active: 0, calls: 0, candidates: 0, flagged: 0 })
  const [greeting] = useState(getGreeting())

  useEffect(() => {
    if (!activeBusinessId) return
    fetch(`/api/portal/activity?business_id=${activeBusinessId}&limit=10`)
      .then(r => r.json())
      .then(d => setInteractions(d.interactions || []))
      .catch(() => {})

    fetch(`/api/portal/automations?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => {
        const auto = d.automations || []
        setAutomations(auto)
        setStats(prev => ({ ...prev, active: auto.filter((a: PortalAutomation) => a.active).length }))
      })
      .catch(() => {})

    fetch(`/api/portal/activity?business_id=${activeBusinessId}&filter=flagged&limit=100`)
      .then(r => r.json())
      .then(d => setStats(prev => ({ ...prev, flagged: d.total || 0 })))
      .catch(() => {})
  }, [activeBusinessId])

  const flaggedItems = interactions.filter(i => i.flagged)

  // No businesses yet — show onboarding-y empty state
  if (!bizLoading && businesses.length === 0) {
    return (
      <>
        <div style={{ padding: '8px 4px 0' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>{greeting}</h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            Welcome to Montero. Let&apos;s set up your first business.
          </p>
        </div>
        <div style={{ ...card, padding: '40px', textAlign: 'center', maxWidth: '520px', margin: '24px auto 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.navy}, ${colors.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '8px' }}>Add your first business</h2>
          <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.55, marginBottom: '20px' }}>
            Tell us about a business you run — we&apos;ll spin up its dashboard, configure its automations, and connect everything for you.
          </p>
          <Link href="/portal/businesses/new" style={{ ...gradientButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add a business
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          {greeting}{activeBusiness ? `, ${activeBusiness.business_name}` : ''}
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          {activeBusiness
            ? `Here's what's happening with ${activeBusiness.business_name} today.`
            : "Pick a business from the top-left to see what's happening."}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"/><path d="m6.8 15-3.5 2"/><path d="m20.7 7-3.5 2"/><path d="M6.8 9 3.3 7"/><path d="m20.7 17-3.5-2"/><circle cx="12" cy="12" r="3"/></svg>}
          label="Active Automations"
          value={stats.active}
          accent={colors.successBg}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
          label="Calls This Week"
          value={stats.calls}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="New Leads"
          value={stats.candidates}
          accent="#ede9fe"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Flagged Issues"
          value={stats.flagged}
          accent={stats.flagged > 0 ? colors.warningBg : '#f1f5f9'}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark }}>Recent Activity</h2>
            <Link href="/portal/activity" style={{ fontSize: '13px', color: colors.blue, textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          <ActivityFeed interactions={interactions.slice(0, 8)} compact />
        </div>

        <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {flaggedItems.length > 0 && (
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '8px', padding: '0 4px' }}>Needs Attention</h2>
              <ActivityFeed interactions={flaggedItems.slice(0, 5)} compact />
            </div>
          )}

          <div style={{ ...card, padding: '18px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>System Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {automations.slice(0, 8).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <SystemStatusDot status={a.active ? (a.last_status === 'error' ? 'error' : 'active') : 'stopped'} />
                  <span style={{ fontSize: '13px', color: colors.textDark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.friendly_name}
                  </span>
                  <span style={{ fontSize: '11px', color: colors.textLight }}>
                    {a.active ? 'Running' : 'Off'}
                  </span>
                </div>
              ))}
              {automations.length === 0 && (
                <p style={{ fontSize: '13px', color: colors.textMuted }}>
                  {activeBusinessId ? 'No automations configured yet.' : 'Pick a business to see its automations.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
