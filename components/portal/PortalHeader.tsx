'use client'

import { colors } from '@/lib/portal/styles'

interface PortalHeaderProps {
  clientName: string
  businessName: string
  onToggleSidebar: () => void
}

export function PortalHeader({ clientName, businessName, onToggleSidebar }: PortalHeaderProps) {
  const initial = (clientName ? clientName[0] : 'C').toUpperCase()

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '12px 24px', margin: '12px 16px 0',
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
    }}>
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="show-on-mobile"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textDark} strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="MONTERO" width={32} height={32} style={{ objectFit: 'contain' }} />
        <div className="hide-on-mobile">
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '16px', fontWeight: 600, color: colors.navy, letterSpacing: '0.06em' }}>MONTERO</span>
          <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: '8px', fontWeight: 500 }}>Client Portal</span>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Business name */}
      <span className="hide-on-mobile" style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500 }}>
        {businessName}
      </span>

      {/* Notifications */}
      <a href="/portal/activity?filter=flagged" style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </a>

      {/* Client name + avatar */}
      <span style={{ fontSize: '14px', fontWeight: 600, color: colors.navy }}>{clientName}</span>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.blue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', fontSize: '13px', fontWeight: 700,
        border: '2px solid rgba(255,255,255,0.6)',
      }}>
        {initial}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
          color: colors.textMuted, fontSize: '12px', fontWeight: 500,
        }}
      >
        Sign Out
      </button>
    </header>
  )
}
