'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Landmark {
  name: string
  distance: string
}

interface ContentPack {
  agent_remarks: string
  instagram_caption: string
  facebook_post: string
  email_subject_lines: string[]
  sms_teaser: string
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_CONTENT_URL ||
  'https://montero-cool.app.n8n.cloud/webhook/agent-content'

const TABS = [
  { key: 'agent_remarks', label: 'MLS Remarks' },
  { key: 'instagram_caption', label: 'Instagram' },
  { key: 'facebook_post', label: 'Facebook' },
  { key: 'email_subject_lines', label: 'Email Subjects' },
  { key: 'sms_teaser', label: 'SMS' },
] as const

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

export default function ContentPage() {
  const [address, setAddress] = useState('')
  const [propertyType, setPropertyType] = useState('Condo')
  const [price, setPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [keyFeatures, setKeyFeatures] = useState('')
  const [anyExtras, setAnyExtras] = useState('')
  const [landmarks, setLandmarks] = useState<Landmark[]>([{ name: '', distance: '' }])

  const [pack, setPack] = useState<ContentPack | null>(null)
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('agent_remarks')
  const [tokens, setTokens] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function updateLandmark(i: number, field: keyof Landmark, value: string) {
    const updated = [...landmarks]
    updated[i] = { ...updated[i], [field]: value }
    setLandmarks(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPack(null)

    const payload = {
      address,
      property_type: propertyType,
      price,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseFloat(bathrooms) || 0,
      key_features: keyFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      any_extras: anyExtras,
      nearby_landmarks: landmarks
        .filter(lm => lm.name && lm.distance)
        .map(lm => ({ name: lm.name, distance: parseFloat(lm.distance) })),
      agent_slug: 'magyar',
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      setPack(data.content)
      setTokens(data.tokens?.output_tokens || 0)
      setActiveTab('agent_remarks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function getContent(key: typeof TABS[number]['key']): string {
    if (!pack) return ''
    const val = pack[key]
    return Array.isArray(val) ? val.join('\n') : val
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${border}`, borderRadius: '10px',
    padding: '10px 14px', fontSize: '14px', color: textDark, outline: 'none',
    boxSizing: 'border-box', background: inputBg,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Full Content Pack</h1>
        <p style={{ fontSize: '14px', color: textMuted }}>One listing &rarr; MLS remarks, Instagram, Facebook, 5 email subjects, and SMS.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property Address *</label>
          <input required value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="77 Tuttle Street, Unit 4B, Stamford, CT" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['Condo', 'Single Family', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>List Price ($)</label>
            <input value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} placeholder="289000" />
          </div>
          <div>
            <label style={labelStyle}>Bedrooms</label>
            <input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={inputStyle} placeholder="2" />
          </div>
          <div>
            <label style={labelStyle}>Bathrooms</label>
            <input type="number" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)} style={inputStyle} placeholder="1" />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Key Features (one per line)</label>
          <textarea rows={4} value={keyFeatures} onChange={e => setKeyFeatures(e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder={'hardwood floors\nupdated kitchen\nprivate balcony\nin-unit laundry'} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Nearby Landmarks</label>
            <button type="button" onClick={() => setLandmarks([...landmarks, { name: '', distance: '' }])} style={{ fontSize: '12px', fontWeight: 600, color: blue, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {landmarks.map((lm, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input value={lm.name} onChange={e => updateLandmark(i, 'name', e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="Stamford Train Station" />
                <input value={lm.distance} onChange={e => updateLandmark(i, 'distance', e.target.value)} style={{ ...inputStyle, width: '100px' }} placeholder="0.9 mi" />
                {landmarks.length > 1 && (
                  <button type="button" onClick={() => setLandmarks(landmarks.filter((_, j) => j !== i))} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Additional Notes</label>
          <textarea rows={2} value={anyExtras} onChange={e => setAnyExtras(e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="South-facing. Low HOA. Well-maintained building." />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', background: navy, color: '#ffffff', border: 'none',
          borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Generating content pack...' : 'Generate Full Content Pack'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '24px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '14px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {pack && (
        <div style={{ marginTop: '24px', background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 16px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === tab.key ? navy : textMuted,
                  borderBottom: activeTab === tab.key ? `2px solid ${navy}` : '2px solid transparent',
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
            {tokens > 0 && (
              <span style={{ marginLeft: 'auto', padding: '12px 16px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {tokens} tokens
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {activeTab === 'email_subject_lines' ? (
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pack.email_subject_lines.map((line, i) => (
                  <li key={i} style={{ fontSize: '14px', color: textDark, display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#94a3b8', fontFamily: 'monospace', width: '20px', flexShrink: 0 }}>{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {getContent(activeTab)}
              </p>
            )}
            <button
              onClick={() => { navigator.clipboard.writeText(getContent(activeTab)); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: copied ? '#16a34a' : blue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
