'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 24px',
      background: scrolled ? 'rgba(15,17,23,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(79,110,247,0.1)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo.png"
            alt="montero.cool"
            width={120}
            height={32}
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {([['Work', '#case-study'], ['Pricing', '#pricing'], ['Contact', '#contact']] as [string, string][]).map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{ fontSize: '14px', color: '#8B95A9', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8B95A9')}
            >
              {label}
            </a>
          ))}
          <a
            href="#pricing"
            style={{
              fontSize: '14px', fontWeight: 600, padding: '8px 18px',
              background: '#4F6EF7', color: '#FFFFFF', borderRadius: '8px',
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Try Agent OS
          </a>
        </nav>
      </div>
    </header>
  )
}
