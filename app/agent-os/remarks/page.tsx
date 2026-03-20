'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Landmark {
  name: string
  distance: string
}

interface FormState {
  address: string
  property_type: string
  price: string
  bedrooms: string
  bathrooms: string
  key_features: string
  any_extras: string
  landmarks: Landmark[]
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_REMARKS_URL ||
  'https://montero-cool.app.n8n.cloud/webhook/agent-remarks'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

export default function RemarksPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agentDna, setAgentDna] = useState<any>(null)

  useEffect(() => {
    async function loadDna() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('agent_id', user.id)
        .single()
      if (data) setAgentDna(data)
    }
    loadDna()
  }, [])

  const [form, setForm] = useState<FormState>({
    address: '',
    property_type: 'Condo',
    price: '',
    bedrooms: '',
    bathrooms: '',
    key_features: '',
    any_extras: '',
    landmarks: [{ name: '', distance: '' }],
  })
  const [result, setResult] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function updateLandmark(index: number, field: keyof Landmark, value: string) {
    const updated = [...form.landmarks]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, landmarks: updated })
  }

  function addLandmark() {
    setForm({ ...form, landmarks: [...form.landmarks, { name: '', distance: '' }] })
  }

  function removeLandmark(index: number) {
    setForm({ ...form, landmarks: form.landmarks.filter((_, i) => i !== index) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult('')

    const payload = {
      address: form.address,
      property_type: form.property_type,
      price: form.price,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseFloat(form.bathrooms) || 0,
      key_features: form.key_features.split('\n').map(f => f.trim()).filter(Boolean),
      any_extras: form.any_extras,
      nearby_landmarks: form.landmarks
        .filter(lm => lm.name && lm.distance)
        .map(lm => ({ name: lm.name, distance: parseFloat(lm.distance) })),
      agent_slug: 'magyar',
      // Agent DNA injected into n8n prompt for personalized output
      agent_dna: agentDna ? {
        agent_name: agentDna.agent_name,
        brokerage: agentDna.brokerage,
        brand_voice: agentDna.brand_voice,
        market_area: agentDna.market_area,
        specialty: agentDna.specialty,
        target_client: agentDna.target_client,
        sample_remarks: agentDna.sample_remarks,
        words_to_avoid: agentDna.words_to_avoid,
        signature_phrases: agentDna.signature_phrases,
      } : undefined,
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      setResult(data.remark)
      setWordCount(data.remark.split(/\s+/).length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Agent Remarks</h1>
        <p style={{ fontSize: '14px', color: textMuted }}>Generate MLS-ready remarks filtered through your agent DNA.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property Address *</label>
          <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="77 Tuttle Street, Unit 4B, Stamford, CT" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Property Type</label>
            <select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['Condo', 'Single Family', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>List Price ($)</label>
            <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="289000" />
          </div>
          <div>
            <label style={labelStyle}>Bedrooms</label>
            <input type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} style={inputStyle} placeholder="2" />
          </div>
          <div>
            <label style={labelStyle}>Bathrooms</label>
            <input type="number" step="0.5" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} style={inputStyle} placeholder="1" />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Key Features (one per line)</label>
          <textarea rows={4} value={form.key_features} onChange={e => setForm({ ...form, key_features: e.target.value })} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder={'hardwood floors\nupdated kitchen\nprivate balcony\nin-unit laundry'} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Nearby Landmarks</label>
            <button type="button" onClick={addLandmark} style={{ fontSize: '12px', fontWeight: 600, color: blue, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {form.landmarks.map((lm, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input value={lm.name} onChange={e => updateLandmark(i, 'name', e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="Stamford Train Station" />
                <input value={lm.distance} onChange={e => updateLandmark(i, 'distance', e.target.value)} style={{ ...inputStyle, width: '100px' }} placeholder="0.9 mi" />
                {form.landmarks.length > 1 && (
                  <button type="button" onClick={() => removeLandmark(i)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Additional Notes</label>
          <textarea rows={2} value={form.any_extras} onChange={e => setForm({ ...form, any_extras: e.target.value })} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="South-facing unit. Low HOA. Well-maintained building." />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', background: navy, color: '#ffffff', border: 'none',
          borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Generating...' : 'Generate Remarks'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '24px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '14px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px', background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: textDark }}>Generated Remarks</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{wordCount} words</span>
          </div>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
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
