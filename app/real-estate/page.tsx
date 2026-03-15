'use client'

import { motion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { HowItWorksRE } from '@/components/HowItWorksRE'
import { VoiceComparison } from '@/components/VoiceComparison'
import { RECaseStudy } from '@/components/RECaseStudy'
import { REPricing } from '@/components/REPricing'

const gold = 'var(--re-gold)'

export default function RealEstatePage() {
  return (
    <>
      <Nav variant="real-estate" />
      <main style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, var(--re-bg-hero) 0%, var(--bg) 100%)',
        }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', textAlign: 'center', padding: '120px 24px 80px', maxWidth: '720px' }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, marginBottom: '24px' }}
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
              }}
            >
              AI tools built for agents who close.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 16px' }}
            >
              MLS remarks in your voice. Seller presentations in 60 seconds. Market intelligence that makes you the expert in the room.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ fontSize: '14px', color: 'rgba(201,168,76,0.65)', fontStyle: 'italic', marginBottom: '40px' }}
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
                border: '1px solid rgba(201,168,76,0.25)', color: gold,
                borderRadius: 'var(--radius)', background: 'rgba(201,168,76,0.06)',
              }}>
                See How It Works
              </a>
              <a href="#pricing" style={{
                padding: '13px 28px', fontSize: '14px', fontWeight: 600,
                background: gold, color: 'var(--bg)', borderRadius: 'var(--radius)',
              }}>
                Start Free
              </a>
            </motion.div>
          </div>
        </section>

        <HowItWorksRE />
        <VoiceComparison />

        {/* Features Grid */}
        <section style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '64px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, marginBottom: '14px' }}>
                Agent OS
              </p>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, maxWidth: '480px', marginBottom: '14px' }}>
                Your voice. Your market. Your listings.
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px' }}>
                A profile of your writing style, market focus, and tone. Every generation after that is personalized, consistent, and ready to publish.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              {[
                ['MLS Remarks', 'AI reads your photos and writes remarks that sound exactly like you. No editing, no templates.'],
                ['Social Captions', 'Instagram, SMS teaser, and email content generated alongside your remarks — one click.'],
                ['Presentation Sites', 'Branded one-page listing sites deployed to a live URL in seconds.'],
                ['DNA System', 'Your voice profile persists across every listing. The longer you use it, the sharper it gets.'],
              ].map(([title, body]) => (
                <div key={title as string} style={{ padding: '28px 24px', background: 'var(--bg)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: gold, marginBottom: '10px' }}>{title}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RECaseStudy />
        <REPricing />

        {/* Footer */}
        <div style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} MONTERO · <a href="mailto:ai@montero.cool" style={{ color: 'rgba(201,168,76,0.5)' }}>ai@montero.cool</a>
          </p>
        </div>
      </main>
    </>
  )
}
