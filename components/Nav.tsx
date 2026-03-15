'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BullMark } from './BullMark'

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

  const bar: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '0 24px',
    background: scrolled ? 'rgba(9,9,11,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  }

  const inner: React.CSSProperties = {
    maxWidth: '1100px',
    margin: '0 auto',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  if (variant === 'real-estate') {
    return (
      <header style={bar}>
        <div style={inner}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--text-dim)', transition: 'color 0.2s' }}>
            ← montero.cool
          </Link>
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '15px', color: 'var(--re-gold)', letterSpacing: '0.06em' }}>
            Agent OS
          </span>
          <a href="#pricing" style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 16px',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--re-gold)', borderRadius: '8px',
          }}>
            Join Waitlist
          </a>
        </div>
      </header>
    )
  }

  return (
    <header style={bar}>
      <div style={inner}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BullMark size={26} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '17px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em' }}>
            MONTERO
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[['Work', '#case-studies'], ['Services', '#services'], ['Contact', '#contact']].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
              {label}
            </a>
          ))}
          <Link href="/real-estate" style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 16px',
            background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            color: 'var(--gold)', borderRadius: '8px', transition: 'background 0.2s',
          }}>
            Agent OS →
          </Link>
        </nav>
      </div>
    </header>
  )
}
