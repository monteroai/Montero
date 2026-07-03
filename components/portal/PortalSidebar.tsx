'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { glass, colors } from '@/lib/portal/styles'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    href: '/portal',
    label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    exact: true,
  },
  {
    href: '/portal/businesses',
    label: 'Businesses',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href: '/portal/automations',
    label: 'Automations',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.8 15-3.5 2"/><path d="m20.7 7-3.5 2"/><path d="M6.8 9 3.3 7"/><path d="m20.7 17-3.5-2"/><circle cx="12" cy="12" r="3"/></svg>,
  },
  {
    href: '/portal/activity',
    label: 'Activity',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    href: '/portal/website',
    label: 'Website',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    href: '/portal/marketing',
    label: 'Marketing',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  },
  {
    href: '/portal/documents',
    label: 'Documents',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    href: '/portal/integrations',
    label: 'Integrations',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
  {
    href: '/portal/settings',
    label: 'Settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
]

interface PortalSidebarProps {
  open: boolean
  onClose: () => void
}

export function PortalSidebar({ open, onClose }: PortalSidebarProps) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('portal_clients').select('is_admin').eq('user_id', data.user.id).maybeSingle()
        .then(({ data: c }) => setIsAdmin(Boolean(c?.is_admin)))
    })
  }, [])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="show-on-mobile"
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          ...glass,
          width: '220px', padding: '16px 12px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          overflowY: 'auto',
          willChange: 'transform', transform: 'translateZ(0)',
          // Mobile: fixed overlay sidebar
          ...(typeof window !== 'undefined' && window.innerWidth < 769
            ? {
                position: 'fixed', top: 0, left: 0, bottom: 0,
                zIndex: 50, borderRadius: '0 20px 20px 0',
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }
            : {}),
        }}
      >
        {/* Mobile close button */}
        <button
          className="show-on-mobile"
          onClick={onClose}
          style={{
            alignSelf: 'flex-end', background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px', marginBottom: '8px',
            color: colors.textMuted,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={{ padding: '4px 12px 16px', fontSize: '11px', fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Navigation
        </div>

        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px',
                fontSize: '14px', fontWeight: active ? 600 : 500,
                color: active ? colors.navy : colors.textMuted,
                background: active ? 'rgba(255,255,255,0.6)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ color: active ? colors.blue : colors.textLight, display: 'flex' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div style={{ padding: '16px 12px 6px', fontSize: '11px', fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin
            </div>
            <Link
              href="/portal/admin"
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px',
                fontSize: '14px',
                fontWeight: isActive('/portal/admin') ? 600 : 500,
                color: isActive('/portal/admin') ? colors.navy : colors.textMuted,
                background: isActive('/portal/admin') ? 'rgba(255,255,255,0.6)' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span style={{ color: isActive('/portal/admin') ? colors.blue : colors.textLight, display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/></svg>
              </span>
              Overview
            </Link>
          </>
        )}

        {/* Bottom branding */}
        <div style={{ marginTop: 'auto', padding: '16px 12px 4px', borderTop: '1px solid rgba(255,255,255,0.4)' }}>
          <span style={{ fontSize: '11px', color: colors.textLight, fontWeight: 500 }}>Powered by</span>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '13px', fontWeight: 600, color: colors.navy, letterSpacing: '0.04em', marginTop: '2px' }}>
            MONTERO
          </div>
        </div>
      </aside>
    </>
  )
}
