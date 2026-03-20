'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Save } from 'lucide-react'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const borderColor = '#e2e8f0'
const inputBg = '#f8fafc'

interface DnaEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDna: any
}

const DNA_FIELDS = [
  { key: 'agent_name', label: 'Agent Name', placeholder: 'Charles Magyar', type: 'text' },
  { key: 'brokerage', label: 'Brokerage', placeholder: 'William Raveis Real Estate', type: 'text' },
  { key: 'market_area', label: 'Market Area', placeholder: 'Greenwich, CT', type: 'text' },
  { key: 'specialty', label: 'Specialty', placeholder: 'Luxury residential, waterfront properties', type: 'text' },
  { key: 'brand_voice', label: 'Brand Voice', placeholder: 'Professional and warm, luxury-focused, no cliches', type: 'textarea',
    hint: 'Describe how your writing should sound. This directly shapes all AI-generated content.' },
  { key: 'target_client', label: 'Target Client', placeholder: 'Affluent buyers relocating to Fairfield County', type: 'text' },
  { key: 'neighborhoods', label: 'Neighborhoods', placeholder: 'Greenwich, Old Greenwich, Riverside, Cos Cob', type: 'text',
    hint: 'Comma-separated list of areas you specialize in.', isArray: true },
  { key: 'languages', label: 'Languages', placeholder: 'English, Spanish', type: 'text',
    hint: 'Comma-separated.', isArray: true },
  { key: 'price_range_min', label: 'Price Range Min ($)', placeholder: '500000', type: 'number' },
  { key: 'price_range_max', label: 'Price Range Max ($)', placeholder: '5000000', type: 'number' },
  { key: 'sample_remarks', label: 'Sample Remarks (paste 1-3 of your best)', placeholder: 'Paste your actual MLS remarks here so the AI can learn your writing style...', type: 'textarea',
    hint: 'The AI uses these to mimic your tone, vocabulary, and sentence structure.' },
  { key: 'words_to_avoid', label: 'Words / Phrases to Avoid', placeholder: 'nestled, boasts, stunning, turnkey', type: 'text',
    hint: 'Comma-separated. These will never appear in generated content.', isArray: true },
  { key: 'signature_phrases', label: 'Signature Phrases', placeholder: 'move-in ready, coveted location, sun-drenched', type: 'text',
    hint: 'Comma-separated. Phrases you like to use that make your writing yours.', isArray: true },
] as const

export default function DnaEditor({ initialDna }: DnaEditorProps) {
  const [form, setForm] = useState(() => {
    const defaults: Record<string, string> = {}
    for (const field of DNA_FIELDS) {
      const val = initialDna?.[field.key]
      if (field.isArray && Array.isArray(val)) {
        defaults[field.key] = val.join(', ')
      } else {
        defaults[field.key] = val?.toString() ?? ''
      }
    }
    return defaults
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    // Build payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = { updated_at: new Date().toISOString() }
    for (const field of DNA_FIELDS) {
      const raw = form[field.key]?.trim() ?? ''
      if (field.isArray) {
        payload[field.key] = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []
      } else if (field.type === 'number') {
        payload[field.key] = raw ? Number(raw) : null
      } else {
        payload[field.key] = raw || null
      }
    }

    // Try update first (by agent_id), then upsert if no row exists
    const { data: existing } = await supabase
      .from('agent_dna')
      .select('id')
      .eq('agent_id', user.id)
      .single()

    let result
    if (existing) {
      result = await supabase.from('agent_dna').update(payload).eq('agent_id', user.id)
    } else {
      // Fallback: try org_slug for legacy row
      const { data: legacyRow } = await supabase
        .from('agent_dna')
        .select('id')
        .eq('org_slug', 'magyar')
        .single()

      if (legacyRow) {
        result = await supabase.from('agent_dna').update({ ...payload, agent_id: user.id }).eq('id', legacyRow.id)
      } else {
        result = await supabase.from('agent_dna').insert({ ...payload, agent_id: user.id })
      }
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${borderColor}`, borderRadius: '10px',
    padding: '10px 14px', fontSize: '14px', color: textDark, outline: 'none',
    boxSizing: 'border-box', background: inputBg,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Agent DNA</h1>
        <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.6 }}>
          This profile powers all AI-generated content. The more detail you provide, the more your remarks, captions, and emails will sound like you.
        </p>
      </div>

      {initialDna?.dna_summary && (
        <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 600, color: blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>DNA Summary</h2>
          <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.7 }}>{initialDna.dna_summary}</p>
        </div>
      )}

      <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '24px' }}>
        {DNA_FIELDS.map(field => (
          <div key={field.key} style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                rows={field.key === 'sample_remarks' ? 6 : 3}
                value={form[field.key]}
                onChange={e => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={form[field.key]}
                onChange={e => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            )}
            {'hint' in field && field.hint && (
              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                {field.hint}
              </span>
            )}
          </div>
        ))}

        {error && (
          <p style={{
            fontSize: '13px', color: '#dc2626', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '16px',
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '12px',
            background: saved ? '#16a34a' : navy,
            color: '#ffffff', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.2s',
          }}
        >
          {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save DNA Profile</>}
        </button>
      </div>

      {initialDna?.updated_at && (
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
          Last updated: {new Date(initialDna.updated_at).toLocaleDateString()}
          {initialDna.id && <>{' · '}DNA ID: <span style={{ fontFamily: 'monospace' }}>{initialDna.id.slice(0, 8)}...</span></>}
        </p>
      )}
    </div>
  )
}
