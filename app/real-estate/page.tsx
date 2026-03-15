'use client'

import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { HowItWorksRE } from '@/components/HowItWorksRE'
import { VoiceComparison } from '@/components/VoiceComparison'
import { RECaseStudy } from '@/components/RECaseStudy'
import { REPricing } from '@/components/REPricing'

const navy = '#1B2B5E'
const navyDark = '#0f172a'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const borderLight = '#e2e8f0'

function IconMLS() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconSocial() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  )
}

function IconSite() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function IconDNA() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

const FEATURE_ICONS = [IconMLS, IconSocial, IconSite, IconDNA]

export default function RealEstatePage() {
  return (
    <>
      <Nav variant="real-estate" />
      <main style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

        {/* Hero — dark navy */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: `linear-gradient(180deg, ${navyDark} 0%, ${navy} 60%, #1e3a5f 100%)`,
        }}>
          {/* Subtle grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
          }} />

          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '700px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', textAlign: 'center', padding: '120px 24px 80px', maxWidth: '720px' }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '24px' }}
            >
              Agent OS by MONTERO
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '24px',
                color: '#ffffff',
              }}
            >
              AI tools built for agents who close.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 16px' }}
            >
              MLS remarks in your voice. Seller presentations in 60 seconds. Market intelligence that makes you the expert in the room.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ fontSize: '14px', color: 'rgba(96,165,250,0.7)', fontStyle: 'italic', marginBottom: '40px' }}
            >
              68% of agents use AI. Only 17% say it works. The difference is tools built around your voice.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <a href="#how-it-works" style={{
                padding: '13px 28px', fontSize: '14px', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff',
                borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.06)',
                transition: 'background 0.2s',
              }}>
                See How It Works
              </a>
              <a href="/agent-os" style={{
                padding: '13px 28px', fontSize: '14px', fontWeight: 600,
                background: blue, color: '#ffffff', borderRadius: 'var(--radius)',
                transition: 'opacity 0.2s',
              }}>
                Launch Agent OS
              </a>
            </motion.div>
          </div>
        </section>

        {/* Gradient transition: dark hero → white content */}
        <div style={{ height: '120px', background: 'linear-gradient(180deg, #1e3a5f 0%, #ffffff 100%)' }} />

        <HowItWorksRE />
        <VoiceComparison />

        {/* Features Grid */}
        <section style={{ padding: '100px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: '56px' }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: blue, marginBottom: '14px' }}>
                Agent OS
              </p>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, maxWidth: '480px', marginBottom: '14px', color: textDark }}>
                Your voice. Your market. Your listings.
              </h2>
              <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.7, maxWidth: '520px' }}>
                A profile of your writing style, market focus, and tone. Every generation after that is personalized, consistent, and ready to publish.
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}>
              {[
                ['MLS Remarks', 'AI reads your photos and writes remarks that sound exactly like you. No editing, no templates.'],
                ['Social Captions', 'Instagram, SMS teaser, and email content generated alongside your remarks — one click.'],
                ['Presentation Sites', 'Branded one-page listing sites deployed to a live URL in seconds.'],
                ['DNA System', 'Your voice profile persists across every listing. The longer you use it, the sharper it gets.'],
              ].map(([title, body], i) => {
                const Icon = FEATURE_ICONS[i]
                return (
                  <motion.div
                    key={title as string}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{
                      padding: '28px 24px', background: '#ffffff',
                      borderRadius: 'var(--radius)', border: `1px solid ${borderLight}`,
                      transition: 'box-shadow 0.3s, border-color 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
                      e.currentTarget.style.borderColor = '#bfdbfe'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = borderLight
                    }}
                  >
                    <div style={{ marginBottom: '14px' }}><Icon /></div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: textDark, marginBottom: '10px' }}>{title}</div>
                    <p style={{ fontSize: '13px', color: textMuted, lineHeight: 1.7 }}>{body}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <RECaseStudy />

        {/* Gradient: white case study → gray pricing */}
        <div style={{ height: '80px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }} />

        <REPricing />

        {/* Gradient: gray pricing → dark footer */}
        <div style={{ height: '80px', background: `linear-gradient(180deg, #f8fafc 0%, ${navyDark} 100%)` }} />

        {/* Footer */}
        <div style={{ padding: '40px 24px', background: navyDark, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} MONTERO · <a href="mailto:ai@montero.cool" style={{ color: 'rgba(96,165,250,0.6)' }}>ai@montero.cool</a>
          </p>
        </div>
      </main>
    </>
  )
}
