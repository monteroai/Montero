'use client'

import { useState } from 'react'

export function MainContact() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [status, setStatus]   = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: '14px',
    background: '#111111', border: '1px solid rgba(255,166,0,0.15)',
    borderRadius: '10px', color: '#FFFFFF', outline: 'none',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    boxSizing: 'border-box',
  }

  return (
    <section id="contact" style={{ padding: '100px 24px 80px', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffa600', marginBottom: '16px' }}>
            Get in touch
          </div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
            Start a conversation.
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '16px' }}>
            Whether you have a specific problem or just want to see what automation could look like for your business —{' '}
            <a href="mailto:ai@montero.cool" style={{ color: '#ffa600', textDecoration: 'none' }}>ai@montero.cool</a>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <a href="tel:+14759771707" style={{ fontSize: '13px', color: 'rgba(255,166,0,0.7)', textDecoration: 'none' }}>
              +1 (475) 977-1707
            </a>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.30)' }}>Greenwich, CT</span>
          </div>
        </div>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#0e0e0e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px' }}>
            <p style={{ color: '#4ade80', fontSize: '15px', fontWeight: 500 }}>Message sent. We will be in touch.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="text" placeholder="Your name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={input} required />
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={input} required />
            <textarea placeholder="What are you working on?" value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={5} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} required />

            {status === 'error' && (
              <p style={{ fontSize: '13px', color: '#f87171' }}>Something went wrong. Try ai@montero.cool directly.</p>
            )}

            <button type="submit" disabled={status === 'sending'} style={{
              padding: '14px', background: '#ffa600', color: '#0a0a0a',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              opacity: status === 'sending' ? 0.6 : 1,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
            }}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px', color: 'rgba(255,255,255,0.20)' }}>
          © {new Date().getFullYear()} MONTERO · ai@montero.cool
        </p>
      </div>
    </section>
  )
}
