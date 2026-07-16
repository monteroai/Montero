'use client'

import { useState, useEffect, useRef } from 'react'
import { card, colors, gradientButton, voiceTitle } from '@/lib/portal/styles'
import { DocumentCard } from '@/components/portal/DocumentCard'
import type { PortalDocument } from '@/lib/portal/types'
import { DecodeText } from '@/components/portal/DecodeText'

const TABS = [
  { key: '', label: 'All' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'contract', label: 'Contracts' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'automation-guide', label: 'Automations' },
  { key: 'upload', label: 'Uploads' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PortalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    const params = tab ? `?type=${tab}` : ''
    fetch(`/api/portal/documents${params}`)
      .then(r => r.json())
      .then(d => { setDocuments(d.documents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tab])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('type', 'upload')

    const res = await fetch('/api/portal/documents', { method: 'POST', body: formData })
    if (res.ok) {
      const d = await res.json()
      setDocuments(prev => [d.document, ...prev])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 0' }}>
        <div>
          <h1 style={{ fontSize: '26px', ...voiceTitle }}>
            <DecodeText text="Documents" />
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
            Contracts, invoices, and files shared with your account.
          </p>
        </div>
        <div>
          <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ ...gradientButton, fontSize: '13px', padding: '8px 16px', opacity: uploading ? 0.5 : 1 }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer',
              background: tab === t.key ? colors.navy : 'rgba(255,255,255,0.7)',
              color: tab === t.key ? '#ffffff' : colors.textMuted,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: colors.textMuted }}>
            No documents yet. Your account manager will add onboarding docs and contracts here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {documents.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </>
  )
}
