'use client'
import { useState } from 'react'

type Plan = 'free' | 'pro' | 'team'

interface WaitlistState {
  open: boolean
  email: string
  status: 'idle' | 'loading' | 'success' | 'error'
}

function WaitlistForm({ plan }: { plan: Plan }) {
  const [state, setState] = useState<WaitlistState>({ open: false, email: '', status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState(s => ({ ...s, status: 'loading' }))
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, plan }),
      })
      if (res.ok) {
        setState(s => ({ ...s, status: 'success' }))
      } else {
        setState(s => ({ ...s, status: 'error' }))
      }
    } catch {
      setState(s => ({ ...s, status: 'error' }))
    }
  }

  if (state.status === 'success') {
    return (
      <p style={{ fontSize: '13px', color: '#4ADE80', textAlign: 'center', marginTop: '12px' }}>
        You're on the list.
      </p>
    )
  }

  if (!state.open) {
    return (
      <button
        onClick={() => setState(s => ({ ...s, open: true }))}
        style={{
          width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600,
          background: '#4F6EF7', color: '#FFFFFF', border: 'none',
          borderRadius: '8px', cursor: 'pointer', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Join waitlist
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={state.email}
        onChange={e => setState(s => ({ ...s, email: e.target.value }))}
        style={{
          padding: '10px 12px', fontSize: '14px',
          background: '#0F1117', border: '1px solid rgba(79,110,247,0.3)',
          borderRadius: '8px', color: '#FFFFFF', outline: 'none', width: '100%',
        }}
      />
      <button
        type="submit"
        disabled={state.status === 'loading'}
        style={{
          padding: '10px', fontSize: '14px', fontWeight: 600,
          background: '#4F6EF7', color: '#FFFFFF', border: 'none',
          borderRadius: '8px', cursor: 'pointer', opacity: state.status === 'loading' ? 0.6 : 1,
        }}
      >
        {state.status === 'loading' ? 'Saving...' : 'Notify me'}
      </button>
      {state.status === 'error' && (
        <p style={{ fontSize: '12px', color: '#F87171', textAlign: 'center' }}>
          Something went wrong. Try again.
        </p>
      )}
    </form>
  )
}

const freeFeatures = [
  '3 AI generations / month',
  'MLS remarks + social captions',
  '1 listing presentation / month',
]

const proFeatures = [
  '60 AI generations / month',
  'MLS remarks + social captions',
  'Email content',
  'Unlimited listing presentations',
  'Priority support',
]

const teamFeatures = [
  '5 agents included',
  '300 AI generations / month',
  'All Pro features',
  'Team DNA profiles',
  'Dedicated onboarding',
]

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="#4F6EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: '100px 24px', background: '#0F1117' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#4F6EF7',
            background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
            borderRadius: '100px', padding: '4px 12px', marginBottom: '20px',
          }}>
            Agent OS
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            Start free. Scale when it pays for itself.
          </h2>
          <p style={{ fontSize: '16px', color: '#8B95A9', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Every plan includes MLS remarks, social captions, and the seller presentation builder.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Free */}
          <div style={{
            background: '#161B27',
            border: '1px solid rgba(79,110,247,0.15)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#8B95A9', marginBottom: '8px' }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: '14px', color: '#8B95A9' }}>/month</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {freeFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#8B95A9' }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <WaitlistForm plan="free" />
          </div>

          {/* Pro — emphasized */}
          <div style={{
            background: '#161B27',
            border: '1px solid rgba(79,110,247,0.5)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 0 30px rgba(79,110,247,0.12)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#4F6EF7', background: '#0F1117', border: '1px solid rgba(79,110,247,0.4)',
              borderRadius: '100px', padding: '4px 12px', whiteSpace: 'nowrap',
            }}>
              Most popular
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#4F6EF7', marginBottom: '8px' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>$69</span>
                <span style={{ fontSize: '14px', color: '#8B95A9' }}>/month</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {proFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#8B95A9' }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <WaitlistForm plan="pro" />
          </div>

          {/* Team */}
          <div style={{
            background: '#161B27',
            border: '1px solid rgba(79,110,247,0.15)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#8B95A9', marginBottom: '8px' }}>Team</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>$179</span>
                <span style={{ fontSize: '14px', color: '#8B95A9' }}>/month</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {teamFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#8B95A9' }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              style={{
                display: 'block', width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600,
                background: 'transparent', color: '#4F6EF7',
                border: '1px solid rgba(79,110,247,0.4)',
                borderRadius: '8px', textDecoration: 'none', textAlign: 'center',
                transition: 'all 0.2s', boxSizing: 'border-box',
              }}
            >
              Contact us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
