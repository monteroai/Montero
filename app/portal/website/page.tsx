'use client'

import { useState, useEffect } from 'react'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { ChangeRequestCard } from '@/components/portal/ChangeRequestCard'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { WEBSITE_SECTIONS } from '@/lib/portal/constants'
import { useBusiness } from '@/lib/portal/BusinessContext'
import type { PortalWebsiteContent, PortalChangeRequest } from '@/lib/portal/types'

export default function WebsitePage() {
  const { activeBusinessId, activeBusiness } = useBusiness()
  const [sections, setSections] = useState<PortalWebsiteContent[]>([])
  const [changeRequests, setChangeRequests] = useState<PortalChangeRequest[]>([])
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!activeBusinessId) {
      setSections([])
      setChangeRequests([])
      return
    }
    fetch(`/api/portal/website?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => {
        setSections(d.sections || [])
        setChangeRequests(d.change_requests || [])
      })
      .catch(() => {})
  }, [activeBusinessId])

  function getContent(sectionName: string): string {
    const s = sections.find(s => s.section === sectionName)
    return s ? (s.content.text as string || JSON.stringify(s.content, null, 2)) : ''
  }

  function hasPending(sectionName: string): boolean {
    return changeRequests.some(cr => cr.section === sectionName && cr.status === 'pending')
  }

  async function submitChange(section: string) {
    if (!activeBusinessId) return
    setSubmitting(true)
    setSuccess('')
    const res = await fetch('/api/portal/website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: activeBusinessId, section, new_content: { text: editContent } }),
    })
    if (res.ok) {
      const d = await res.json()
      setChangeRequests(prev => [d.change_request, ...prev])
      setEditingSection(null)
      setSuccess(`Change request submitted for ${section}. Awaiting approval.`)
      setTimeout(() => setSuccess(''), 5000)
    }
    setSubmitting(false)
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
      <div style={{ padding: '8px 4px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
          Website {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted }}>· {activeBusiness.business_name}</span>}
        </h1>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
          Edit your website content. Changes require approval before going live.
        </p>
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
            const editing = editingSection === sectionName

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
                  {!editing && (
                    <button
                      onClick={() => { setEditingSection(sectionName); setEditContent(content) }}
                      style={{ marginLeft: 'auto', ...secondaryButton, padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div>
                    <label style={labelStyle}>Content</label>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={6}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => submitChange(sectionName)}
                        disabled={submitting}
                        style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px', opacity: submitting ? 0.5 : 1 }}
                      >
                        {submitting ? 'Submitting...' : 'Request Change'}
                      </button>
                      <button onClick={() => setEditingSection(null)} style={{ ...secondaryButton, fontSize: '13px', padding: '8px 16px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {content || <span style={{ fontStyle: 'italic' }}>No content yet. Click Edit to add.</span>}
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
