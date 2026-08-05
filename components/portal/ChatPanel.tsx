'use client'

import { useState, useRef, useEffect } from 'react'
import { colors, voiceLabel } from '@/lib/portal/styles'
import { useChat, type ChatMessage } from '@/lib/portal/ChatContext'
import { useBusiness } from '@/lib/portal/BusinessContext'

// The one chat UI, used by both the Assistant tab (variant "page") and the
// cross-tab right rail (variant "rail"). Assistant replies type out once;
// suggestion chips tuck away after first use (lightbulb recalls them).

const typedIds = new Set<string>() // survives view switches within the session

const STARTERS = [
  'What automations are running for me right now?',
  'Did anything need my attention today?',
  "Who hasn't been replied to?",
]

function TypeOut({ msg }: { msg: ChatMessage }) {
  const shouldType = !msg.noType && !typedIds.has(msg.id) && msg.role === 'assistant'
  const [shown, setShown] = useState(shouldType ? '' : msg.content)

  useEffect(() => {
    if (!shouldType) return
    typedIds.add(msg.id)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(msg.content); return }
    let i = 0
    let alive = true
    function tick() {
      if (!alive) return
      i += 1 + ((Math.random() * 2) | 0)
      if (i >= msg.content.length) { setShown(msg.content); return }
      setShown(msg.content.slice(0, i))
      setTimeout(tick, 16)
    }
    const t = setTimeout(tick, 250)
    return () => { alive = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg.id])

  const typing = shown !== msg.content
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {shown}
      {typing && <span className="mchat-caret" />}
    </span>
  )
}

export function ChatPanel({ variant }: { variant: 'page' | 'rail' }) {
  const { messages, loading, send, escalate, escalated } = useChat()
  const { activeBusiness } = useBusiness()
  const [input, setInput] = useState('')
  const [chipsHidden, setChipsHidden] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  })

  function submit(text?: string) {
    const q = (text ?? input).trim()
    if (!q) return
    setInput('')
    setChipsHidden(true)
    send(q)
  }

  const showChips = !chipsHidden && messages.length <= 1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0,
      flex: 1, width: '100%',
      // Both variants get a FIXED frame — the thread scrolls internally and the
      // panel never stretches with page content. Without this the rail grew to
      // match whatever the tab rendered (long storyboard lists especially).
      ...(variant === 'page'
        ? { maxWidth: '640px', margin: '0 auto', height: 'min(640px, 74vh)' }
        : { height: 'min(620px, 72vh)', flex: '0 0 auto' }),
    }}>
      <style>{`
        .mchat-thread { scrollbar-width: thin; scrollbar-color: rgba(23,32,64,.22) transparent; }
        .mchat-thread::-webkit-scrollbar { width: 6px; }
        .mchat-thread::-webkit-scrollbar-track { background: transparent; }
        .mchat-thread::-webkit-scrollbar-thumb { background: rgba(23,32,64,.18); border-radius: 999px; }
        .mchat-thread::-webkit-scrollbar-thumb:hover { background: rgba(23,32,64,.3); }
        .mchat-caret { display: inline-block; width: 7px; height: 13px; background: rgba(37,99,235,.6); margin-left: 2px; vertical-align: -2px; animation: mchatBlink .8s step-end infinite; }
        @keyframes mchatBlink { 50% { opacity: 0; } }
        .mchat-dots i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; margin-right: 4px; animation: mchatDot 1s infinite; }
        .mchat-dots i:nth-child(2) { animation-delay: .15s; } .mchat-dots i:nth-child(3) { animation-delay: .3s; }
        @keyframes mchatDot { 0%, 80%, 100% { opacity: .25 } 40% { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .mchat-caret, .mchat-dots i { animation: none; } }
      `}</style>

      {variant === 'page' && (
        <div style={{ textAlign: 'center', margin: '4px 0 2px' }}>
          <span style={{ fontWeight: 200, letterSpacing: '.34em', textTransform: 'uppercase', fontSize: '19px', color: '#16203a' }}>MONTERO</span>
          {activeBusiness && (
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', ...voiceLabel }}>{activeBusiness.business_name}</div>
          )}
        </div>
      )}

      <div ref={scrollRef} className="mchat-thread" style={{ flex: 1, minHeight: '60px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '11px', padding: '4px 2px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%', padding: '11px 15px', borderRadius: '17px', fontSize: '13px', lineHeight: 1.55,
              ...(m.role === 'user'
                ? { background: colors.blue, color: '#fff', borderBottomRightRadius: '6px', boxShadow: '0 10px 26px rgba(37,99,235,.28)' }
                : {
                    background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.82)', color: colors.textDark,
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottomLeftRadius: '6px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.85), 0 10px 26px rgba(23,32,64,.1)',
                  }),
            }}>
              {m.role === 'assistant' ? <TypeOut msg={m} /> : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '11px 15px', borderRadius: '17px', background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.82)' }}>
              <span className="mchat-dots"><i /><i /><i /></span>
            </div>
          </div>
        )}
      </div>

      {showChips && (
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: variant === 'page' ? 'center' : 'flex-start' }}>
          {STARTERS.map(sButton => (
            <button
              key={sButton}
              onClick={() => submit(sButton)}
              style={{
                background: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.72)',
                backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                borderRadius: '999px', padding: '8px 14px', fontSize: '12px', color: colors.textDark, cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px rgba(23,32,64,.1)',
                fontFamily: 'inherit',
              }}
            >
              {sButton}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.68)',
        backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)',
        borderRadius: '999px', padding: '6px 8px 6px 16px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8), 0 14px 34px rgba(23,32,64,.12)',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></svg>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Ask anything about your business"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: colors.textDark, fontFamily: 'inherit' }}
        />
        <button
          onClick={() => setChipsHidden(prev => !prev)}
          title="Suggestions"
          style={{ flexShrink: 0, background: 'rgba(120,120,128,.1)', border: 0, borderRadius: '999px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textMuted }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" /></svg>
        </button>
        <button
          onClick={() => submit()}
          aria-label="Send"
          style={{ flexShrink: 0, background: colors.blue, border: 0, borderRadius: '999px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 6px 16px rgba(37,99,235,.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14 0M13 6l6 6-6 6" /></svg>
        </button>
      </div>

      {!escalated && messages.some(m => m.role === 'user') && (
        <button
          onClick={escalate}
          style={{ alignSelf: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: colors.textMuted, textDecoration: 'underline', fontFamily: 'inherit', padding: '0 0 2px' }}
        >
          Talk to Emilio — send this conversation to a human
        </button>
      )}
    </div>
  )
}
