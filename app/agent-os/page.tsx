'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navy = '#1B2B5E'
const textDark = '#1e293b'
const textMuted = '#64748b'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, Charles.'
  if (h < 17) return 'Good afternoon, Charles.'
  return 'Good evening, Charles.'
}

/* ── Glass panel ── */
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
}

/* ── Inline SVG icons ── */
const I = {
  alert: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>,
  house: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  megaphone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  target: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  camera: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
}

/* ── Quick command chips ── */
const chips = [
  { label: '/write remarks', href: '/agent-os/remarks' },
  { label: '/generate CMA', href: '/agent-os/content' },
  { label: 'market update', href: '/agent-os/content' },
  { label: 'outreach email', href: '/agent-os/remarks' },
  { label: 'listing alert', href: '/agent-os/photos' },
]

export default function CommandCenter() {
  const [greeting, setGreeting] = useState('')
  const [actTab, setActTab] = useState<'progress' | 'done'>('progress')
  const [ask, setAsk] = useState('')

  useEffect(() => { setGreeting(getGreeting()) }, [])

  return (
    <>
      {/* ═══ LEFT SIDEBAR ═══ */}
      <div style={{ ...glass, width: '235px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 8px' }}>

        {/* Active Deals */}
        <SideNav icon={<span style={{ color: '#ef4444' }}>{I.alert}</span>} label="Active Deals" count={4} bold />
        <SideNav icon={I.house} label="Listings to Sell" count={2} indent color="#f59e0b" />
        <SideNav icon={I.chart} label="Listings to Win" count={2} indent color="#2563eb" />
        <SideNav icon={I.plus} label="New Project" indent color="#94a3b8" />

        <Hr />

        <Label>Active Deals</Label>
        <SideNav icon={<span style={{ color: '#f59e0b' }}>{I.house}</span>} label="42 Riverside Ave" indent href="/agent-os/photos" />
        <SideNav icon={<span style={{ color: '#f59e0b' }}>{I.house}</span>} label="18 Harbor Point Rd" indent href="/agent-os/photos" />

        <Hr />

        <Label>Listings to Win</Label>
        <SideNav icon={<span style={{ color: '#2563eb' }}>{I.house}</span>} label="7 Meadow Lane" indent href="/agent-os/photos" />
        <SideNav icon={<span style={{ color: '#2563eb' }}>{I.house}</span>} label="91 Putnam Ave" indent href="/agent-os/photos" />

        <Hr />

        <SideNav icon={I.users} label="Buyers to Represent" color="#7c3aed" />
        <SideNav icon={I.plus} label="New Project" indent color="#94a3b8" />

        <div style={{ flex: 1 }} />
        <Hr />
        <SideNav icon={I.settings} label="Settings" color="#94a3b8" href="/agent-os/settings" />
      </div>

      {/* ═══ CENTER COLUMN ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, gap: '12px' }}>

        {/* Greeting — no glass wrapper, floats on gradient */}
        <div style={{ padding: '8px 8px 0' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: navy, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {greeting}
          </h1>
          <p style={{ fontSize: '15px', color: textMuted, margin: 0 }}>
            Here&apos;s what you should do next ...
          </p>
        </div>

        {/* Task cards — float freely */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, padding: '0 4px' }}>

          <Task icon={I.chat} href="/agent-os/context">
            <span style={{ fontSize: '15px', fontWeight: 600, color: textDark }}>Follow up with 3 buyers</span>
            <div style={{ display: 'flex', gap: '-4px', marginLeft: 'auto' }}>
              {['RC', 'AT', 'MJ'].map(n => (
                <span key={n} style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dbeafe, #c7d2fe)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#4338ca',
                  border: '2.5px solid rgba(255,255,255,0.9)', marginLeft: '-6px',
                }}>{n}</span>
              ))}
            </div>
          </Task>

          <Task icon={I.megaphone} highlight href="/agent-os/content">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: textDark }}>
                  Create marketing for 18 Harbor Point Rd
                </span>
                <span style={{ color: '#cbd5e1' }}>{I.chevron}</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px',
                padding: '10px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.5)',
              }}>
                <div style={{
                  width: '72px', height: '52px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: '#5c6bc0' }}>{I.house}</span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: navy, margin: '0 0 2px' }}>18 Harbor Point Rd</p>
                  <p style={{ fontSize: '14px', color: textMuted, margin: 0 }}>$875,000</p>
                </div>
              </div>
            </div>
          </Task>

          <Task icon={I.target} href="/agent-os/remarks">
            <span style={{ fontSize: '15px', fontWeight: 600, color: textDark }}>
              Find listing opportunities in Cos Cob
            </span>
          </Task>

          <Task icon={I.doc} href="/agent-os/remarks">
            <span style={{ fontSize: '15px', fontWeight: 600, color: textDark }}>
              Draft offer strategy for 7 Meadow Lane
            </span>
          </Task>

          <Task icon={I.mail} href="/agent-os/context">
            <span style={{ fontSize: '15px', fontWeight: 600, color: textDark }}>
              Send intro letter to 91 Putnam Ave seller
            </span>
          </Task>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 4px', flexWrap: 'wrap' }}>
          <Link href="/agent-os/content" style={{
            padding: '11px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
            background: 'linear-gradient(135deg, #f472b6, #c084fc, #818cf8)',
            color: '#ffffff', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(196,132,252,0.3)',
          }}>
            Generate Outreach
          </Link>
          <Link href="/agent-os/remarks" style={{
            padding: '11px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
            background: 'rgba(255,255,255,0.55)', color: textDark,
            border: '1px solid rgba(255,255,255,0.5)', textDecoration: 'none',
            backdropFilter: 'blur(10px)',
          }}>
            Write Offer
          </Link>
          <Link href="/agent-os/photos" style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '11px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
            background: 'rgba(255,255,255,0.55)', color: textDark,
            border: '1px solid rgba(255,255,255,0.5)', textDecoration: 'none',
            backdropFilter: 'blur(10px)',
          }}>
            Stage Photos {I.chevron}
          </Link>
        </div>

        {/* ── Ask anything bar ── */}
        <div style={{ ...glass, padding: '12px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '4px 4px 4px 16px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.5)',
            marginBottom: '10px',
          }}>
            <input
              type="text"
              value={ask}
              onChange={e => setAsk(e.target.value)}
              placeholder="Ask anything..."
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', color: textDark, padding: '8px 0',
              }}
            />
            <button style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              flexShrink: 0,
            }}>
              {I.send}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {chips.map(c => (
              <Link key={c.label} href={c.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                background: 'rgba(255,255,255,0.5)', color: textMuted,
                border: '1px solid rgba(255,255,255,0.4)', whiteSpace: 'nowrap', textDecoration: 'none',
              }}>
                <span style={{ color: '#cbd5e1' }}>·</span> {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{ ...glass, width: '275px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: navy, margin: 0 }}>Generated for you</h2>
          <Link href="/agent-os/content" style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
            View All {I.chevron}
          </Link>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', margin: '0 14px 14px', padding: '3px',
          borderRadius: '12px', background: 'rgba(0,0,0,0.04)',
        }}>
          {(['progress', 'done'] as const).map(t => (
            <button key={t} onClick={() => setActTab(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: actTab === t ? 'rgba(255,255,255,0.85)' : 'transparent',
              color: actTab === t ? textDark : '#94a3b8',
              boxShadow: actTab === t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}>
              {t === 'progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
        </div>

        {/* Activity cards */}
        <div style={{ padding: '0 12px 18px', flex: 1 }}>
          {actTab === 'progress' ? (
            <>
              <ActCard icon={I.phone} title="Follow up with Robert Conca" detail="Co-broker coordination on 42 Riverside" color="#f59e0b" />
              <ActCard icon={I.megaphone} title="Social ads created for 18 Harbor Point" detail="Facebook and Instagram ad campaigns are ready to go." color="#2563eb" />
              <ActCard icon={I.target} title="2 intro-letter opportunities" detail="Cos Cob, CT — Worth sending outreach to 91 Putnam Ave and 14 River Rd." color="#059669" />
            </>
          ) : (
            <>
              <ActCard icon={I.check} title="Remarks for 42 Riverside Ave" detail="MLS-ready, 128 words, matches your voice" color="#16a34a" />
              <ActCard icon={I.check} title="Content pack for 42 Riverside" detail="Instagram, Facebook, email, SMS all generated" color="#16a34a" />
              <ActCard icon={I.check} title="Context from Angel Tejada" detail="Buyer intel submitted for 18 Harbor Point" color="#16a34a" />
            </>
          )}

          <Link href="/agent-os/content" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: 600, color: textMuted,
            textDecoration: 'none', padding: '8px 8px', marginTop: '4px',
          }}>
            View All {I.arrow}
          </Link>
        </div>
      </div>
    </>
  )
}

/* ═══════ SUB-COMPONENTS ═══════ */

function SideNav({ icon, label, count, bold, indent, color, href }: {
  icon: React.ReactNode; label: string; count?: number; bold?: boolean; indent?: boolean; color?: string; href?: string
}) {
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: indent ? '7px 12px 7px 24px' : '7px 12px',
      borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s',
      fontSize: '13px', fontWeight: bold ? 700 : indent ? 400 : 600, color: textDark,
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ display: 'flex', color: color || '#94a3b8', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: '11px', fontWeight: 700, minWidth: '22px', height: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', background: 'rgba(0,0,0,0.05)', color: textMuted,
        }}>{count}</span>
      )}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

function Hr() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '8px 12px' }} />
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '6px 12px 4px', margin: 0,
    }}>{children}</p>
  )
}

function Task({ icon, children, highlight, href }: {
  icon: React.ReactNode; children: React.ReactNode; highlight?: boolean; href?: string
}) {
  const card = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '16px 18px', borderRadius: '16px',
      background: highlight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
      border: '1px solid rgba(255,255,255,0.5)',
      cursor: 'pointer', transition: 'all 0.15s',
      boxShadow: highlight ? '0 4px 16px rgba(0,0,0,0.04)' : '0 1px 6px rgba(0,0,0,0.02)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.82)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = highlight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)'
        e.currentTarget.style.boxShadow = highlight ? '0 4px 16px rgba(0,0,0,0.04)' : '0 1px 6px rgba(0,0,0,0.02)'
      }}
    >
      {/* Checkbox circle */}
      <span style={{
        width: '20px', height: '20px', borderRadius: '6px',
        border: '2px solid #d1d5db', flexShrink: 0,
      }} />
      <span style={{ display: 'flex', color: '#94a3b8', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{card}</Link> : card
}

function ActCard({ icon, title, detail, color }: {
  icon: React.ReactNode; title: string; detail: string; color: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 14px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.4)',
      marginBottom: '8px',
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '8px',
        background: `${color}15`, color, flexShrink: 0,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: textDark, margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>{detail}</p>
      </div>
    </div>
  )
}
