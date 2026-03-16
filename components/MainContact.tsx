'use client'

import { useState } from 'react'

export function MainContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

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
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <section id="contact" data-circuit-zone="5" style={{ padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px' }}>
            Get in touch
          </p>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, marginBottom: '12px' }}>
            Start a conversation.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <a href="mailto:ai@montero.cool" style={{ color: 'var(--gold)' }}>ai@montero.cool</a>
            {' · '}
            <a href="tel:+14759771707" style={{ color: 'var(--text-dim)' }}>+1 (475) 977-1707</a>
          </p>
        </div>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '36px', background: 'var(--bg-raised)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 'var(--radius)' }}>
            <p style={{ color: '#4ade80', fontSize: '15px', fontWeight: 500 }}>Message sent. We'll be in touch.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Your name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={input} required />
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={input} required />
            <textarea placeholder="What are you working on?" value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={4} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} required />
            {status === 'error' && (
              <p style={{ fontSize: '13px', color: '#f87171' }}>Something went wrong. Try ai@montero.cool directly.</p>
            )}
            <button type="submit" disabled={status === 'sending'} style={{
              padding: '13px', background: 'var(--gold)', color: 'var(--bg)', border: 'none',
              borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 700,
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              opacity: status === 'sending' ? 0.6 : 1,
              fontFamily: 'var(--font-inter), Inter, sans-serif',
            }}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} MONTERO · ai@montero.cool
        </p>
      </div>
    </section>
  )
}
