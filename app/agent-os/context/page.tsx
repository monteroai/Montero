'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, Send, Users, ExternalLink } from 'lucide-react'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

interface ContextEntry {
  submitted_by_name: string
  submitted_by_email: string
  relationship: string
  created_at: string
  seller_motivation?: string
  timeline?: string
  concerns?: string
  competing_agents?: string
  winning_factors?: string
  additional_notes?: string
  must_haves?: string
  budget?: string
  motivation_level?: string
  dealbreakers?: string
  offer_trigger?: string
}

export default function ContextPage() {
  const [address, setAddress] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [lookupId, setLookupId] = useState('')
  const [entries, setEntries] = useState<ContextEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  const generateLink = useCallback(() => {
    if (!address.trim()) return
    // Create a slug from the address
    const slug = address.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    setGeneratedLink(`${origin}/context/${slug}`)
    setLookupId(slug)
  }, [address])

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedLink])

  const fetchEntries = useCallback(async (id: string) => {
    if (!id) return
    setLoadingEntries(true)
    try {
      const res = await fetch(`/api/context?listing_id=${encodeURIComponent(id)}`)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {
      setEntries([])
    } finally {
      setLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    if (lookupId) fetchEntries(lookupId)
  }, [lookupId, fetchEntries])

  const inputStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${border}`, borderRadius: '10px',
    padding: '10px 14px', fontSize: '14px', color: textDark, outline: 'none',
    boxSizing: 'border-box', background: '#ffffff',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Collaborator Context</h1>
        <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.6 }}>
          Request intel from co-brokers, buyer agents, or anyone with direct knowledge about a listing. Their answers feed directly into your AI-generated content.
        </p>
      </div>

      {/* Generate link section */}
      <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Send size={16} style={{ color: blue }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: textDark }}>Request context for a listing</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Listing address</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateLink()}
            style={inputStyle}
            placeholder="42 Riverside Ave, Cos Cob CT"
          />
        </div>

        <button
          onClick={generateLink}
          disabled={!address.trim()}
          style={{
            width: '100%', padding: '11px', background: !address.trim() ? border : navy,
            color: !address.trim() ? '#94a3b8' : '#ffffff', border: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            cursor: !address.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Generate context link
        </button>

        {generatedLink && (
          <div style={{ marginTop: '16px', padding: '14px', background: inputBg, borderRadius: '10px', border: `1px solid ${border}` }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Share this link — no login required
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                readOnly
                value={generatedLink}
                style={{ ...inputStyle, fontSize: '13px', background: '#ffffff', flex: 1 }}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyLink}
                style={{
                  padding: '10px 16px', background: copied ? '#dcfce7' : '#eff6ff',
                  border: `1px solid ${copied ? '#86efac' : '#bfdbfe'}`,
                  borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 600, color: copied ? '#16a34a' : blue, whiteSpace: 'nowrap',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 500, color: blue,
                }}
              >
                <ExternalLink size={12} /> Preview form
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Submitted context */}
      <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Users size={16} style={{ color: blue }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: textDark }}>Submitted context</span>
          {entries.length > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#16a34a' }}>
              {entries.length} received
            </span>
          )}
        </div>

        {!lookupId && (
          <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
            Generate a context link above to see submissions for that listing.
          </p>
        )}

        {lookupId && loadingEntries && (
          <p style={{ fontSize: '13px', color: textMuted }}>Loading...</p>
        )}

        {lookupId && !loadingEntries && entries.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', background: inputBg, borderRadius: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d1d5db', margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>No context submitted yet for this listing.</p>
          </div>
        )}

        {entries.map((entry, i) => {
          const fields = Object.entries(entry).filter(([k, v]) =>
            v && !['submitted_by_name', 'submitted_by_email', 'relationship', 'created_at', 'listing_id'].includes(k)
          )
          return (
            <div key={i} style={{ padding: '16px', background: inputBg, borderRadius: '10px', border: `1px solid ${border}`, marginBottom: i < entries.length - 1 ? '10px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: textDark }}>{entry.submitted_by_name}</p>
                  <p style={{ fontSize: '12px', color: textMuted }}>
                    {entry.relationship} side · {entry.submitted_by_email || 'No email'}
                  </p>
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C' }} />
              </div>
              {fields.map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p style={{ fontSize: '13px', color: textDark, lineHeight: 1.6 }}>{value as string}</p>
                </div>
              ))}
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
