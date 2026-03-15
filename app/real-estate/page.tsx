'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Nav } from '@/components/Nav'
import { ParticleField } from '@/components/ParticleField'
import { HowItWorksRE } from '@/components/HowItWorksRE'
import { VoiceComparison } from '@/components/VoiceComparison'
import { RECaseStudy } from '@/components/RECaseStudy'
import { REPricing } from '@/components/REPricing'

const HEADLINE_WORDS = ['AI', 'tools', 'built', 'for', 'agents', 'who', 'close.']

function HeroHeadline() {
  const prefersReduced = useReducedMotion()
  return (
    <h1 style={{
      fontFamily: 'var(--font-cinzel)',
      fontSize: 'clamp(36px, 6.5vw, 72px)',
      fontWeight: 700,
      color: '#FFFFFF',
      lineHeight: 1.1,
      marginBottom: '24px',
      letterSpacing: '-0.01em',
    }}>
      {HEADLINE_WORDS.map((word, i) => (
        <motion.span
          key={i}
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.3 + i * 0.08 }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}

export default function RealEstatePage() {
  const prefersReduced = useReducedMotion()
  const sublineDelay = prefersReduced ? 0 : 0.3 + HEADLINE_WORDS.length * 0.08 + 0.3
  const ctaDelay = sublineDelay + 0.4

  return (
    <>
      <Nav variant="real-estate" />
      <main style={{ background: '#0F1117', color: '#FFFFFF', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

        {/* ── HERO ────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#1B2B5E' }}>
          <ParticleField />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 24px 80px', maxWidth: '800px' }}>
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '24px' }}
            >
              Agent OS by montero.
            </motion.div>

            <HeroHeadline />

            <motion.p
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: sublineDelay }}
              style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 16px' }}
            >
              MLS remarks in your voice. Seller presentations in 60 seconds. Market intelligence that makes you look like the expert in the room.
            </motion.p>

            <motion.p
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: sublineDelay + 0.15 }}
              style={{ fontSize: '14px', color: 'rgba(201,168,76,0.75)', fontStyle: 'italic', marginBottom: '40px' }}
            >
              68% of agents use AI. Only 17% say it works. The difference is tools built around your voice.
            </motion.p>

            <motion.div
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: ctaDelay }}
              style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <a href="#how-it-works" style={{
                padding: '14px 28px', fontSize: '15px', fontWeight: 600,
                border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C',
                borderRadius: '10px', textDecoration: 'none', background: 'rgba(201,168,76,0.06)',
              }}>
                See How It Works
              </a>
              <a href="#pricing" style={{
                padding: '14px 28px', fontSize: '15px', fontWeight: 600,
                background: '#C9A84C', color: '#0a0a0a',
                borderRadius: '10px', textDecoration: 'none',
              }}>
                Start Free
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS (scroll-pinned) ─────────────────── */}
        <HowItWorksRE />

        {/* ── VOICE COMPARISON ────────────────────────────── */}
        <VoiceComparison />

        {/* ── AGENT OS PRODUCT DETAIL ──────────────────────── */}
        <section style={{ padding: '100px 24px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
                Agent OS
              </div>
              <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 600, color: '#FFFFFF', maxWidth: '560px', marginBottom: '16px' }}>
                Your voice. Your market. Your listings.
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, maxWidth: '560px' }}>
                Agent OS is the tool we built for the Magyar Team — and are now opening to agents across the country. It starts with your DNA: a profile of your writing style, market focus, and tone. Every generation after that is personalized, consistent, and ready to publish.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(201,168,76,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
              {[
                ['MLS Remarks', 'AI reads your photos and writes remarks that sound exactly like you. No editing, no templates.'],
                ['Social Captions', 'Instagram, SMS teaser, and email content generated alongside your remarks — same source, one click.'],
                ['Presentation Sites', 'Branded one-page listing sites deployed to a live URL. Sellers see a deliverable that looks like it took a week.'],
                ['DNA System', 'Your voice profile persists across every listing. The longer you use it, the sharper it gets.'],
              ].map(([title, body]) => (
                <div key={title as string} style={{ padding: '30px 24px', background: '#0e0e0e' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', marginBottom: '10px' }}>{title}</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CASE STUDY ──────────────────────────────────────── */}
        <RECaseStudy />

        {/* ── PRICING ─────────────────────────────────────────── */}
        <REPricing />

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div style={{ padding: '40px 24px', borderTop: '1px solid rgba(201,168,76,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.20)' }}>
            © {new Date().getFullYear()} montero. · <a href="mailto:ai@montero.cool" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>ai@montero.cool</a>
          </p>
        </div>

      </main>
    </>
  )
}
