'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { createClient } from '@/lib/supabase/client'
import type { BrandColors } from '@/lib/portal/types'

const INDUSTRIES = [
  'dental-staffing',
  'dental-practice',
  'consulting',
  'real-estate',
  'restaurant',
  'professional-services',
  'medical',
  'retail',
  'other',
]

export default function NewBusinessPage() {
  const router = useRouter()
  const { refreshBusinesses, setActiveBusinessId } = useBusiness()

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [palette, setPalette] = useState<BrandColors>({})
  const [extracting, setExtracting] = useState(false)
  const [paletteNotes, setPaletteNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setError('')

    // Upload to Supabase storage (public bucket portal-logos)
    const supabase = createClient()
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error: upErr } = await supabase.storage.from('portal-logos').upload(path, file, { upsert: true })
    if (upErr) {
      setError(`Logo upload failed: ${upErr.message}`)
      return
    }
    const { data: pub } = supabase.storage.from('portal-logos').getPublicUrl(path)
    setLogoUrl(pub.publicUrl)

    // Auto-extract palette
    setExtracting(true)
    try {
      const res = await fetch('/api/portal/businesses/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: pub.publicUrl }),
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
        setPaletteNotes(data.palette.notes || '')
      } else {
        setError(`Couldn't extract palette: ${data.error || 'unknown'}`)
      }
    } catch (e) {
      setError(`Couldn't extract palette: ${e instanceof Error ? e.message : 'unknown'}`)
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Business name is required')
      return
    }
    setError('')
    setSaving(true)
    const res = await fetch('/api/portal/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: name.trim(),
        industry: industry || null,
        business_phone: phone.trim() || null,
        business_email: email.trim() || null,
        website_url: websiteUrl.trim() || null,
        description: description.trim() || null,
        brand_colors: palette,
        brand_logo_url: logoUrl,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Failed to create business')
      return
    }
    await refreshBusinesses()
    if (data.business?.id) setActiveBusinessId(data.business.id)
    router.push('/portal')
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Add a business</h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          Tell us the basics. Upload your logo and we&apos;ll extract a brand palette automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Left column: business basics */}
        <div style={{ flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Business basics</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Business name <span style={{ color: colors.error }}>*</span></label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Smile Dental Temps LLC" required />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Industry</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select an industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label style={labelStyle}>Business email</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Website (optional)</label>
              <input style={inputStyle} value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
            </div>

            <div>
              <label style={labelStyle}>What does this business do?</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="One or two sentences. Helps the AI assistant understand context."
              />
            </div>
          </div>
        </div>

        {/* Right column: branding */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...card, padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '14px' }}>Brand</h2>

            <label style={labelStyle}>Logo</label>
            {logoUrl ? (
              <div style={{ marginBottom: '14px', textAlign: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img src={logoUrl} alt="logo preview" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
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
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', color: colors.textMuted,
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📎</div>
                Click to upload your logo
                <div style={{ fontSize: '11px', marginTop: '4px' }}>PNG / JPG / WebP — palette auto-extracted</div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />

            {extracting && (
              <div style={{ fontSize: '12px', color: colors.blue, marginBottom: '12px' }}>
                Reading your logo to extract a brand palette…
              </div>
            )}

            {(palette.primary || palette.secondary || palette.accent) && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Extracted palette
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        value={palette[k] || '#cccccc'}
                        onChange={e => setPalette(p => ({ ...p, [k]: e.target.value }))}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: 0, background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textDark, textTransform: 'capitalize', flex: 1 }}>{k}</span>
                      <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'ui-monospace,Menlo,monospace' }}>{palette[k] || '—'}</span>
                    </div>
                  ))}
                </div>
                {paletteNotes && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: colors.textMuted, fontStyle: 'italic' }}>
                    &quot;{paletteNotes}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: colors.errorBg, color: colors.error, fontSize: '13px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 4px 16px' }}>
        <button type="button" onClick={() => router.back()} style={{ ...secondaryButton, fontFamily: 'inherit' }}>Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          style={{ ...gradientButton, fontFamily: 'inherit', opacity: saving || !name.trim() ? 0.5 : 1 }}
        >
          {saving ? 'Adding…' : 'Add business'}
        </button>
      </div>
    </>
  )
}
