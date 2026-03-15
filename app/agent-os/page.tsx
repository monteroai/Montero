'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = 'rgba(255,255,255,0.5)'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, Charles'
  if (h < 17) return 'Good afternoon, Charles'
  return 'Good evening, Charles'
}

/* ── Glass panel ── */
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px', border: `1px solid ${border}`,
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
}

/* ── Listings data ── */
interface Listing {
  id: string
  address: string
  unit?: string
  city: string
  price: string
  seller?: string
  status: 'active' | 'prospecting' | 'won'
  remarks?: string
  contentPack?: { instagram?: string; email?: string; sms?: string }
  introLetter?: string
  stagedPhotos?: number
  contextCount?: number
}

const listings: Listing[] = [
  {
    id: '25-west-elm-10',
    address: '25 West Elm St',
    unit: 'Unit 10',
    city: 'Greenwich, CT 06830',
    price: '$1,150,000',
    seller: 'Rose Chodos',
    status: 'active',
    remarks: 'Sophisticated one-bedroom condominium at 25 West Elm Street offers refined Greenwich living steps from the Avenue. This meticulously maintained residence features hardwood floors throughout, an updated kitchen with granite countertops and stainless appliances, and a sun-drenched living area with elegant crown molding. The generous bedroom accommodates a king-size suite with ample closet space. Building amenities include an attended lobby, elevator, laundry, and storage. Walk to Metro-North, shops, and restaurants. A rare opportunity for discerning buyers seeking low-maintenance luxury in the heart of downtown Greenwich.',
    contentPack: {
      instagram: 'Downtown Greenwich living at its finest. 1BR condo at 25 West Elm — steps from the Avenue. #GreenwichCT #LuxuryLiving',
      email: 'Elegant 1BR at 25 West Elm St, Greenwich — Walk to Everything',
      sms: 'New listing: 1BR condo at 25 West Elm, Greenwich. $1.15M. Steps to Ave. Want details?',
    },
    introLetter: 'Dear Ms. Chodos,\n\nI hope this letter finds you well. My name is Charles Magyar with William Raveis Real Estate, and I specialize in Greenwich condominiums. I understand you may be considering selling your beautiful unit at 25 West Elm Street.\n\nI have worked with numerous sellers in your building and throughout downtown Greenwich, and I would welcome the opportunity to share a complimentary market analysis showing current values for comparable units.\n\nI would be happy to meet at your convenience to discuss how I can help you achieve the best possible outcome.\n\nWarm regards,\nCharles Magyar\nWilliam Raveis Real Estate\n203-550-1929',
    stagedPhotos: 0,
    contextCount: 1,
  },
  { id: '42-riverside', address: '42 Riverside Ave', city: 'Cos Cob, CT', price: '$1,250,000', status: 'active' },
  { id: '18-harbor', address: '18 Harbor Point Rd', city: 'Stamford, CT', price: '$875,000', status: 'prospecting' },
  { id: '7-meadow', address: '7 Meadow Lane', city: 'Greenwich, CT', price: '$2,100,000', status: 'prospecting' },
]

/* ── SVG Icons ── */
const Ico = {
  house: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  sparkle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

const statusColors = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  prospecting: { bg: '#dbeafe', color: '#2563eb', label: 'Prospecting' },
  won: { bg: '#fef3c7', color: '#d97706', label: 'Won' },
}

export default function ListingWorkspace() {
  const [greeting, setGreeting] = useState('')
  const [activeId, setActiveId] = useState('25-west-elm-10')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { setGreeting(getGreeting()) }, [])

  const active = listings.find(l => l.id === activeId) || listings[0]

  function startEdit(section: string, text: string) {
    setEditingSection(section)
    setEditText(text)
  }

  function saveEdit() {
    // In production: save to Supabase
    setEditingSection(null)
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // Figure out what to recommend next
  function getNextStep(): { label: string; section: string } | null {
    if (!active.remarks) return { label: 'Start by generating MLS remarks', section: 'remarks' }
    if (!active.contentPack) return { label: 'Create your content pack (Instagram, email, SMS)', section: 'content' }
    if (!active.introLetter) return { label: 'Write an intro letter to the seller', section: 'intro' }
    if (!active.stagedPhotos) return { label: 'Upload and stage listing photos', section: 'photos' }
    if (!active.contextCount) return { label: 'Request intel from collaborators', section: 'context' }
    return null
  }

  const next = getNextStep()

  // Completeness tracker
  const steps = [
    { label: 'Remarks', done: !!active.remarks },
    { label: 'Content', done: !!active.contentPack },
    { label: 'Intro Letter', done: !!active.introLetter },
    { label: 'Photos', done: (active.stagedPhotos || 0) > 0 },
    { label: 'Intel', done: (active.contextCount || 0) > 0 },
  ]
  const doneCount = steps.filter(s => s.done).length

  return (
    <>
      {/* ═══ LEFT SIDEBAR — Listings only ═══ */}
      <div style={{ ...glass, width: '230px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '14px 8px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 8px', margin: 0 }}>
          My Listings
        </p>

        {listings.map(l => {
          const isActive = l.id === activeId
          const st = statusColors[l.status]
          return (
            <div
              key={l.id}
              onClick={() => setActiveId(l.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.6)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s', marginBottom: '2px',
              }}
            >
              <span style={{ color: st.color, flexShrink: 0 }}>{Ico.house}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: textDark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.address}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{l.price}</p>
              </div>
            </div>
          )
        })}

        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
          background: 'transparent', border: 'none', width: '100%',
          fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginTop: '4px',
        }}>
          <span>{Ico.plus}</span> New Listing
        </button>

        <div style={{ flex: 1 }} />
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '8px 12px' }} />
        <Link href="/agent-os/settings" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', borderRadius: '10px', textDecoration: 'none',
          fontSize: '13px', color: '#94a3b8',
        }}>
          <span>{Ico.settings}</span> Settings
        </Link>
      </div>

      {/* ═══ MAIN WORKSPACE ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto', gap: '12px' }}>

        {/* Listing header */}
        <div style={{ padding: '4px 8px 0' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 2px' }}>{greeting}</p>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: navy, margin: '0 0 4px' }}>
            {active.address}{active.unit ? `, ${active.unit}` : ''}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: textMuted }}>{active.city}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: navy }}>{active.price}</span>
            {active.seller && <span style={{ fontSize: '13px', color: '#94a3b8' }}>Seller: {active.seller}</span>}
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px',
              background: statusColors[active.status].bg, color: statusColors[active.status].color,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {statusColors[active.status].label}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ ...glass, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            {steps.map(s => (
              <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  height: '4px', width: '100%', borderRadius: '2px',
                  background: s.done ? '#16a34a' : 'rgba(0,0,0,0.06)',
                  transition: 'background 0.3s',
                }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: s.done ? '#16a34a' : '#94a3b8' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: navy, whiteSpace: 'nowrap' }}>{doneCount}/{steps.length}</span>
        </div>

        {/* Recommended next step */}
        {next && (
          <div
            onClick={() => document.getElementById(next.section)?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              padding: '12px 18px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))',
              border: '1px solid rgba(37,99,235,0.15)',
            }}
          >
            <span style={{ color: blue }}>{Ico.sparkle}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: navy, flex: 1 }}>Recommended: {next.label}</span>
            <span style={{ color: blue }}>{Ico.arrow}</span>
          </div>
        )}

        {/* ── REMARKS SECTION ── */}
        <Section id="remarks" title="MLS Remarks" icon={Ico.edit} done={!!active.remarks}>
          {active.remarks ? (
            editingSection === 'remarks' ? (
              <div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: `1px solid ${blue}`, fontSize: '14px', lineHeight: 1.7,
                    color: textDark, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    background: '#ffffff',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <Btn label="Save" color={blue} filled onClick={saveEdit} />
                  <Btn label="Cancel" onClick={() => setEditingSection(null)} />
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.8, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
                  {active.remarks}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                  {active.remarks.split(/\s+/).length} words
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn icon={Ico.edit} label="Edit" onClick={() => startEdit('remarks', active.remarks!)} />
                  <Btn icon={Ico.copy} label={copied === 'remarks' ? 'Copied!' : 'Copy'} onClick={() => copyText(active.remarks!, 'remarks')} />
                  <Btn icon={Ico.download} label="Download PDF" color={navy} filled />
                </div>
              </div>
            )
          ) : (
            <GenerateBtn label="Generate MLS Remarks" href="/agent-os/remarks" />
          )}
        </Section>

        {/* ── CONTENT PACK SECTION ── */}
        <Section id="content" title="Content Pack" icon={Ico.mail} done={!!active.contentPack}>
          {active.contentPack ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'instagram', label: 'Instagram', text: active.contentPack.instagram },
                { key: 'email', label: 'Email Subject', text: active.contentPack.email },
                { key: 'sms', label: 'SMS', text: active.contentPack.sms },
              ].map(item => (
                <div key={item.key} style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                    <Btn icon={Ico.copy} label={copied === item.key ? 'Copied!' : 'Copy'} small onClick={() => copyText(item.text || '', item.key)} />
                  </div>
                  <p style={{ fontSize: '13px', color: textDark, lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '6px' }}>
                <Btn icon={Ico.download} label="Download All as PDF" color={navy} filled />
              </div>
            </div>
          ) : (
            <GenerateBtn label="Generate Content Pack" href="/agent-os/content" />
          )}
        </Section>

        {/* ── INTRO LETTER SECTION ── */}
        <Section id="intro" title="Intro Letter" icon={Ico.mail} done={!!active.introLetter}>
          {active.introLetter ? (
            editingSection === 'intro' ? (
              <div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: `1px solid ${blue}`, fontSize: '14px', lineHeight: 1.7,
                    color: textDark, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    background: '#ffffff', fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <Btn label="Save" color={blue} filled onClick={saveEdit} />
                  <Btn label="Cancel" onClick={() => setEditingSection(null)} />
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: '20px 24px', borderRadius: '12px',
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  fontSize: '14px', color: textDark, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  marginBottom: '12px', fontFamily: 'inherit',
                }}>
                  {active.introLetter}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn icon={Ico.edit} label="Edit" onClick={() => startEdit('intro', active.introLetter!)} />
                  <Btn icon={Ico.copy} label={copied === 'intro' ? 'Copied!' : 'Copy'} onClick={() => copyText(active.introLetter!, 'intro')} />
                  <Btn icon={Ico.download} label="Download PDF" color={navy} filled />
                </div>
              </div>
            )
          ) : (
            <GenerateBtn label="Write Intro Letter" href="/agent-os/remarks" />
          )}
        </Section>

        {/* ── PHOTOS SECTION ── */}
        <Section id="photos" title="Staged Photos" icon={Ico.camera} done={(active.stagedPhotos || 0) > 0}>
          <GenerateBtn label="Upload & Stage Photos" href="/agent-os/photos" />
        </Section>

        {/* ── COLLABORATOR INTEL SECTION ── */}
        <Section id="context" title="Collaborator Intel" icon={Ico.users} done={(active.contextCount || 0) > 0}>
          {(active.contextCount || 0) > 0 ? (
            <div>
              <p style={{ fontSize: '13px', color: textDark, marginBottom: '10px' }}>
                <span style={{ fontWeight: 600 }}>{active.contextCount}</span> response{active.contextCount !== 1 ? 's' : ''} received
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link href="/agent-os/context" style={{ textDecoration: 'none' }}>
                  <Btn label="View Submissions" />
                </Link>
                <Btn icon={Ico.copy} label="Copy Share Link" onClick={() => copyText(`${window.location.origin}/context/${active.id}`, 'context-link')} />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                Request listing intel from co-brokers and buyer agents. They fill out a simple form — no login needed.
              </p>
              <Link href="/agent-os/context" style={{ textDecoration: 'none' }}>
                <Btn icon={Ico.users} label="Request Intel" color={blue} filled />
              </Link>
            </div>
          )}
        </Section>

        <div style={{ height: '20px' }} />
      </div>
    </>
  )
}

/* ═══════ SUB-COMPONENTS ═══════ */

function Section({ id, title, icon, done, children }: {
  id: string; title: string; icon: React.ReactNode; done: boolean; children: React.ReactNode
}) {
  return (
    <div id={id} style={{
      ...({
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '18px', border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
      }),
      padding: '18px 22px', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ color: done ? '#16a34a' : '#94a3b8', display: 'flex' }}>
          {done ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : icon}
        </span>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
        {done && (
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#16a34a', marginLeft: '4px' }}>
            Done
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Btn({ icon, label, color, filled, small, onClick }: {
  icon?: React.ReactNode; label: string; color?: string; filled?: boolean; small?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: small ? '4px 10px' : '8px 16px',
        borderRadius: small ? '8px' : '10px',
        fontSize: small ? '11px' : '12px', fontWeight: 600,
        background: filled ? (color || '#1B2B5E') : 'rgba(255,255,255,0.5)',
        color: filled ? '#ffffff' : (color || '#64748b'),
        border: filled ? 'none' : '1px solid rgba(255,255,255,0.4)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {label}
    </button>
  )
}

function GenerateBtn({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 22px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #1B2B5E, #2563eb)',
        color: '#ffffff', fontSize: '14px', fontWeight: 600,
        border: 'none', cursor: 'pointer', width: '100%',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        {label}
      </button>
    </Link>
  )
}
