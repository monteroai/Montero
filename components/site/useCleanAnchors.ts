'use client'

import { useEffect } from 'react'

// In-page links scroll without putting "#section" in the address bar, and arriving from another page
// with a hash (e.g. /recruiting#start) scrolls there and then clears it.
export function useCleanAnchors() {
  useEffect(() => {
    const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (location.hash) {
      const id = location.hash.slice(1)
      history.replaceState(null, '', location.pathname + location.search)
      requestAnimationFrame(() => go(id))
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href') || ''
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
      const [path, id] = href.split('#')
      if (id && (path === '' || path === location.pathname)) { e.preventDefault(); go(id) }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
