'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navy = '#1B2B5E'

export default function OnboardingPage() {
  const router = useRouter()
  const [brandVoice, setBrandVoice] = useState('')
  const [neighborhoods, setNeighborhoods] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('agent_dna').insert({
      agent_id: user.id,
      brand_voice: brandVoice || null,
      neighborhoods: neighborhoods ? neighborhoods.split(',').map(s => s.trim()).filter(Boolean) : [],
      price_range: priceRange || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/agent-os')
    router.refresh()
  }

  async function handleSkip() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('agent_dna').insert({
      agent_id: user.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/agent-os')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f8fafc',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>
            Welcome to MONTERO
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
            Set up your agent profile so our AI tools can personalize content for you. You can always update this later in Settings.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Brand Voice</label>
              <input
                value={brandVoice}
                onChange={e => setBrandVoice(e.target.value)}
                placeholder="e.g. Professional and warm, luxury-focused"
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                How should your listing remarks and content sound?
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Neighborhoods</label>
              <input
                value={neighborhoods}
                onChange={e => setNeighborhoods(e.target.value)}
                placeholder="e.g. Upper East Side, Tribeca, SoHo"
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Comma-separated list of areas you specialize in.
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Price Range</label>
              <input
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                placeholder="e.g. $500K - $2M"
                style={inputStyle}
              />
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
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: `linear-gradient(135deg, ${navy}, #2563eb)`,
                color: '#ffffff', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
              }}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>

          <button
            onClick={handleSkip}
            disabled={loading}
            style={{
              width: '100%', padding: '10px', marginTop: '12px',
              background: 'transparent', border: 'none',
              fontSize: '14px', fontWeight: 500, color: '#64748b',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
