'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Save } from 'lucide-react'

const navy = '#1B2B5E'
const textDark = '#1e293b'
const textMuted = '#64748b'
const borderColor = '#e2e8f0'
const inputBg = '#f8fafc'

interface DnaEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDna: any
}

export default function DnaEditor({ initialDna }: DnaEditorProps) {
  const d = initialDna ?? {}

  const [agentName, setAgentName] = useState(d.agent_name ?? '')
  const [brokerage, setBrokerage] = useState(d.brokerage ?? '')
  const [brandVoice, setBrandVoice] = useState(d.brand_voice ?? '')
  const [sampleRemarks, setSampleRemarks] = useState(d.sample_remarks ?? '')
  const [wordsToAvoid, setWordsToAvoid] = useState(
    Array.isArray(d.words_to_avoid) ? d.words_to_avoid.join(', ') : d.words_to_avoid ?? ''
  )
  const [signaturePhrases, setSignaturePhrases] = useState(
    Array.isArray(d.signature_phrases) ? d.signature_phrases.join(', ') : d.signature_phrases ?? ''
  )

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    const payload = {
      agent_name: agentName.trim() || null,
      brokerage: brokerage.trim() || null,
      brand_voice: brandVoice.trim() || null,
      sample_remarks: sampleRemarks.trim() || null,
      words_to_avoid: wordsToAvoid.trim()
        ? wordsToAvoid.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      signature_phrases: signaturePhrases.trim()
        ? signaturePhrases.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      updated_at: new Date().toISOString(),
    }

    // Try update by agent_id first
    const { data: existing } = await supabase
      .from('agent_dna')
      .select('id')
      .eq('agent_id', user.id)
      .single()

    let result
    if (existing) {
      result = await supabase.from('agent_dna').update(payload).eq('agent_id', user.id)
    } else {
      // Fallback: claim legacy magyar row
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
    display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px',
  }

  const hintStyle: React.CSSProperties = {
    fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block', lineHeight: 1.5,
  }

  return (
    <div style={{ padding: '32px', maxWidth: '580px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Your Writing Voice</h1>
        <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.6 }}>
          Tell us how you write. Everything the AI generates — remarks, captions, emails — will match your style.
        </p>
      </div>

      <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '28px' }}>

        {/* Identity row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div>
            <label style={labelStyle}>Your Name</label>
            <input
              value={agentName}
              onChange={e => { setAgentName(e.target.value); setSaved(false) }}
              placeholder="Charles Magyar"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Brokerage</label>
            <input
              value={brokerage}
              onChange={e => { setBrokerage(e.target.value); setSaved(false) }}
              placeholder="William Raveis"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Brand Voice */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>How should your content sound?</label>
          <textarea
            rows={3}
            value={brandVoice}
            onChange={e => { setBrandVoice(e.target.value); setSaved(false) }}
            placeholder="Professional and direct. Warm but not salesy. Emphasize neighborhood lifestyle over square footage. Avoid generic luxury cliches."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
          <span style={hintStyle}>
            Be specific. &quot;Professional and warm&quot; is fine, but &quot;confident without being pushy, always lead with lifestyle and location&quot; gives the AI much more to work with.
          </span>
        </div>

        {/* Sample Remarks — the most important field */}
        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Paste 1-3 of your best MLS remarks</label>
          <textarea
            rows={8}
            value={sampleRemarks}
            onChange={e => { setSampleRemarks(e.target.value); setSaved(false) }}
            placeholder={"This sun-drenched colonial in the heart of Old Greenwich offers the rare combination of...\n\n---\n\nWelcome to 42 Riverside Avenue — a completely reimagined 4-bedroom..."}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
          />
          <span style={hintStyle}>
            This is the most powerful field. The AI reads your actual writing to learn your vocabulary, sentence rhythm, and how you describe properties. Separate multiple remarks with ---
          </span>
        </div>

        {/* Avoid / Prefer row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Never say</label>
            <input
              value={wordsToAvoid}
              onChange={e => { setWordsToAvoid(e.target.value); setSaved(false) }}
              placeholder="nestled, boasts, turnkey"
              style={inputStyle}
            />
            <span style={hintStyle}>Comma-separated</span>
          </div>
          <div>
            <label style={labelStyle}>Your go-to phrases</label>
            <input
              value={signaturePhrases}
              onChange={e => { setSignaturePhrases(e.target.value); setSaved(false) }}
              placeholder="move-in ready, sun-drenched"
              style={inputStyle}
            />
            <span style={hintStyle}>Comma-separated</span>
          </div>
        </div>

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
          {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save</>}
        </button>
      </div>
    </div>
  )
}
