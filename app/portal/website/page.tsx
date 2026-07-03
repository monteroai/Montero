'use client'

import { useState, useEffect, useCallback } from 'react'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle, themeGradient } from '@/lib/portal/styles'
import { ChangeRequestCard } from '@/components/portal/ChangeRequestCard'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { WEBSITE_SECTIONS } from '@/lib/portal/constants'
import { useBusiness } from '@/lib/portal/BusinessContext'
import type { PortalWebsiteContent, PortalChangeRequest } from '@/lib/portal/types'

type EditMode = { section: string; type: 'manual' | 'ai' } | null
type Proposal = { section: string; text: string; summary: string } | null
type Usage = { used: number; limit: number; exempt: boolean }

export default function WebsitePage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [sections, setSections] = useState<PortalWebsiteContent[]>([])
  const [changeRequests, setChangeRequests] = useState<PortalChangeRequest[]>([])
  const [mode, setMode] = useState<EditMode>(null)
  const [draft, setDraft] = useState('') // manual edit text OR AI instruction
  const [proposal, setProposal] = useState<Proposal>(null)
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [aiError, setAiError] = useState('')
  const [usage, setUsage] = useState<Usage | null>(null)

  const load = useCallback(() => {
    if (!activeBusinessId) {
      setSections([])
      setChangeRequests([])
      setUsage(null)
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

  useEffect(() => { load(); setMode(null); setProposal(null) }, [load])

  function getContent(sectionName: string): string {
    const s = sections.find(s => s.section === sectionName)
    return s ? (s.content.text as string || JSON.stringify(s.content, null, 2)) : ''
  }

  function hasPending(sectionName: string): boolean {
    return changeRequests.some(cr => cr.section === sectionName && cr.status === 'pending')
  }

  function openMode(section: string, type: 'manual' | 'ai') {
    setAiError('')
    setProposal(null)
    setMode({ section, type })
    setDraft(type === 'manual' ? getContent(section) : '')
  }

  function closeMode() {
    setMode(null)
    setDraft('')
    setProposal(null)
    setAiError('')
  }

  async function runAi() {
    if (!activeBusinessId || !mode || !draft.trim()) return
    setBusy(true)
    setAiError('')
    try {
      const res = await fetch('/api/portal/website/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: activeBusinessId, section: mode.section, instruction: draft }),
      })
      const d = await res.json()
      if (!res.ok) { setAiError(d.error || 'Something went wrong.'); return }
      setProposal({ section: mode.section, text: d.proposed.text, summary: d.summary })
      if (d.usage) setUsage(d.usage)
    } catch {
      setAiError('Could not reach the AI editor. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function submitChange(section: string, text: string, source: 'manual' | 'ai') {
    if (!activeBusinessId) return
    setBusy(true)
    setSuccess('')
    const res = await fetch('/api/portal/website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: activeBusinessId, section, new_content: { text, source } }),
    })
    if (res.ok) {
      const d = await res.json()
      setChangeRequests(prev => [d.change_request, ...prev])
      closeMode()
      setSuccess(`Change request submitted for ${section}. It goes live once approved.`)
      setTimeout(() => setSuccess(''), 5000)
    }
    setBusy(false)
  }

  if (!activeBusinessId) {
    return (
      <>
        <div style={{ padding: '8px 4px 0' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>Website</h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>Add a business first.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
            Website {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>· {activeBusiness.business_name}</span>}
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            Edit your website in plain English — describe the change, AI writes it, you approve it, it goes live.
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

      {success && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: colors.successBg, color: colors.success, fontSize: '13px', fontWeight: 500 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {WEBSITE_SECTIONS.map(sectionName => {
            const content = getContent(sectionName)
            const pending = hasPending(sectionName)
            const active = mode?.section === sectionName
            const activeProposal = proposal?.section === sectionName ? proposal : null

            return (
              <div key={sectionName} style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: colors.textDark, textTransform: 'capitalize' }}>
                    {sectionName}
                  </span>
                  {pending ? (
                    <StatusBadge status="pending" label="Changes Pending" />
                  ) : (
                    <StatusBadge status="live" />
                  )}
                  {!active && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openMode(sectionName, 'ai')}
                        style={{ ...gradientButton, padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✦ AI edit
                      </button>
                      <button
                        onClick={() => openMode(sectionName, 'manual')}
                        style={{ ...secondaryButton, padding: '6px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {!active && (
                  <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {content || <span style={{ fontStyle: 'italic' }}>No content yet. Try ✦ AI edit to write it from scratch.</span>}
                  </div>
                )}

                {active && mode?.type === 'manual' && (
                  <div>
                    <label style={labelStyle}>Content</label>
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      rows={6}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => submitChange(sectionName, draft, 'manual')}
                        disabled={busy}
                        style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px', opacity: busy ? 0.5 : 1 }}
                      >
                        {busy ? 'Submitting...' : 'Request Change'}
                      </button>
                      <button onClick={closeMode} style={{ ...secondaryButton, fontSize: '13px', padding: '8px 16px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {active && mode?.type === 'ai' && !activeProposal && (
                  <div>
                    <label style={labelStyle}>What should change?</label>
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      rows={2}
                      placeholder={`e.g. "make this sound more premium" or "mention that we now open Saturdays"`}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    {aiError && <p style={{ fontSize: '12px', color: colors.error, marginTop: '8px' }}>{aiError}</p>}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={runAi}
                        disabled={busy || !draft.trim()}
                        style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px', opacity: busy || !draft.trim() ? 0.5 : 1 }}
                      >
                        {busy ? 'Writing…' : '✦ Generate'}
                      </button>
                      <button onClick={closeMode} style={{ ...secondaryButton, fontSize: '13px', padding: '8px 16px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {active && mode?.type === 'ai' && activeProposal && (
                  <div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px', background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textLight, marginBottom: '6px' }}>Current</div>
                        <div style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{content || <em>empty</em>}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: '220px', background: colors.successBg, border: `1px solid ${colors.success}33`, borderRadius: '12px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.success, marginBottom: '6px' }}>Proposed</div>
                        <div style={{ fontSize: '12.5px', color: colors.textDark, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{activeProposal.text}</div>
                      </div>
                    </div>
                    {activeProposal.summary && (
                      <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '10px' }}>✦ {activeProposal.summary}</p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => submitChange(sectionName, activeProposal.text, 'ai')}
                        disabled={busy}
                        style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px', opacity: busy ? 0.5 : 1 }}
                      >
                        {busy ? 'Submitting...' : 'Use this — Request Change'}
                      </button>
                      <button onClick={() => { setProposal(null) }} style={{ ...secondaryButton, fontSize: '13px', padding: '8px 16px' }}>
                        Try a different instruction
                      </button>
                      <button onClick={closeMode} style={{ ...secondaryButton, fontSize: '13px', padding: '8px 16px' }}>
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.textDark, marginBottom: '8px', padding: '0 4px' }}>
            Change History
          </h2>
          {changeRequests.length === 0 ? (
            <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: colors.textMuted }}>No changes requested yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {changeRequests.map(cr => <ChangeRequestCard key={cr.id} cr={cr} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
