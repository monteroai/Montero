'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { colors } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'

interface PortalHeaderProps {
  clientName: string
  businessName: string  // legacy prop, kept for layout API compatibility (unused now)
  onToggleSidebar: () => void
}

export function PortalHeader({ clientName, onToggleSidebar }: PortalHeaderProps) {
  const initial = (clientName ? clientName[0] : 'C').toUpperCase()
  const { businesses, activeBusiness, setActiveBusinessId, isAdminView } = useBusiness()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  // Close switcher on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  const accent = activeBusiness?.brand_colors?.primary || colors.navy
  const accent2 = activeBusiness?.brand_colors?.secondary || colors.blue

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 20px', margin: '12px 16px 0',
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      // backdropFilter creates a stacking context; without an explicit
      // z-index the glass content cards (later in DOM) paint OVER the
      // business-switcher dropdown. Keep above content, below the mobile
      // sidebar overlay (40/50).
      position: 'relative', zIndex: 30,
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

      {/* MONTERO mark (always shown — this is the platform brand) */}
      <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <img src="/logo.png" alt="MONTERO" width={30} height={30} style={{ objectFit: 'contain' }} />
        <span className="hide-on-mobile" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '15px', fontWeight: 600, color: colors.navy, letterSpacing: '0.06em' }}>
          MONTERO
        </span>
      </Link>

      {/* Divider */}
      <div className="hide-on-mobile" style={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.08)' }} />

      {/* Business switcher */}
      <div ref={switcherRef} style={{ position: 'relative' }}>
        {activeBusiness ? (
          <button
            onClick={() => setSwitcherOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {activeBusiness.brand_logo_url ? (
              <img src={activeBusiness.brand_logo_url} alt="" width={20} height={20} style={{ objectFit: 'contain', borderRadius: '4px' }} />
            ) : (
              <div style={{
                width: '20px', height: '20px', borderRadius: '5px',
                background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '10px', fontWeight: 700,
              }}>
                {activeBusiness.business_name[0].toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.navy }}>
              {activeBusiness.business_name}
              {isAdminView && activeBusiness._client_owner_name && (
                <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 500, color: colors.textMuted }}>
                  · {activeBusiness._client_owner_name}
                </span>
              )}
            </span>
            {businesses.length > 1 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            )}
          </button>
        ) : (
          <Link href="/portal/businesses/new" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.blue})`,
            color: '#fff', fontSize: '12.5px', fontWeight: 600,
            textDecoration: 'none',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add your first business
          </Link>
        )}

        {switcherOpen && businesses.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60,
            minWidth: '260px', maxHeight: '420px', overflowY: 'auto',
            background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)', padding: '6px',
          }}>
            {businesses.map(b => {
              const isActive = b.id === activeBusiness?.id
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBusinessId(b.id)
                    setSwitcherOpen(false)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                    border: 'none', textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {b.brand_logo_url ? (
                    <img src={b.brand_logo_url} alt="" width={22} height={22} style={{ objectFit: 'contain', borderRadius: '4px' }} />
                  ) : (
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: `linear-gradient(135deg, ${b.brand_colors?.primary || colors.navy}, ${b.brand_colors?.secondary || colors.blue})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '10px', fontWeight: 700,
                    }}>
                      {b.business_name[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: colors.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.business_name}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textLight }}>
                      {isAdminView && b._client_owner_name ? (
                        <>
                          <span style={{ fontWeight: 600 }}>{b._client_owner_name}</span>
                          {b.industry && <span> · {b.industry}</span>}
                        </>
                      ) : (
                        b.industry || null
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />
            <Link
              href="/portal/businesses/new"
              onClick={() => setSwitcherOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500, color: colors.blue,
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add a business
            </Link>
            <Link
              href="/portal/businesses"
              onClick={() => setSwitcherOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500, color: colors.textMuted,
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Manage businesses
            </Link>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Notifications */}
      <Link href="/portal/activity?filter=flagged" style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </Link>

      {/* Account name + avatar */}
      <span className="hide-on-mobile" style={{ fontSize: '13px', fontWeight: 600, color: colors.navy }}>{clientName}</span>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.navy}, ${colors.blue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', fontSize: '13px', fontWeight: 700,
        border: '2px solid rgba(255,255,255,0.6)',
      }}>
        {initial}
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
          color: colors.textMuted, fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
        }}
      >
        Sign Out
      </button>
    </header>
  )
}
