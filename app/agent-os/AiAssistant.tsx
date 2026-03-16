'use client'

import { useState, useRef, useEffect } from 'react'

const navy = '#1B2B5E'
const blue = '#2563eb'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I\'m your listing assistant. Ask me anything about your properties, market data, or what to work on next.' },
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    // For now: simple local responses. Will connect to API later.
    setTimeout(() => {
      const lower = q.toLowerCase()
      let reply = 'I can help with that! This feature will be connected to AI shortly. For now, use the workspace sections to generate remarks, content, and more.'

      if (lower.includes('remark')) {
        reply = 'To generate MLS remarks, scroll to the Remarks section in your listing workspace and click "Generate MLS Remarks". You\'ll enter property details and get professional copy back in seconds.'
      } else if (lower.includes('content') || lower.includes('instagram') || lower.includes('social')) {
        reply = 'Your Content Pack generates Instagram captions, email subject lines, and SMS templates from your listing details. Click "Generate Content Pack" in the Content section.'
      } else if (lower.includes('photo') || lower.includes('stage') || lower.includes('staging')) {
        reply = 'Upload listing photos in the Photos section. You can virtually stage empty rooms and get AI-analyzed property features for your remarks.'
      } else if (lower.includes('letter') || lower.includes('intro')) {
        reply = 'The Intro Letter section helps you draft a personalized letter to the seller. Click "Write Intro Letter" to get started with a professional template.'
      } else if (lower.includes('status') || lower.includes('active') || lower.includes('lost') || lower.includes('won')) {
        reply = 'Click the status badge next to your listing name to change it between Active, Prospecting, Won, or Lost. This helps you track where each deal stands.'
      } else if (lower.includes('new listing') || lower.includes('add listing')) {
        reply = 'Click "+ New Listing" in the left sidebar to add a property. You\'ll enter the address, price, seller name, and status.'
      } else if (lower.includes('what') && (lower.includes('next') || lower.includes('should'))) {
        reply = 'Check the "Recommended" bar at the top of your listing workspace — it shows the next step to complete your listing package. Work through Remarks → Content → Intro Letter → Photos → Intel.'
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = 'Hey! What listing are you working on? I can help you generate remarks, draft letters, or figure out your next steps.'
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setLoading(false)
    }, 600)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
            width: '52px', height: '52px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${navy}, ${blue})`,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
          width: '360px', maxHeight: '500px',
          background: '#ffffff', borderRadius: '20px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid #e2e8f0',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px',
            background: `linear-gradient(135deg, ${navy}, ${blue})`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Listing Assistant</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
                width: '28px', height: '28px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto', padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: '10px',
              minHeight: '260px', maxHeight: '360px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px', borderRadius: '14px',
                  fontSize: '13px', lineHeight: 1.5,
                  background: m.role === 'user'
                    ? `linear-gradient(135deg, ${navy}, ${blue})`
                    : '#f1f5f9',
                  color: m.role === 'user' ? '#ffffff' : '#1e293b',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '14px',
                background: '#f1f5f9', fontSize: '13px', color: '#94a3b8',
              }}>
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: '8px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about your listing..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b',
                background: '#f8fafc',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: input.trim() ? `linear-gradient(135deg, ${navy}, ${blue})` : '#e2e8f0',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#ffffff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
