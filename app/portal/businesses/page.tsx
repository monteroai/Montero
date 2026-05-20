'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { card, colors, gradientButton, secondaryButton } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'
import type { PortalBusiness } from '@/lib/portal/types'

export default function BusinessesPage() {
  const { businesses, loading, refreshBusinesses, setActiveBusinessId, activeBusinessId } = useBusiness()
  const [archiving, setArchiving] = useState<string | null>(null)
  const [confirmingArchive, setConfirmingArchive] = useState<string | null>(null)

  async function archive(b: PortalBusiness) {
    if (confirmingArchive !== b.id) {
      setConfirmingArchive(b.id)
      setTimeout(() => setConfirmingArchive(prev => prev === b.id ? null : prev), 4000)
      return
    }
    setArchiving(b.id)
    await fetch(`/api/portal/businesses?id=${b.id}`, { method: 'DELETE' })
    await refreshBusinesses()
    setArchiving(null)
    setConfirmingArchive(null)
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Businesses</h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            Each business gets its own branded dashboard, automations, and AI assistant context.
          </p>
        </div>
        <Link href="/portal/businesses/new" style={{ ...gradientButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add a business
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Loading…</div>
      ) : businesses.length === 0 ? (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '16px' }}>
            You don&apos;t have any businesses set up yet.
          </p>
          <Link href="/portal/businesses/new" style={{ ...gradientButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
            Add your first business
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {businesses.map(b => {
            const primary = b.brand_colors?.primary || colors.navy
            const secondary = b.brand_colors?.secondary || colors.blue
            const isConfirming = confirmingArchive === b.id
            return (
              <div key={b.id} style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {b.brand_logo_url ? (
                    <img src={b.brand_logo_url} alt="" width={44} height={44} style={{ objectFit: 'contain', borderRadius: '8px', background: '#f8fafc' }} />
                  ) : (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '16px', fontWeight: 700,
                    }}>
                      {b.business_name[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.business_name}
                    </div>
                    {b.industry && <div style={{ fontSize: '12px', color: colors.textMuted }}>{b.industry}</div>}
                  </div>
                </div>

                {b.description && (
                  <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>{b.description}</p>
                )}

                {(b.brand_colors?.primary || b.brand_colors?.secondary || b.brand_colors?.accent) && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {b.brand_colors?.primary && <div title="Primary" style={{ width: 22, height: 22, borderRadius: 6, background: b.brand_colors.primary, border: '1px solid rgba(0,0,0,0.06)' }} />}
                    {b.brand_colors?.secondary && <div title="Secondary" style={{ width: 22, height: 22, borderRadius: 6, background: b.brand_colors.secondary, border: '1px solid rgba(0,0,0,0.06)' }} />}
                    {b.brand_colors?.accent && <div title="Accent" style={{ width: 22, height: 22, borderRadius: 6, background: b.brand_colors.accent, border: '1px solid rgba(0,0,0,0.06)' }} />}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
                  {b.id === activeBusinessId ? (
                    <button
                      disabled
                      style={{
                        ...secondaryButton,
                        fontSize: '12px', padding: '7px 12px', flex: 1,
                        cursor: 'default',
                        background: colors.successBg,
                        color: colors.success,
                        border: `1px solid ${colors.success}33`,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Current
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveBusinessId(b.id)}
                      style={{ ...secondaryButton, fontSize: '12px', padding: '7px 12px', flex: 1 }}
                    >
                      Switch to
                    </button>
                  )}
                  <Link href={`/portal/businesses/${b.id}`} style={{ ...secondaryButton, fontSize: '12px', padding: '7px 12px', textDecoration: 'none', textAlign: 'center', flex: 1 }}>
                    Edit
                  </Link>
                  <button
                    onClick={() => archive(b)}
                    disabled={archiving === b.id}
                    style={{
                      padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                      border: `1px solid ${isConfirming ? colors.error : '#e2e8f0'}`,
                      background: isConfirming ? colors.errorBg : 'transparent',
                      color: isConfirming ? colors.error : colors.textMuted,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {archiving === b.id ? '…' : isConfirming ? 'Confirm?' : 'Archive'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
