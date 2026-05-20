'use client'

import { useState } from 'react'
import { card, colors, gradientButton, secondaryButton } from '@/lib/portal/styles'
import { useBusiness } from '@/lib/portal/BusinessContext'

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

export default function MarketingPage() {
  const { activeBusiness } = useBusiness()
  const [connecting, setConnecting] = useState(false)

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
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.navy, fontFamily: 'var(--font-cinzel)' }}>
            Marketing
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
    </>
  )
}
