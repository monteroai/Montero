'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghikmnopqrstuvwxyz'

// Titles that already decoded this session (module scope = survives tab
// switches within the SPA, resets on hard refresh). Repeat visits render
// the word instantly instead of replaying the intro.
const played = new Set<string>()

// Scramble-decode intro for page titles: letters flicker through random
// glyphs and lock in left-to-right. Runs once on mount (i.e. per tab visit),
// ~700ms total, rAF-driven — no timers piling up, no layout shift (the real
// text reserves the width; the animation renders in an overlay).
// Respects prefers-reduced-motion by rendering static text.
export function DecodeText({ text, style }: { text: string; style?: CSSProperties }) {
  const [display, setDisplay] = useState<string | null>(null)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (played.has(text) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }
    played.add(text)

    const DURATION = 700
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      // characters lock in from the left as progress advances
      const locked = Math.floor(t * text.length)
      let out = text.slice(0, locked)
      for (let i = locked; i < text.length; i++) {
        const ch = text[i]
        out += ch === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setDisplay(out)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else setDisplay(text)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [text])

  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {/* real text reserves layout; hidden while animating */}
      <span style={{ visibility: display === text || display === null ? 'visible' : 'hidden' }}>{text}</span>
      {display !== null && display !== text && (
        <span aria-hidden style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {display}
        </span>
      )}
    </span>
  )
}
