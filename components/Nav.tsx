'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavProps {
  variant?: 'main' | 'real-estate'
}

export function Nav({ variant = 'main' }: NavProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const base: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '0 24px',
    background: scrolled ? 'rgba(10,10,10,0.90)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,166,0,0.10)' : 'none',
    transition: 'all 0.3s ease',
  }

  if (variant === 'real-estate') {
    return (
      <header style={base}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'rgba(255,166,0,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ffa600')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,166,0,0.7)')}>
            ← montero.cool
          </Link>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '15px', color: '#ffa600', letterSpacing: '0.08em' }}>
            Real Estate by montero.
          </span>
          <a href="#pricing" style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 16px',
            background: 'rgba(255,166,0,0.12)', border: '1px solid rgba(255,166,0,0.35)',
            color: '#ffa600', borderRadius: '8px', textDecoration: 'none',
          }}>
            Join Waitlist
          </a>
        </div>
      </header>
    )
  }

  return (
    <header style={base}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '20px', fontWeight: 700, color: '#ffa600', textDecoration: 'none', letterSpacing: '0.05em' }}>
          montero.
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {[['Work', '#case-studies'], ['Services', '#services'], ['Contact', '#contact']].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)')}>
              {label}
            </a>
          ))}
          <Link href="/real-estate" style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 16px',
            background: 'rgba(255,166,0,0.12)', border: '1px solid rgba(255,166,0,0.35)',
            color: '#ffa600', borderRadius: '8px', textDecoration: 'none',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,166,0,0.22)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,166,0,0.12)')}>
            Real Estate Agents →
          </Link>
        </nav>
      </div>
    </header>
  )
}
