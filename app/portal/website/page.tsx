'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { card, colors, gradientButton, secondaryButton, inputStyle, themeGradient } from '@/lib/portal/styles'
import { ChangeRequestCard } from '@/components/portal/ChangeRequestCard'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { WEBSITE_SECTIONS } from '@/lib/portal/constants'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { isManagedSite } from '@/lib/portal/managedSites'
import type { PortalWebsiteContent, PortalChangeRequest } from '@/lib/portal/types'

// Site Studio — bolt.new-style website editing. Chat on the left makes
// text-only changes (anything bigger is auto-routed to the Montero team);
// the live site is visible on the right.

type ChatMsg = { role: 'user' | 'assistant'; content: string; meta?: string }
type Usage = { used: number; limit: number; exempt: boolean }

const WELCOME: ChatMsg = {
  role: 'assistant',
  content:
    "Hi — I'm your website editor. Tell me what to change in plain English: \"make the headline punchier\", \"we're now open Saturdays\", \"fix the typo in the about section\". Text changes I make right away; photos, colors, or layout I send to the Montero team for you.",
}

const WELCOME_EXTERNAL: ChatMsg = {
  role: 'assistant',
  content:
    "Hi — I'm your website assistant. Your site is hosted on an external platform, so I don't change it directly — instead, describe any change you want (\"update our hours\", \"swap the headline\", \"new photo on the homepage\") and I'll send exactly what you need to the Montero team, who apply it on your site, usually within a business day.",
}

export default function WebsitePage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [sections, setSections] = useState<PortalWebsiteContent[]>([])
  const [changeRequests, setChangeRequests] = useState<PortalChangeRequest[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [rightTab, setRightTab] = useState<'preview' | 'content'>('preview')
  const [frameKey, setFrameKey] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    if (!activeBusinessId) {
      setSections([]); setChangeRequests([]); setUsage(null)
      return
    }
    fetch(`/api/portal/website?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => {
        setSections(d.sections || [])
        setChangeRequests(d.change_requests || [])
      })
      .catch(() => {})
    fetch(`/api/portal/website/ai?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => { if (d.usage) setUsage(d.usage) })
      .catch(() => {})
  }, [activeBusinessId])

  const managed = isManagedSite(activeBusiness?.website_url)

  useEffect(() => {
    load()
    setMessages([managed ? WELCOME : WELCOME_EXTERNAL])
  }, [load, managed])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function send() {
    const text = input.trim()
    if (!text || sending || !activeBusinessId) return
    const nextMessages: ChatMsg[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/portal/website/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: activeBusinessId,
          // WELCOME is UI-only — don't send it as model history
          messages: nextMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setMessages(m => [...m, { role: 'assistant', content: d.error || 'Something went wrong — try again.' }])
        return
      }
      const meta: string[] = []
      if (d.updates?.length) meta.push(`✦ Updated: ${d.updates.map((u: { section: string }) => u.section).join(', ')}`)
      if (d.published?.ok) meta.push('⚡ Published to your live site')
      else if (d.updates?.length) meta.push('→ Our team syncs it to your live site shortly')
      if (d.escalated) meta.push('→ Sent to the Montero team')
      setMessages(m => [...m, { role: 'assistant', content: d.reply, meta: meta.join('  ·  ') || undefined }])
      if (d.usage) setUsage(d.usage)
      if (d.updates?.length) load()
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection hiccup — try that again.' }])
    } finally {
      setSending(false)
    }
  }

  function getContent(sectionName: string): string {
    const s = sections.find(s => s.section === sectionName)
    return s ? ((s.content.text as string) || '') : ''
  }

  if (!activeBusinessId) {
    return (
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Website</h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>Add a business first.</p>
      </div>
    )
  }

  const siteUrl = activeBusiness?.website_url || null

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
            Website {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>· {activeBusiness.business_name}</span>}
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            {managed
              ? 'Chat to edit your site — text changes publish straight to your live website.'
              : 'Your site is hosted on an outside platform, so it appears here view-only. Ask the assistant for any changes.'}
          </p>
        </div>
        {usage && (
          <div style={{ ...card, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span aria-hidden style={{ background: themeGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '13px' }}>✦</span>
            {usage.exempt ? (
              <span style={{ fontSize: '12px', color: colors.textMuted }}>AI edits: <strong style={{ color: colors.success }}>Unlimited</strong></span>
            ) : (
              <span style={{ fontSize: '12px', color: colors.textMuted }}>AI edits this month: <strong style={{ color: colors.textDark }}>{usage.used} / {usage.limit}</strong></span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* ── Chat panel (sealed for externally hosted sites) ── */}
        <div style={{ ...card, flex: '1 1 340px', minWidth: '300px', display: 'flex', flexDirection: 'column', height: '72vh', minHeight: '480px', overflow: 'hidden' }}>
          {!managed ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', gap: '12px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: colors.inputBg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                🔒
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: colors.textDark }}>Editing isn&apos;t available for this site</div>
              <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
                This website is hosted on an outside platform that Montero doesn&apos;t manage, so changes can&apos;t be made from here.
                Need something updated? Use the <strong>Talk to Emilio</strong> button in the assistant and our team will handle it.
              </p>
              <p style={{ fontSize: '11.5px', color: colors.textLight, lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
                Move your site to Montero hosting and instant AI editing unlocks here.
              </p>
            </div>
          ) : (
          <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? themeGradient : '#f1f5f9',
                  color: m.role === 'user' ? '#fff' : colors.textDark,
                  fontSize: '13.5px',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                  {m.meta && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '11.5px', color: m.role === 'user' ? 'rgba(255,255,255,0.85)' : colors.textMuted, fontWeight: 600 }}>
                      {m.meta}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#f1f5f9', color: colors.textMuted, fontSize: '13.5px' }}>
                  Working on it…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '8px' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={1}
              placeholder='e.g. "change the headline to…" or "add our new phone number"'
              style={{ ...inputStyle, resize: 'none', flex: 1 }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              style={{ ...gradientButton, padding: '10px 18px', fontSize: '13px', opacity: sending || !input.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
            >
              Send
            </button>
          </div>
          </>
          )}
        </div>

        {/* ── Right panel: live preview / content ── */}
        <div style={{ ...card, flex: '1.4 1 420px', minWidth: '320px', display: 'flex', flexDirection: 'column', height: '72vh', minHeight: '480px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setRightTab('preview')}
              style={{ ...(rightTab === 'preview' ? gradientButton : secondaryButton), padding: '6px 14px', fontSize: '12px' }}
            >
              Live site
            </button>
            <button
              onClick={() => setRightTab('content')}
              style={{ ...(rightTab === 'content' ? gradientButton : secondaryButton), padding: '6px 14px', fontSize: '12px' }}
            >
              Content & history
            </button>
            {rightTab === 'preview' && siteUrl && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: colors.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }} className="hide-on-mobile">{siteUrl.replace(/^https?:\/\//, '')}</span>
                <button onClick={() => setFrameKey(k => k + 1)} style={{ ...secondaryButton, padding: '6px 10px', fontSize: '12px' }} title="Refresh preview">↻</button>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ ...secondaryButton, padding: '6px 10px', fontSize: '12px', textDecoration: 'none' }} title="Open in new tab">↗</a>
              </div>
            )}
          </div>

          {rightTab === 'preview' ? (
            siteUrl ? (
              <iframe
                key={frameKey}
                src={siteUrl}
                title="Live website preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
                style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: colors.textMuted, maxWidth: '340px' }}>
                  Your live site isn&apos;t linked yet. Once the Montero team connects it, you&apos;ll see it here — chat edits work either way.
                </p>
              </div>
            )
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '11.5px', color: colors.textLight, margin: '0 2px 2px' }}>
                Text changes made in chat show here immediately and appear on your live site after our team syncs it (usually same day).
              </p>
              {WEBSITE_SECTIONS.map(sectionName => {
                const content = getContent(sectionName)
                const pending = changeRequests.some(cr => cr.section === sectionName && cr.status === 'pending')
                return (
                  <div key={sectionName} style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark, textTransform: 'capitalize' }}>{sectionName}</span>
                      {pending ? <StatusBadge status="pending" label="Changes Pending" /> : <StatusBadge status="live" />}
                    </div>
                    <div style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {content || <em>No content yet — ask the chat to write it.</em>}
                    </div>
                  </div>
                )
              })}
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: colors.textDark, margin: '8px 2px 0' }}>Change History</h2>
              {changeRequests.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: colors.textMuted, margin: '0 2px' }}>No changes yet.</p>
              ) : (
                changeRequests.map(cr => <ChangeRequestCard key={cr.id} cr={cr} />)
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
