'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ── Glass card wrapper ── */
function Glass({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '18px', border: '1px solid rgba(255,255,255,0.55)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Sidebar project item ── */
function SidebarItem({ icon, label, count, color, href, indent }: {
  icon: React.ReactNode; label: string; count?: number; color?: string; href?: string; indent?: boolean
}) {
  const content = (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: indent ? '8px 14px 8px 28px' : '8px 14px',
        borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s',
        fontSize: '13px', fontWeight: indent ? 400 : 600, color: textDark,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ display: 'flex', color: color || '#94a3b8', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: '11px', fontWeight: 700, minWidth: '22px', height: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', background: 'rgba(0,0,0,0.05)', color: textMuted,
        }}>
          {count}
        </span>
      )}
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
  return content
}

/* ── Task card ── */
function TaskCard({ icon, children, highlight, href }: {
  icon: React.ReactNode; children: React.ReactNode; highlight?: boolean; href?: string
}) {
  const card = (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '14px 16px', borderRadius: '14px',
        background: highlight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
        border: highlight ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.4)',
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: highlight ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = highlight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)'
        e.currentTarget.style.boxShadow = highlight ? '0 2px 12px rgba(0,0,0,0.04)' : 'none'
      }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: blue, marginTop: '1px' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {href && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{card}</Link>
  return card
}

/* ── Activity item ── */
function ActivityItem({ icon, title, detail, color }: {
  icon: React.ReactNode; title: string; detail: string; color: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 14px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.4)',
      marginBottom: '8px',
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '8px',
        background: `${color}12`, color, flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: textDark, margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{detail}</p>
      </div>
    </div>
  )
}

/* ── Icons ── */
const icons = {
  house: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  megaphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  doc: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
}

/* ── Quick command chips ── */
const quickCommands = [
  { label: '/write remarks', href: '/agent-os/remarks' },
  { label: '/content pack', href: '/agent-os/content' },
  { label: '/stage photos', href: '/agent-os/photos' },
  { label: 'outreach email', href: '/agent-os/remarks' },
  { label: 'market update', href: '/agent-os/content' },
]

export default function CommandCenter() {
  const [greeting, setGreeting] = useState('')
  const [activityTab, setActivityTab] = useState<'progress' | 'done'>('progress')

  useEffect(() => { setGreeting(getGreeting()) }, [])

  return (
    <>
      {/* ════ LEFT SIDEBAR ════ */}
      <Glass style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ padding: '14px 10px', flex: 1 }}>

          {/* Active Deals */}
          <SidebarItem icon={<span style={{ color: '#ef4444' }}>{icons.alert}</span>} label="Active Deals" count={3} color="#ef4444" />

          <div style={{ padding: '4px 0 8px' }}>
            <SidebarItem icon={icons.house} label="Listings to Sell" count={2} color="#f59e0b" indent />
            <SidebarItem icon={icons.chart} label="Listings to Win" count={3} color="#2563eb" indent />
          </div>

          <SidebarItem icon={icons.plus} label="New Project" color="#94a3b8" />

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '10px 14px' }} />

          {/* Individual listings */}
          <div style={{ padding: '4px 0' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px 6px', margin: 0 }}>
              Active Deals
            </p>
            <SidebarItem icon={<span style={{ color: '#f59e0b' }}>{icons.house}</span>} label="42 Riverside Ave" href="/agent-os/photos" indent />
            <SidebarItem icon={<span style={{ color: '#2563eb' }}>{icons.house}</span>} label="18 Harbor Point Rd" href="/agent-os/photos" indent />
            <SidebarItem icon={<span style={{ color: '#2563eb' }}>{icons.house}</span>} label="7 Meadow Lane" href="/agent-os/photos" indent />
          </div>

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '10px 14px' }} />

          <SidebarItem icon={icons.users} label="Buyers to Represent" color="#7c3aed" />
          <SidebarItem icon={icons.plus} label="New Project" color="#94a3b8" />

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '10px 14px' }} />

          <SidebarItem icon={icons.settings} label="Settings" color="#94a3b8" href="/agent-os/settings" />
        </div>
      </Glass>

      {/* ════ CENTER COLUMN ════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, gap: '12px' }}>
        <Glass style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '28px 32px 20px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: navy, margin: '0 0 4px' }}>
              {greeting}.
            </h1>
            <p style={{ fontSize: '15px', color: textMuted, margin: 0 }}>
              Here&apos;s what you should do next...
            </p>
          </div>

          {/* Task cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

            <TaskCard icon={icons.chat} href="/agent-os/context">
              <p style={{ fontSize: '14px', fontWeight: 600, color: textDark, margin: 0 }}>
                Follow up with 3 buyer agents
              </p>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {['S.C.', 'M.J.', 'R.T.'].map(initials => (
                  <span key={initials} style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dbeafe, #c7d2fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700, color: '#4338ca',
                    border: '2px solid rgba(255,255,255,0.8)',
                  }}>
                    {initials}
                  </span>
                ))}
              </div>
            </TaskCard>

            <TaskCard icon={icons.megaphone} highlight href="/agent-os/content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: textDark, margin: 0 }}>
                  Create marketing for 18 Harbor Point Rd
                </p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px',
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)',
              }}>
                <div style={{
                  width: '64px', height: '48px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: '#2563eb' }}>{icons.house}</span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: navy, margin: '0 0 1px' }}>18 Harbor Point Rd</p>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>$875,000</p>
                </div>
              </div>
            </TaskCard>

            <TaskCard icon={icons.camera} href="/agent-os/photos">
              <p style={{ fontSize: '14px', fontWeight: 600, color: textDark, margin: 0 }}>
                Stage photos for 7 Meadow Lane
              </p>
            </TaskCard>

            <TaskCard icon={icons.doc} href="/agent-os/remarks">
              <p style={{ fontSize: '14px', fontWeight: 600, color: textDark, margin: 0 }}>
                Write listing remarks for 42 Riverside Ave
              </p>
            </TaskCard>

            <TaskCard icon={icons.target}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: textDark, margin: 0 }}>
                Find new listing opportunities in Greenwich
              </p>
            </TaskCard>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            <Link href="/agent-os/content" style={{
              padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
              background: 'linear-gradient(135deg, #f472b6, #c084fc, #818cf8)',
              color: '#ffffff', border: 'none', cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(196,132,252,0.3)',
            }}>
              Generate Outreach
            </Link>
            <Link href="/agent-os/remarks" style={{
              padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(255,255,255,0.6)', color: textDark,
              border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', textDecoration: 'none',
            }}>
              Write Remarks
            </Link>
            <Link href="/agent-os/photos" style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(255,255,255,0.6)', color: textDark,
              border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', textDecoration: 'none',
            }}>
              Stage Photos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>

        </Glass>

        {/* Command bar */}
        <Glass style={{ padding: '14px 18px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.5)',
            marginBottom: '10px',
          }}>
            <span style={{ flex: 1, fontSize: '14px', color: '#94a3b8' }}>Ask anything...</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
              }}>
                {icons.send}
              </button>
              <button style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>

          {/* Quick command chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {quickCommands.map(cmd => (
              <Link
                key={cmd.label}
                href={cmd.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                  background: 'rgba(255,255,255,0.5)', color: textMuted,
                  border: '1px solid rgba(255,255,255,0.4)', whiteSpace: 'nowrap',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>·</span> {cmd.label}
              </Link>
            ))}
          </div>
        </Glass>
      </div>

      {/* ════ RIGHT PANEL ════ */}
      <Glass style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: navy, margin: 0 }}>Generated for you</h2>
          <Link href="/agent-os/content" style={{ fontSize: '12px', fontWeight: 600, color: blue, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '0 18px', marginBottom: '14px' }}>
          {(['progress', 'done'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActivityTab(tab)}
              style={{
                padding: '7px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: activityTab === tab ? 'rgba(255,255,255,0.7)' : 'transparent',
                color: activityTab === tab ? textDark : '#94a3b8',
                boxShadow: activityTab === tab ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab === 'progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
        </div>

        {/* Activity items */}
        <div style={{ padding: '0 12px 18px', flex: 1 }}>
          {activityTab === 'progress' ? (
            <>
              <ActivityItem
                icon={icons.phone}
                title="Follow up with Mike Johnson"
                detail="Past buyer checking in"
                color="#f59e0b"
              />
              <ActivityItem
                icon={icons.megaphone}
                title="Social ads for 18 Harbor Point"
                detail="Instagram and Facebook ads are being prepared"
                color="#2563eb"
              />
              <ActivityItem
                icon={icons.target}
                title="Scanning Greenwich listings"
                detail="Looking for teardown and flip opportunities"
                color="#059669"
              />
            </>
          ) : (
            <>
              <ActivityItem
                icon={<span style={{ color: '#16a34a' }}>{icons.check}</span>}
                title="Remarks for 42 Riverside"
                detail="MLS-ready, 128 words, matches your voice"
                color="#16a34a"
              />
              <ActivityItem
                icon={<span style={{ color: '#16a34a' }}>{icons.check}</span>}
                title="Content pack for 42 Riverside"
                detail="Instagram, Facebook, email, SMS all generated"
                color="#16a34a"
              />
              <ActivityItem
                icon={<span style={{ color: '#16a34a' }}>{icons.check}</span>}
                title="Context from Sarah Chen"
                detail="Buyer intel submitted for 42 Riverside Ave"
                color="#16a34a"
              />
            </>
          )}

          <Link href="/agent-os/content" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: 600, color: textMuted,
            textDecoration: 'none', padding: '8px 14px', marginTop: '4px',
          }}>
            View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </Glass>
    </>
  )
}
