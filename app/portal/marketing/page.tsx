'use client'

import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import { card, colors, gradientButton, secondaryButton, voiceTitle } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'
import { DecodeText } from '@/components/portal/DecodeText'

type StoryboardFrame = {
  idx: number
  image: string
  story: string
  duration?: string
  image_prompt?: string
  motion_prompt?: string
}
type Storyboard = {
  id: string
  title: string
  concept: string
  format: string
  status: 'draft' | 'approved'
  audio: { music?: string; voiceover?: string; sfx?: string }
  frames: StoryboardFrame[]
}

// Marketing tab — placeholder home for everything social/content related.
// Live wiring (Instagram OAuth, Meta Graph API for posting + DMs + insights,
// Higgsfield reel generation, scheduling) gets added as each integration
// clears Meta App Review. For now this tab tells the client what's coming so
// they see the roadmap when they log in.

const SECTIONS = [
  {
    key: 'reels',
    title: 'Reels library',
    blurb: 'AI-generated reels for your business. Browse, request edits, and approve before they publish.',
    cta: 'Coming with Higgsfield integration',
    color: '#8b5cf6',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    key: 'schedule',
    title: 'Content calendar',
    blurb: 'Schedule posts and reels across Instagram, TikTok, and your website. Approve, defer, or reroll any draft.',
    cta: 'Connect Instagram to enable',
    color: '#ec4899',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    key: 'dms',
    title: 'Inbox — DMs & comments',
    blurb: 'AI replies to Instagram DMs and post comments using your brand voice. Anything sensitive gets routed to you instead of auto-replied.',
    cta: 'Needs Instagram + Meta Business approval',
    color: '#06b6d4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: 'insights',
    title: 'Insights',
    blurb: 'Likes, views, reach, follower growth — all in one place. Track which reels and posts are pulling weight.',
    cta: 'Connect Instagram to enable',
    color: '#10b981',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

function AudioRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px', lineHeight: 1.55 }}>
      <span style={{ fontWeight: 700, color: colors.textDark, minWidth: '76px' }}>{label}</span>
      <span style={{ color: colors.textMuted }}>{value}</span>
    </div>
  )
}

// Fullscreen image viewer — sits above the whole portal (header z-30,
// sidebar z-50). Backdrop tap / Esc closes; chevrons + arrow keys navigate.
function Lightbox({ frames, index, onClose, onNav }: {
  frames: StoryboardFrame[]
  index: number
  onClose: () => void
  onNav: (idx: number) => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index < frames.length - 1) onNav(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) onNav(index - 1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, frames.length, onClose, onNav])

  const f = frames[index]
  const navBtn: CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '44px', height: '44px', borderRadius: '999px',
    background: 'rgba(255,255,255,0.14)', color: '#fff', border: 'none',
    fontSize: '22px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  }
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,10,18,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '18px',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: '14px', right: '14px', width: '40px', height: '40px',
          borderRadius: '999px', background: 'rgba(255,255,255,0.14)', color: '#fff',
          border: 'none', fontSize: '18px', cursor: 'pointer',
        }}
      >
        ✕
      </button>
      {index > 0 && (
        <button aria-label="Previous" onClick={e => { e.stopPropagation(); onNav(index - 1) }} style={{ ...navBtn, left: '10px' }}>‹</button>
      )}
      {index < frames.length - 1 && (
        <button aria-label="Next" onClick={e => { e.stopPropagation(); onNav(index + 1) }} style={{ ...navBtn, right: '10px' }}>›</button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={f.image}
        alt={`Frame ${f.idx}`}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 'min(92vw, 560px)', maxHeight: '78vh',
          objectFit: 'contain', borderRadius: '14px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{ marginTop: '14px', maxWidth: 'min(92vw, 560px)', textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.55 }}
      >
        <strong style={{ color: '#fff' }}>{f.idx}{f.duration ? ` · ${f.duration}` : ''}</strong> — {f.story}
      </div>
    </div>
  )
}

function StoryboardCard({ sb, isAdmin, onToggle, onDelete, busy, onEnlarge }: {
  sb: Storyboard
  isAdmin: boolean
  onToggle: (sb: Storyboard) => void
  onDelete: (sb: Storyboard) => void
  busy: boolean
  onEnlarge: (frames: StoryboardFrame[], idx: number) => void
}) {
  return (
    <div style={{ ...card, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: colors.navy, margin: 0, fontFamily: 'var(--font-cinzel)' }}>{sb.title}</h3>
        <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '999px', padding: '3px 10px' }}>{sb.format}</span>
        {isAdmin && (
          <span style={{
            fontSize: '11px', fontWeight: 700, borderRadius: '999px', padding: '3px 10px',
            background: sb.status === 'approved' ? colors.successBg : colors.warningBg,
            color: sb.status === 'approved' ? colors.success : colors.warning,
          }}>
            {sb.status === 'approved' ? 'Approved — client can see this' : 'Draft — hidden from client'}
          </span>
        )}
        {isAdmin && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onToggle(sb)}
              disabled={busy}
              style={{ ...(sb.status === 'approved' ? secondaryButton : gradientButton), padding: '7px 14px', fontSize: '12px', opacity: busy ? 0.5 : 1 }}
            >
              {sb.status === 'approved' ? 'Pull back to draft' : 'Approve → show client'}
            </button>
            <button
              onClick={() => onDelete(sb)}
              disabled={busy}
              title="Delete permanently"
              aria-label={`Delete ${sb.title}`}
              style={{
                background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '10px',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: busy ? 'default' : 'pointer', color: colors.textMuted, opacity: busy ? 0.5 : 1, flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.6, margin: '0 0 14px', maxWidth: '720px' }}>{sb.concept}</p>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        {sb.frames.map(f => (
          <div key={f.idx} style={{ flex: '0 0 200px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Frames are full-res 1024x1536 PNGs. Without lazy loading every
                frame of every storyboard decodes on mount, which is what made
                this tab crawl. Explicit dims also stop layout thrash on scroll. */}
            <img
              src={f.image}
              alt={`Frame ${f.idx} — tap to enlarge`}
              width={200}
              height={300}
              loading="lazy"
              decoding="async"
              onClick={() => onEnlarge(sb.frames, sb.frames.indexOf(f))}
              style={{ width: '200px', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'block', cursor: 'zoom-in', background: colors.inputBg, contentVisibility: 'auto' }}
            />
            <div style={{ padding: '8px 2px 0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: colors.navy }}>
                {f.idx}{f.duration ? ` · ${f.duration}` : ''}
              </div>
              <p style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.5, margin: '3px 0 0' }}>{f.story}</p>
              {isAdmin && (f.image_prompt || f.motion_prompt) && (
                <details style={{ marginTop: '6px' }}>
                  <summary style={{ fontSize: '11px', fontWeight: 600, color: '#8b5cf6', cursor: 'pointer' }}>Prompts (admin)</summary>
                  {f.image_prompt && (
                    <p style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5, margin: '6px 0 0', background: colors.inputBg, borderRadius: '8px', padding: '8px' }}>
                      <strong>Image:</strong> {f.image_prompt}
                    </p>
                  )}
                  {f.motion_prompt && (
                    <p style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5, margin: '6px 0 0', background: colors.inputBg, borderRadius: '8px', padding: '8px' }}>
                      <strong>Animate:</strong> {f.motion_prompt}
                    </p>
                  )}
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      {(sb.audio?.music || sb.audio?.voiceover || sb.audio?.sfx) && (
        <div style={{ marginTop: '10px', background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textLight }}>Audio direction</div>
          <AudioRow label="Music" value={sb.audio.music} />
          <AudioRow label="Voiceover" value={sb.audio.voiceover} />
          <AudioRow label="Sound FX" value={sb.audio.sfx} />
        </div>
      )}
    </div>
  )
}

export default function MarketingPage() {
  const { activeBusiness, activeBusinessId } = useBusiness()
  const [connecting, setConnecting] = useState(false)
  const [storyboards, setStoryboards] = useState<Storyboard[]>([])
  const [isAdminView, setIsAdminView] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [lightbox, setLightbox] = useState<{ frames: StoryboardFrame[]; index: number } | null>(null)

  const loadStoryboards = useCallback(() => {
    if (!activeBusinessId) { setStoryboards([]); return }
    fetch(`/api/portal/storyboards?business_id=${activeBusinessId}`)
      .then(r => r.json())
      .then(d => {
        setStoryboards(d.storyboards || [])
        setIsAdminView(Boolean(d._admin))
      })
      .catch(() => {})
  }, [activeBusinessId])

  useEffect(() => { loadStoryboards() }, [loadStoryboards])

  async function toggleApproval(sb: Storyboard) {
    if (!activeBusinessId) return
    setToggling(true)
    try {
      const res = await fetch('/api/portal/storyboards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: activeBusinessId,
          storyboard_id: sb.id,
          action: sb.status === 'approved' ? 'unapprove' : 'approve',
        }),
      })
      if (res.ok) loadStoryboards()
    } finally {
      setToggling(false)
    }
  }

  async function deleteStoryboard(sb: Storyboard) {
    if (!activeBusinessId) return
    const warning = sb.status === 'approved'
      ? `Delete "${sb.title}"?\n\nThis is APPROVED — the client can currently see it, and will lose access immediately.\n\nThe storyboard and all ${sb.frames.length} frames are permanently removed. This cannot be undone.`
      : `Delete "${sb.title}"?\n\nThe storyboard and all ${sb.frames.length} frames are permanently removed. This cannot be undone.`
    if (!window.confirm(warning)) return
    setToggling(true)
    try {
      const res = await fetch(
        `/api/portal/storyboards?business_id=${activeBusinessId}&storyboard_id=${encodeURIComponent(sb.id)}`,
        { method: 'DELETE' },
      )
      if (res.ok) loadStoryboards()
    } finally {
      setToggling(false)
    }
  }

  // Placeholder — real OAuth flow lands when Meta App Review clears.
  async function handleConnectInstagram() {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      alert(
        "Instagram connection isn't live yet — it requires Meta Business approval which takes a few weeks. " +
        "We'll let you know the moment it's ready. In the meantime Emilio handles posting manually using the brand voice from your business profile."
      )
    }, 600)
  }

  return (
    <>
      <div style={{ padding: '8px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', ...voiceTitle }}>
            <DecodeText text="Marketing" />
            {activeBusiness && <span style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: colors.textMuted, marginLeft: '8px' }}>· {activeBusiness.business_name}</span>}
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px', maxWidth: '640px' }}>
            Reels, scheduling, DMs, and insights — all from one place. Most of this rolls out as each platform integration clears review.
          </p>
        </div>
        <button
          onClick={handleConnectInstagram}
          disabled={connecting}
          style={{ ...gradientButton, fontFamily: 'inherit', fontSize: '13px', padding: '10px 18px', opacity: connecting ? 0.6 : 1 }}
        >
          {connecting ? 'Checking…' : 'Connect Instagram'}
        </button>
      </div>

      {/* Status banner — sets expectations honestly */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div style={{ flex: 1, fontSize: '13px', color: colors.textDark, lineHeight: 1.55 }}>
          <strong style={{ color: colors.navy }}>Marketing tab is in early access.</strong> The features below are visible so you can see what&apos;s coming. Each one lights up as integrations clear review with Meta and other platforms. While we wait, your account manager handles posting manually using your brand voice and uploaded assets.
        </div>
      </div>

      {/* Storyboards & creatives — the real marketing work. Admins see drafts
          with prompts + the approve control; clients only ever get approved
          boards (the API strips drafts and prompts server-side). */}
      {(storyboards.length > 0 || isAdminView) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '4px 4px 0' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: colors.navy, margin: 0, fontFamily: 'var(--font-cinzel)' }}>
              Storyboards & creatives
            </h2>
            {isAdminView && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Admin review — approve to publish to the client
              </span>
            )}
          </div>
          {storyboards.length === 0 ? (
            <div style={{ ...card, padding: '20px' }}>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                No storyboards for this business yet. New creatives land here as drafts for your review.
              </p>
            </div>
          ) : (
            storyboards.map(sb => (
              <StoryboardCard
                key={sb.id}
                sb={sb}
                isAdmin={isAdminView}
                onToggle={toggleApproval}
                busy={toggling}
                onDelete={deleteStoryboard}
                onEnlarge={(frames, index) => setLightbox({ frames, index })}
              />
            ))
          )}
        </div>
      )}

      {/* Section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {SECTIONS.map(s => (
          <div key={s.key} style={{ ...card, padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.textDark, margin: 0 }}>{s.title}</h3>
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, lineHeight: 1.55, flex: 1 }}>{s.blurb}</p>
            <div style={{ fontSize: '11px', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: '6px', borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
              {s.cta}
            </div>
          </div>
        ))}
      </div>

      {/* What you can do today section */}
      <div style={{ ...card, padding: '22px', background: 'rgba(255,255,255,0.5)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.navy, marginBottom: '10px' }}>What you can do today</h3>
        <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.6, marginBottom: '16px' }}>
          While the live integrations come online, Emilio handles your marketing manually using:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.textDark, lineHeight: 1.8 }}>
          <li>Your brand colors + logo from the Business profile</li>
          <li>Your description (what your business does) for tone</li>
          <li>Real photos you share via email or DM</li>
          <li>Specific asks: &ldquo;post about our new clinic onboarding,&rdquo; &ldquo;reel about why we exist,&rdquo; etc.</li>
        </ul>
        <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, marginTop: '16px' }}>
          Use the <strong>chat bubble</strong> in the corner to send marketing requests, or hit the <strong>Talk to Emilio</strong> button if it&apos;s a bigger project.
        </p>
      </div>

      {lightbox && (
        <Lightbox
          frames={lightbox.frames}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={idx => setLightbox({ frames: lightbox.frames, index: idx })}
        />
      )}
    </>
  )
}
