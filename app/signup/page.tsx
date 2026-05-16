'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const navy = '#1B2B5E'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company: company || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Email confirmation is disabled in Supabase Auth settings, so the user has a
    // session immediately. Send them to the portal — the layout there auto-creates
    // a portal_clients row and redirects to "add your first business" if needed.
    if (data.session) {
      router.replace('/portal')
    } else {
      // Fallback: in case confirm-email gets re-enabled later, send to login.
      router.replace('/login?signup=success')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <img src="/logo.png" alt="MONTERO" width={36} height={36} style={{ mixBlendMode: 'multiply', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', fontWeight: 600, color: navy, letterSpacing: '0.06em' }}>MONTERO</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Sign in to your Montero client portal.</p>

          <form onSubmit={handleSignup}>
            <Field label="Full Name" required>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
            </Field>

            <Field label="Email" required>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} />
            </Field>

            <Field label="Password" required>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <EyeToggle visible={showPassword} onClick={() => setShowPassword(s => !s)} />
              </div>
            </Field>

            <Field label="Confirm Password" required>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Retype your password"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
              </div>
            </Field>

            <Field label="Company">
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc. (optional)" style={inputStyle} />
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

function EyeToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? 'Hide password' : 'Show password'}
      tabIndex={-1}
      style={{
        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: '#94a3b8',
      }}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  )
}
