'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BullMark } from './BullMark'

interface NavProps {
  variant?: 'main'
}

export function Nav({ variant: _variant = 'main' }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close menu on route change or resize
  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  const bar: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '0 24px',
    background: scrolled || menuOpen ? 'rgba(9,9,11,0.92)' : 'transparent',
    backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
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

  const NAV_LINKS = [
    { label: 'Work', href: '#case-studies' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <header style={bar}>
      <div style={inner}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BullMark size={34} />
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '17px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em' }}>
            MONTERO
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} style={{ fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
              {label}
            </a>
          ))}
          <Link href="/portal" style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 16px',
            background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            color: 'var(--gold)', borderRadius: '8px', transition: 'background 0.2s',
          }}>
            Client Portal →
          </Link>
        </nav>

        {/* Mobile: Agent OS button + hamburger */}
        <div className="show-on-mobile" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
          <Link href="/portal" style={{
            fontSize: '12px', fontWeight: 600, padding: '6px 14px',
            background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            color: 'var(--gold)', borderRadius: '8px',
          }}>
            Portal
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              width: '36px', height: '36px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <span style={{
              display: 'block', width: '20px', height: '2px', background: 'var(--gold)',
              borderRadius: '1px', transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none',
            }} />
            <span style={{
              display: 'block', width: '20px', height: '2px', background: 'var(--gold)',
              borderRadius: '1px', transition: 'all 0.3s ease',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: '20px', height: '2px', background: 'var(--gold)',
              borderRadius: '1px', transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none',
            }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '8px 0 20px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          borderTop: '1px solid var(--border)',
        }}>
          <Link
            href="/portal"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block', padding: '12px 16px', borderRadius: '8px',
              background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
              fontSize: '14px', fontWeight: 600, color: 'var(--gold)',
              textAlign: 'center', marginBottom: '8px',
            }}
          >
            Open Client Portal →
          </Link>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', padding: '10px 16px', borderRadius: '8px',
                fontSize: '14px', color: 'var(--text-muted)',
                transition: 'background 0.2s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
