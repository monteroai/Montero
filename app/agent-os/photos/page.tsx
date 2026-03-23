'use client'

import { useState, useRef } from 'react'

const ROOM_TYPES = [
  'Bedroom', 'Living Room', 'Kitchen', 'Dining Room', 'Bathroom',
  'Office', 'Basement', 'Hallway', 'Exterior Front', 'Exterior Back',
  'Backyard',
]

const STYLE_PRESETS = [
  'Modern Minimalist',
  'Warm & Cozy',
  'Luxury Traditional',
  'Scandinavian',
  'Mid-Century Modern',
  'Contemporary Glam',
]

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

export default function StagingPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [roomType, setRoomType] = useState('Living Room')
  const [style, setStyle] = useState('Modern Minimalist')
  const [stagedUrl, setStagedUrl] = useState<string | null>(null)
  const [staging, setStaging] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setStagedUrl(null)
    setError('')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function stageRoom() {
    if (!file) return
    setStaging(true)
    setError('')
    setStagedUrl(null)

    try {
      const fd = new FormData()
      fd.append('base_image', file)
      fd.append('room_type', roomType)
      fd.append('style', style)

      const res = await fetch('/api/stage-room', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setStagedUrl(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Staging failed.')
    } finally {
      setStaging(false)
    }
  }

  function downloadImage() {
    if (!stagedUrl) return
    const a = document.createElement('a')
    a.href = stagedUrl
    a.download = `staged-${roomType.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  function resetUpload() {
    setFile(null)
    setPreviewUrl(null)
    setStagedUrl(null)
    setError('')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#ffffff', borderRadius: '16px', border: `1px solid ${border}` }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Header + Credits */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: blue, marginBottom: '6px' }}>
              AI Virtual Staging
            </p>
            <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 600, color: navy, lineHeight: 1.15, margin: 0 }}>
              Stage Any Room
            </h1>
            <p style={{ color: textMuted, fontSize: '14px', marginTop: '6px' }}>
              Upload a photo, pick your style, get a professionally staged image in seconds.
            </p>
          </div>
        </div>

        {/* Upload zone — only show when no file selected */}
        {!previewUrl && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                border: dragging ? `2px dashed ${blue}` : `2px dashed ${border}`,
                borderRadius: '16px',
                padding: '64px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(37,99,235,0.03)' : inputBg,
                transition: 'all 0.2s',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 14px', display: 'block' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p style={{ fontSize: '15px', fontWeight: 500, color: navy, marginBottom: '4px' }}>
                Drop a room photo here — or tap to upload
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>JPG, PNG, or WebP. One photo at a time.</p>
            </div>
          </>
        )}

        {/* Staging controls — show when file is selected */}
        {previewUrl && (
          <div>
            {/* Room type + style selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textMuted, marginBottom: '6px', letterSpacing: '0.04em' }}>
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', border: `1px solid ${border}`,
                    borderRadius: '10px', fontSize: '14px', color: textDark, background: '#ffffff',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textMuted, marginBottom: '6px', letterSpacing: '0.04em' }}>
                  Style
                </label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', border: `1px solid ${border}`,
                    borderRadius: '10px', fontSize: '14px', color: textDark, background: '#ffffff',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {STYLE_PRESETS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Stage button */}
            <button
              onClick={stageRoom}
              disabled={staging}
              style={{
                width: '100%', padding: '14px',
                background: staging ? border : `linear-gradient(135deg, ${navy}, ${blue})`,
                color: staging ? '#94a3b8' : '#ffffff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                cursor: staging ? 'not-allowed' : 'pointer',
                boxShadow: staging ? 'none' : '0 4px 14px rgba(37,99,235,0.2)',
                marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {staging ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Staging — this takes 15-30 seconds...
                </>
              ) : `Stage This ${roomType}`}
            </button>

            {error && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Side-by-side comparison */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: stagedUrl ? '1fr 1fr' : '1fr',
              gap: '12px',
              marginBottom: '20px',
            }}>
              {/* Original */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMuted, marginBottom: '8px' }}>
                  Original
                </p>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}` }}>
                  <img src={previewUrl} alt="Original" style={{ width: '100%', display: 'block' }} />
                </div>
              </div>

              {/* Staged */}
              {stagedUrl && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '8px' }}>
                    AI Staged
                  </p>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #bbf7d0' }}>
                    <img src={stagedUrl} alt="Staged" style={{ width: '100%', display: 'block' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {stagedUrl && (
                <>
                  <button
                    onClick={downloadImage}
                    style={{
                      flex: 1, padding: '12px',
                      background: navy, color: '#ffffff', border: 'none',
                      borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Download Staged Image
                  </button>
                  <button
                    onClick={stageRoom}
                    disabled={staging}
                    style={{
                      flex: 1, padding: '12px',
                      background: '#f3f4f6', color: '#374151', border: 'none',
                      borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                      cursor: staging ? 'not-allowed' : 'pointer',
                      opacity: staging ? 0.5 : 1,
                    }}
                  >
                    Regenerate
                  </button>
                </>
              )}
              <button
                onClick={resetUpload}
                style={{
                  padding: '12px 20px',
                  background: 'transparent', color: textMuted,
                  border: `1px solid ${border}`, borderRadius: '10px',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                New Photo
              </button>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
