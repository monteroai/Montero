'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const navy = '#1B2B5E'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [brokerage, setBrokerage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, brokerage: brokerage || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
            <img src="/logo.png" alt="MONTERO" width={36} height={36} style={{ mixBlendMode: 'multiply', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', fontWeight: 600, color: navy, letterSpacing: '0.06em' }}>MONTERO</span>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '8px' }}>Check your email</h1>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              We sent a confirmation link to <strong style={{ color: '#1e293b' }}>{email}</strong>. Click the link to activate your account and start using MONTERO.
            </p>
            <Link href="/login" style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              color: '#2563eb', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
              textDecoration: 'none',
            }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <img src="/logo.png" alt="MONTERO" width={36} height={36} style={{ mixBlendMode: 'multiply', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', fontWeight: 600, color: navy, letterSpacing: '0.06em' }}>MONTERO</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Get instant access to AI staging, remarks, and more.</p>

          <form onSubmit={handleSignup}>
            <Field label="Full Name" required>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
            </Field>

            <Field label="Email" required>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} />
            </Field>

            <Field label="Password" required>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} />
            </Field>

            <Field label="Confirm Password" required>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Retype your password" style={inputStyle} />
            </Field>

            <Field label="Brokerage">
              <input type="text" value={brokerage} onChange={e => setBrokerage(e.target.value)} placeholder="William Raveis (optional)" style={inputStyle} />
            </Field>

            {error && (
              <p style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: `linear-gradient(135deg, ${navy}, #2563eb)`,
                color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(37,99,235,0.2)', transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Features callout */}
        <div style={{
          background: 'rgba(255,255,255,0.7)', borderRadius: '14px', padding: '18px 22px',
          marginTop: '16px', border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: navy, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            What you get
          </p>
          {[
            'AI Virtual Staging — stage empty rooms in seconds',
            'MLS Remarks — professional copy from photos',
            'Content Pack — Instagram, email, SMS ready to post',
            'Listing Workspace — everything organized by address',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: '13px', color: '#374151' }}>{f}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px',
  padding: '10px 14px', fontSize: '14px', color: '#1e293b',
  outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
    </div>
  )
}
