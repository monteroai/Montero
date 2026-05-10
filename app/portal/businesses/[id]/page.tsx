'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { createClient } from '@/lib/supabase/client'
import type { BrandColors, PortalBusiness } from '@/lib/portal/types'

const INDUSTRIES = [
  'dental-staffing', 'dental-practice', 'consulting', 'real-estate',
  'restaurant', 'professional-services', 'medical', 'retail', 'other',
]

export default function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { businesses, refreshBusinesses } = useBusiness()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [b, setB] = useState<PortalBusiness | null>(null)
  const [palette, setPalette] = useState<BrandColors>({})
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const found = businesses.find(x => x.id === id)
    if (found) {
      setB(found)
      setPalette(found.brand_colors || {})
    }
  }, [id, businesses])

  if (!b) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
        <p>Loading…</p>
        <Link href="/portal/businesses" style={{ color: colors.blue, fontSize: '13px' }}>← Back to businesses</Link>
      </div>
    )
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !b) return
    setError('')
    const supabase = createClient()
    const path = `${b.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error: upErr } = await supabase.storage.from('portal-logos').upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); return }
    const { data: pub } = supabase.storage.from('portal-logos').getPublicUrl(path)
    setB({ ...b, brand_logo_url: pub.publicUrl })

    setExtracting(true)
    try {
      const res = await fetch('/api/portal/businesses/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: pub.publicUrl, business_id: b.id }),
      })
      const data = await res.json()
      if (res.ok && data.palette) {
        setPalette({
          primary: data.palette.primary,
          secondary: data.palette.secondary,
          accent: data.palette.accent,
          background: data.palette.background,
          text: data.palette.text,
        })
      }
    } finally {
      setExtracting(false)
    }
  }

  async function save() {
    if (!b) return
    setSaving(true)
    setError('')
    const res = await fetch(`/api/portal/businesses?id=${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: b.business_name,
        industry: b.industry,
        business_phone: b.business_phone,
        business_email: b.business_email,
        website_url: b.website_url,
        description: b.description,
        brand_logo_url: b.brand_logo_url,
        brand_colors: palette,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Save failed')
      return
    }
    await refreshBusinesses()
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/portal/businesses" style={{ fontSize: '12px', color: colors.blue, textDecoration: 'none' }}>← All businesses</Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)', marginTop: '4px' }}>Edit business</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Basics</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Business name</label>
              <input style={inputStyle} value={b.business_name} onChange={e => setB({ ...b, business_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Industry</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={b.industry || ''} onChange={e => setB({ ...b, industry: e.target.value })}>
                <option value="">—</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={b.business_phone || ''} onChange={e => setB({ ...b, business_phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={b.business_email || ''} onChange={e => setB({ ...b, business_email: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={b.website_url || ''} onChange={e => setB({ ...b, website_url: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }}
                value={b.description || ''}
                onChange={e => setB({ ...b, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Brand</h2>

            <label style={labelStyle}>Logo</label>
            {b.brand_logo_url ? (
              <div style={{ marginBottom: '14px', textAlign: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img src={b.brand_logo_url} alt="" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ ...secondaryButton, fontSize: '11px', padding: '6px 12px' }}>
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '24px', borderRadius: '12px',
                  background: '#f8fafc', border: '2px dashed #e2e8f0',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', color: colors.textMuted, marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📎</div>
                Upload logo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />

            {extracting && <div style={{ fontSize: '12px', color: colors.blue, marginBottom: '12px' }}>Extracting palette…</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={palette[k] || '#cccccc'}
                    onChange={e => setPalette(p => ({ ...p, [k]: e.target.value }))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textDark, textTransform: 'capitalize', flex: 1 }}>{k}</span>
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'ui-monospace,Menlo,monospace' }}>{palette[k] || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: colors.errorBg, color: colors.error, fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 4px 16px' }}>
        <button onClick={() => router.push('/portal/businesses')} style={{ ...secondaryButton, fontFamily: 'inherit' }}>Cancel</button>
        <button onClick={save} disabled={saving} style={{ ...gradientButton, fontFamily: 'inherit', opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>
    </>
  )
}
