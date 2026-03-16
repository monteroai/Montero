'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const navy = '#1B2B5E'

function ResetForm() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') // 'update' = set new password

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // Success states
  if (success && mode !== 'update') {
    return (
      <Shell>
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '8px' }}>Check your email</h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
            If an account exists for <strong style={{ color: '#1e293b' }}>{email}</strong>, we sent a password reset link.
          </p>
          <Link href="/login" style={{ fontSize: '14px', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
        </div>
      </Shell>
    )
  }

  if (success && mode === 'update') {
    return (
      <Shell>
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '8px' }}>Password updated</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Your password has been changed successfully.</p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            background: `linear-gradient(135deg, ${navy}, #2563eb)`, color: '#ffffff', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
          }}>Sign In</Link>
        </div>
      </Shell>
    )
  }

  // Update password form (after clicking reset link)
  if (mode === 'update') {
    return (
      <Shell>
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Set new password</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Enter your new password below.</p>

          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>New Password</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Retype your password"
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: `linear-gradient(135deg, ${navy}, #2563eb)`, color: '#ffffff',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </Shell>
    )
  }

  // Request reset form
  return (
    <Shell>
      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Reset your password</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={handleRequestReset}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
            />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: `linear-gradient(135deg, ${navy}, #2563eb)`, color: '#ffffff',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
          }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
        <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <img src="/logo.png" alt="MONTERO" width={36} height={36} style={{ mixBlendMode: 'multiply', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', fontWeight: 600, color: navy, letterSpacing: '0.06em' }}>MONTERO</span>
        </div>
        {children}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
