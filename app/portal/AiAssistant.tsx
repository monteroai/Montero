'use client'

import { useState, useRef, useEffect } from 'react'
import { colors, themeGradient } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'What automations are running for me right now?',
  'Did anything need my attention today?',
  'How do I add a new phone number to forward calls from?',
]

export default function AiAssistant() {
  const { activeBusiness, activeBusinessId } = useBusiness()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const greeting = activeBusiness
    ? `Hi — I'm your Montero assistant. I can see what's happening for ${activeBusiness.business_name}, including your automations, calls, and anything that needs attention. Ask me anything.`
    : "Hi — I'm your Montero assistant. Once you add your first business, I'll be able to see what's running, what's happened recently, and what needs attention."
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: greeting }])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, active_business_id: activeBusinessId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || '(empty reply)' }])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — I couldn't reach the assistant just now. (${msg}) Try again in a moment, or email ai@montero.cool if it keeps failing.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const showStarters = messages.length === 1 && !loading

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Montero assistant"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 200,
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: themeGradient,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(37,99,235,0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 200,
            width: '380px',
            maxHeight: '560px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: themeGradient,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                Montero Assistant
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>
                Knows your automations, calls, and activity
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minHeight: '280px',
              maxHeight: '380px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  fontSize: '13.5px',
                  lineHeight: 1.55,
                  background: m.role === 'user' ? themeGradient : '#f1f5f9',
                  color: m.role === 'user' ? '#fff' : '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: '#f1f5f9',
                  fontSize: '13px',
                  color: '#94a3b8',
                }}
              >
                Thinking…
              </div>
            )}
            {showStarters && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                  Try asking
                </div>
                {STARTER_PROMPTS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      color: colors.textDark,
                      fontFamily: 'inherit',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask about your automations or recent activity…"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                color: '#1e293b',
                background: '#f8fafc',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: input.trim() && !loading ? themeGradient : '#e2e8f0',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
