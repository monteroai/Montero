'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { useBusiness } from './BusinessContext'

// One assistant conversation PER BUSINESS, shared between the Assistant tab
// and the right-hand rail so the thread follows the user across tabs.
// Server-side scoping happens in /api/portal/chat — this is UI state only.

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  // history loaded from the server renders instantly — no re-typing old replies
  noType?: boolean
}

interface ChatContextValue {
  messages: ChatMessage[]
  loading: boolean
  send: (text: string) => Promise<void>
  escalate: () => Promise<void>
  escalated: boolean
  railHidden: boolean
  setRailHidden: (v: boolean) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

function greetingFor(businessName?: string | null): string {
  return businessName
    ? `Hi — I'm your Montero assistant for ${businessName}. I can see your automations, activity, and anything that needs attention. Ask me anything.`
    : "Hi — I'm your Montero assistant. Once you add your first business, I'll be able to see what's running and what needs attention."
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { activeBusiness, activeBusinessId } = useBusiness()
  const bizKey = activeBusinessId || 'none'

  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [escalatedMap, setEscalatedMap] = useState<Record<string, boolean>>({})
  const [railHidden, setRailHidden] = useState(false)
  const historyFetched = useRef<Set<string>>(new Set())

  // Load the saved thread for the active business once per session.
  useEffect(() => {
    if (!activeBusinessId || historyFetched.current.has(activeBusinessId)) return
    historyFetched.current.add(activeBusinessId)
    fetch(`/api/portal/chat?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => {
        const saved = (Array.isArray(d.messages) ? d.messages : []) as Array<{ role: 'user' | 'assistant'; content: string }>
        if (saved.length === 0) return
        setThreads(prev => {
          if (prev[activeBusinessId]?.length) return prev // don't clobber an in-progress chat
          return {
            ...prev,
            [activeBusinessId]: saved.map((m, i) => ({
              id: `${activeBusinessId}-h${i}`, role: m.role, content: m.content, noType: true,
            })),
          }
        })
      })
      .catch(() => {})
  }, [activeBusinessId])

  const messages = threads[bizKey] || [
    { id: `${bizKey}-greet`, role: 'assistant' as const, content: greetingFor(activeBusiness?.business_name) },
  ]
  const loading = Boolean(loadingMap[bizKey])
  const escalated = Boolean(escalatedMap[bizKey])

  const append = useCallback((key: string, base: ChatMessage[], msg: ChatMessage) => {
    setThreads(prev => ({ ...prev, [key]: [...(prev[key] || base), msg] }))
  }, [])

  const send = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    const key = bizKey
    const base = messages
    const userMsg: ChatMessage = { id: `${key}-${Date.now()}-u`, role: 'user', content: q }
    const next = [...base, userMsg]
    setThreads(prev => ({ ...prev, [key]: next }))
    setLoadingMap(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          active_business_id: activeBusinessId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      append(key, next, { id: `${key}-${Date.now()}-a`, role: 'assistant', content: data.reply || '(empty reply)' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      append(key, next, {
        id: `${key}-${Date.now()}-e`, role: 'assistant',
        content: `Sorry — I couldn't reach the assistant just now. (${msg}) Try again in a moment, or email ai@montero.cool if it keeps failing.`,
      })
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }))
    }
  }, [bizKey, messages, loading, activeBusinessId, append])

  const escalate = useCallback(async () => {
    if (escalated) return
    const key = bizKey
    const base = messages
    try {
      const res = await fetch('/api/portal/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: base.map(m => ({ role: m.role, content: m.content })),
          active_business_id: activeBusinessId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        append(key, base, { id: `${key}-${Date.now()}-e`, role: 'assistant', content: `Couldn't send your message to Emilio just now (${data.error || res.status}). Try again, or email ai@montero.cool directly.` })
      } else {
        setEscalatedMap(prev => ({ ...prev, [key]: true }))
        append(key, base, { id: `${key}-${Date.now()}-a`, role: 'assistant', content: "Got it — Emilio's been notified with the conversation so far. He'll reach out via email. In the meantime feel free to keep chatting here." })
      }
    } catch {
      append(key, base, { id: `${key}-${Date.now()}-e`, role: 'assistant', content: "Couldn't reach the server. Try again in a moment, or email ai@montero.cool directly." })
    }
  }, [bizKey, messages, escalated, activeBusinessId, append])

  return (
    <ChatContext.Provider value={{ messages, loading, send, escalate, escalated, railHidden, setRailHidden }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  return ctx
}
