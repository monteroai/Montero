'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Copy, Check, RefreshCw, X, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'

const ROOM_TYPES = [
  'Bedroom', 'Living Room', 'Kitchen', 'Dining Room', 'Bathroom',
  'Office', 'Basement', 'Hallway', 'Exterior Front', 'Exterior Back',
  'Backyard', 'Parking', 'Other',
]

interface PhotoItem {
  id: string
  file: File
  previewUrl: string
  enhancedUrl: string | null
  enhancing: boolean
  showEnhanced: boolean
  roomType: string
  stagingPrompt: string
  stagedUrl: string | null
  staging: boolean
  stagingError: string
}

interface AnalysisResult {
  detected_features: string[]
  remarks: string
  instagram_caption: string
  sms_teaser: string
}

const STAGING_PRESETS = {
  'Modern Minimal':     'Light-toned modern furniture, clean lines, Scandinavian aesthetic, minimal decor',
  'Warm & Cozy':        'Warm plush furnishings, earthy tones, layered area rug, soft ambient lighting',
  'Luxury Traditional': 'Elegant upholstered furniture, rich fabrics, quality area rug, classic framed artwork',
}

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

const WHAT_YOU_GET = [
  'MLS remarks in your agent voice',
  'Instagram caption (under 150 chars)',
  'SMS teaser (under 160 chars)',
  'Virtual staging for empty rooms',
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: copied ? '#16a34a' : blue, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Card({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}`, background: inputBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMuted }}>{label}</span>
        {action}
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  )
}

export default function AgentOSPage() {
  const [photos,       setPhotos]       = useState<PhotoItem[]>([])
  const [address,      setAddress]      = useState('')
  const [propertyDesc, setPropertyDesc] = useState('')
  const [analyzing,    setAnalyzing]    = useState(false)
  const [result,       setResult]       = useState<AnalysisResult | null>(null)
  const [error,        setError]        = useState('')
  const [socialTab,    setSocialTab]    = useState<'instagram' | 'sms'>('instagram')
  const [dragging,     setDragging]     = useState(false)
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updatePhoto = useCallback((id: string, updates: Partial<PhotoItem>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const runAnalysis = useCallback(async (currentPhotos: PhotoItem[], addr: string, desc: string) => {
    if (currentPhotos.length === 0 && !desc.trim()) return
    setAnalyzing(true); setError('')
    try {
      const fd = new FormData()
      currentPhotos.forEach(p => fd.append('photos', p.file))
      if (addr) fd.append('address', addr)
      if (desc) fd.append('description', desc)
      const res = await fetch('/api/analyze-photos', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const stageRoom = useCallback(async (photo: PhotoItem) => {
    setActiveStageId(photo.id)
    updatePhoto(photo.id, { staging: true, stagingError: '', stagedUrl: null })
    try {
      const fd = new FormData()
      fd.append('base_image', photo.file)
      fd.append('room_type', photo.roomType || '')
      fd.append('style', photo.stagingPrompt.trim())
      const res = await fetch('/api/stage-room', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      updatePhoto(photo.id, { stagedUrl: data.url, staging: false })
    } catch (e: unknown) {
      updatePhoto(photo.id, { stagingError: e instanceof Error ? e.message : 'Staging failed.', staging: false })
    }
  }, [updatePhoto])

  const simulateEnhancement = useCallback((id: string) => {
    setTimeout(() => {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, enhancing: false } : p))
    }, 2200)
  }, [])

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/')).slice(0, 20)
    if (valid.length === 0) return
    const newItems: PhotoItem[] = valid.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      enhancedUrl: null,
      enhancing: true,
      showEnhanced: false,
      roomType: '',
      stagingPrompt: '',
      stagedUrl: null,
      staging: false,
      stagingError: '',
    }))
    setPhotos(prev => {
      const merged = [...prev, ...newItems].slice(0, 20)
      newItems.forEach(p => simulateEnhancement(p.id))
      return merged
    })
  }, [simulateEnhancement])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id))
  const toggleEnhanced = (id: string) => setPhotos(prev => prev.map(p => p.id === id ? { ...p, showEnhanced: !p.showEnhanced } : p))

  const hasPhotos = photos.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: blue, marginBottom: '8px' }}>
            MONTERO Agent OS
          </p>
          <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600, color: navy, lineHeight: 1.15, marginBottom: '8px' }}>
            Photo-First Listing Tool
          </h1>
          <p style={{ color: textMuted, fontSize: '15px', lineHeight: 1.6 }}>
            Drop your listing photos. AI scans every room and writes your MLS remarks, Instagram caption, and SMS — instantly.
          </p>
        </div>

        {/* What you get */}
        <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMuted, marginBottom: '12px' }}>
            What you&apos;ll get
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {WHAT_YOU_GET.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', color: blue, fontWeight: 700 }}>&#10003;</span>
                <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,.heic,.jpg,.jpeg,.png"
          multiple
          style={{ display: 'none' }}
          onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: dragging ? `2px dashed ${blue}` : `2px dashed ${border}`,
            borderRadius: '16px',
            padding: hasPhotos ? '20px 24px' : '56px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(37,99,235,0.03)' : inputBg,
            transition: 'all 0.2s',
            marginBottom: '20px',
          }}
        >
          <Upload size={hasPhotos ? 20 : 28} style={{ color: blue, margin: '0 auto', display: 'block', marginBottom: '10px' }} />
          <p style={{ fontSize: hasPhotos ? '13px' : '15px', fontWeight: 500, color: navy, marginBottom: '4px' }}>
            {hasPhotos
              ? `${photos.length} photo${photos.length === 1 ? '' : 's'} added — drop more or tap to add`
              : 'Drop your listing photos here — or tap to upload'}
          </p>
          {!hasPhotos && <p style={{ fontSize: '12px', color: '#94a3b8' }}>JPG · PNG · HEIC · up to 20 photos</p>}
        </div>

        {/* Address */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textMuted, marginBottom: '6px', letterSpacing: '0.04em' }}>
            Property address <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="42 Riverside Ave, Cos Cob CT 06807"
            style={{ width: '100%', border: `1px solid ${border}`, borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: textDark, outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
          />
        </div>

        {/* Property description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textMuted, marginBottom: '6px', letterSpacing: '0.04em' }}>
            Property description <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional — adds context, or use alone without photos)</span>
          </label>
          <textarea
            value={propertyDesc}
            onChange={e => setPropertyDesc(e.target.value)}
            rows={2}
            placeholder='e.g. "Gut-renovated pre-war co-op, new kitchen and baths, southern exposure, low maintenance"'
            style={{ width: '100%', border: `1px solid ${border}`, borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: textDark, outline: 'none', boxSizing: 'border-box', background: '#ffffff', resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {/* Photo grid */}
        {hasPhotos && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            {photos.map(p => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', background: '#F3F4F6' }}>
                  <img
                    src={p.showEnhanced && p.enhancedUrl ? p.enhancedUrl : p.previewUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {p.enhancing && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); removePhoto(p.id) }}
                    style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <X size={12} />
                  </button>
                  {!p.enhancing && (
                    <button
                      onClick={e => { e.stopPropagation(); toggleEnhanced(p.id) }}
                      style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', fontWeight: 600, padding: '3px 7px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: p.showEnhanced ? blue : 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      {p.showEnhanced ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                      {p.showEnhanced ? 'Enhanced' : 'Original'}
                    </button>
                  )}
                  {p.enhancing && (
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', fontWeight: 600, padding: '3px 7px', borderRadius: '4px', background: 'rgba(0,0,0,0.45)', color: 'white' }}>
                      Enhancing...
                    </div>
                  )}
                </div>
                <select
                  value={p.roomType}
                  onChange={e => updatePhoto(p.id, { roomType: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  style={{ width: '100%', marginTop: '5px', fontSize: '11px', padding: '4px 6px', borderRadius: '6px', border: `1px solid ${border}`, background: '#ffffff', color: p.roomType ? navy : '#94a3b8', cursor: 'pointer' }}
                >
                  <option value="">Room type...</option>
                  {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Generate button */}
        {(hasPhotos || propertyDesc.trim()) && !analyzing && !result && (
          <button
            onClick={() => runAnalysis(photos, address, propertyDesc)}
            style={{ width: '100%', padding: '16px', background: navy, color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em', marginBottom: '24px' }}
          >
            {hasPhotos ? 'Analyze Photos & Generate Copy' : 'Generate Copy from Description'}
          </button>
        )}

        {/* Analysis status */}
        {analyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: inputBg, border: `1px solid ${border}`, borderRadius: '12px', marginBottom: '24px' }}>
            <RefreshCw size={15} style={{ color: blue, animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: textMuted }}>
              {hasPhotos ? `Analyzing ${photos.length} photo${photos.length === 1 ? '' : 's'}...` : 'Generating copy...'}
            </span>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && !analyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {result.detected_features && result.detected_features.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.detected_features.map((f: string, i: number) => (
                  <span key={i} style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '9999px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', color: '#1d4ed8' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}

            {result.remarks && (
              <Card label="MLS Listing Remarks" action={
                <div style={{ display: 'flex', gap: '4px' }}>
                  <CopyBtn text={result.remarks} />
                  <button onClick={() => runAnalysis(photos, address, propertyDesc)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              }>
                <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{result.remarks}</p>
              </Card>
            )}

            {(result.instagram_caption || result.sms_teaser) && (
              <Card label="Social Content" action={<CopyBtn text={socialTab === 'instagram' ? result.instagram_caption : result.sms_teaser} />}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                  {(['instagram', 'sms'] as const).map(tab => (
                    <button key={tab} onClick={() => setSocialTab(tab)}
                      style={{ fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: socialTab === tab ? navy : '#F3F4F6', color: socialTab === tab ? '#ffffff' : textMuted, textTransform: 'capitalize' }}>
                      {tab === 'instagram' ? 'Instagram' : 'SMS'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                  {socialTab === 'instagram' ? result.instagram_caption : result.sms_teaser}
                </p>
              </Card>
            )}

            {/* Virtual Staging */}
            <Card label="Virtual Staging">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {photos.map(p => {
                  const isActive = activeStageId === p.id
                  const isDone = !!p.stagedUrl
                  const roomLabel = p.roomType || 'Room'
                  return (
                    <div key={p.id} style={{ border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setActiveStageId(isActive ? null : p.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: isActive ? inputBg : '#ffffff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={p.previewUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                          {isDone && (
                            <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff', fontWeight: 700 }}>&#10003;</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: navy }}>{roomLabel}</p>
                          {isDone && !isActive && <p style={{ margin: 0, fontSize: '11px', color: '#16a34a' }}>Staged — tap to view or re-stage</p>}
                          {!isDone && !p.staging && !isActive && <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Tap to stage this room</p>}
                          {p.staging && <p style={{ margin: 0, fontSize: '11px', color: blue }}>Staging...</p>}
                        </div>
                        {isDone && !isActive && (
                          <img src={p.stagedUrl!} alt="staged" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }} />
                        )}
                        {isActive ? <ChevronUp size={16} style={{ color: '#94a3b8', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                      </button>

                      {isActive && (
                        <div style={{ padding: '14px', borderTop: `1px solid ${border}`, background: '#ffffff' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                            Staging style
                          </p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {Object.keys(STAGING_PRESETS).map(name => (
                              <button
                                key={name}
                                onClick={() => updatePhoto(p.id, { stagingPrompt: STAGING_PRESETS[name as keyof typeof STAGING_PRESETS] })}
                                style={{
                                  fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '9999px', cursor: 'pointer', transition: 'all 0.15s',
                                  border: p.stagingPrompt === STAGING_PRESETS[name as keyof typeof STAGING_PRESETS] ? `1px solid ${blue}` : `1px solid ${border}`,
                                  background: p.stagingPrompt === STAGING_PRESETS[name as keyof typeof STAGING_PRESETS] ? 'rgba(37,99,235,0.06)' : '#ffffff',
                                  color: p.stagingPrompt === STAGING_PRESETS[name as keyof typeof STAGING_PRESETS] ? '#1d4ed8' : textMuted,
                                }}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={p.stagingPrompt}
                            onChange={e => updatePhoto(p.id, { stagingPrompt: e.target.value })}
                            rows={2}
                            placeholder={`Describe what you want in this ${roomLabel.toLowerCase()}...`}
                            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '13px', color: textDark, background: inputBg, resize: 'vertical', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }}
                          />

                          <button
                            onClick={() => stageRoom(p)}
                            disabled={p.staging}
                            style={{
                              width: '100%', padding: '11px', background: p.staging ? border : blue, color: p.staging ? '#94a3b8' : '#ffffff',
                              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                              cursor: p.staging ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              marginBottom: p.stagedUrl || p.stagingError ? '12px' : '0',
                            }}
                          >
                            {p.staging
                              ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Staging {roomLabel}...</>
                              : `Stage ${roomLabel}`}
                          </button>

                          {p.stagingError && (
                            <p style={{ fontSize: '13px', color: '#dc2626', padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', marginBottom: '0' }}>{p.stagingError}</p>
                          )}

                          {p.stagedUrl && (
                            <div>
                              <img src={p.stagedUrl} alt="Staged room" style={{ width: '100%', borderRadius: '8px', display: 'block', marginBottom: '10px' }} />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => { const a = document.createElement('a'); a.href = p.stagedUrl!; a.download = `staged-${roomLabel.toLowerCase().replace(' ', '-')}.png`; a.click() }}
                                  style={{ flex: 1, padding: '10px', textAlign: 'center', background: navy, color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => stageRoom(p)}
                                  style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Regenerate
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
