'use client'
import { useState } from 'react'

interface FormState {
  name: string
  email: string
  message: string
  status: 'idle' | 'loading' | 'success' | 'error'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#0F1117',
  border: '1px solid rgba(79,110,247,0.2)',
  borderRadius: '8px',
  color: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

export function ContactSection() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '', status: 'idle' })

  const set = (field: keyof Omit<FormState, 'status'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(s => ({ ...s, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForm(s => ({ ...s, status: 'loading' }))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      })
      if (res.ok) {
        setForm(s => ({ ...s, status: 'success' }))
      } else {
        setForm(s => ({ ...s, status: 'error' }))
      }
    } catch {
      setForm(s => ({ ...s, status: 'error' }))
    }
  }

  return (
    <section id="contact" style={{ padding: '100px 24px 60px', background: '#0F1117' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            Get in touch
          </h2>
          <p style={{ fontSize: '15px', color: '#8B95A9', lineHeight: 1.6 }}>
            Questions about Agent OS, custom builds, or pricing —{' '}
            <a
              href="mailto:ai@montero.cool"
              style={{ color: '#4F6EF7', textDecoration: 'none' }}
            >
              ai@montero.cool
            </a>
          </p>
        </div>

        {/* Form */}
        {form.status === 'success' ? (
          <div style={{
            padding: '32px',
            background: 'rgba(74,222,128,0.06)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '15px', color: '#4ADE80' }}>
              Message sent. We'll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={set('name')}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.2)')}
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={set('email')}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.2)')}
            />
            <textarea
              required
              placeholder="Message"
              rows={5}
              value={form.message}
              onChange={set('message')}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(79,110,247,0.2)')}
            />
            {form.status === 'error' && (
              <p style={{ fontSize: '13px', color: '#F87171', textAlign: 'center' }}>
                Something went wrong. Please try again or email us directly.
              </p>
            )}
            <button
              type="submit"
              disabled={form.status === 'loading'}
              style={{
                padding: '14px', fontSize: '15px', fontWeight: 600,
                background: '#4F6EF7', color: '#FFFFFF', border: 'none',
                borderRadius: '8px', cursor: form.status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: form.status === 'loading' ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {form.status === 'loading' ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={{
          fontSize: '12px', color: '#4B5563', textAlign: 'center',
          marginTop: '60px', letterSpacing: '0.03em',
        }}>
          &copy; 2025 montero.cool &middot; Made in Greenwich
        </p>
      </div>
    </section>
  )
}
