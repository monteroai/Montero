'use client'

import { useEffect, useRef } from 'react'

const GOLD = { r: 201, g: 168, b: 76 } // #C9A84C

interface Node {
  x: number
  y: number // absolute page Y
  opacity: number
  targetOpacity: number
  fadeSpeed: number
}

interface Edge {
  from: number
  to: number
}

interface Pulse {
  path: number[]
  progress: number
  speed: number
  opacity: number
}

interface GridState {
  nodes: Node[]
  edges: Edge[]
  pulses: Pulse[]
  cols: number
  spacing: number
  pageHeight: number
  isMobile: boolean
  lastIdleFlicker: number
  lastPulseSpawn: number
  scrollY: number
}

export function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GridState>({
    nodes: [], edges: [], pulses: [],
    cols: 0, spacing: 80, pageHeight: 0,
    isMobile: false,
    lastIdleFlicker: 0, lastPulseSpawn: 0,
    scrollY: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const s = stateRef.current
    let raf = 0
    let viewW = 0
    let viewH = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      viewW = window.innerWidth
      viewH = window.innerHeight
      canvas!.width = viewW * dpr
      canvas!.height = viewH * dpr
      canvas!.style.width = `${viewW}px`
      canvas!.style.height = `${viewH}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function buildGrid() {
      resize()
      const pageH = document.documentElement.scrollHeight
      s.isMobile = viewW < 768
      s.spacing = s.isMobile ? 120 : 80
      s.pageHeight = pageH

      const cols = Math.floor(viewW / s.spacing) + 1
      const rows = Math.floor(pageH / s.spacing) + 1
      s.cols = cols

      const nodes: Node[] = []
      const edges: Edge[] = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jx = (Math.random() - 0.5) * s.spacing * 0.12
          const jy = (Math.random() - 0.5) * s.spacing * 0.12
          nodes.push({
            x: c * s.spacing + s.spacing / 2 + jx,
            y: r * s.spacing + s.spacing / 2 + jy,
            opacity: 0.2,
            targetOpacity: 0.2,
            fadeSpeed: 0.02,
          })
        }
      }

      // Edges: skip ~15% for organic feel
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c
          if (c < cols - 1 && Math.random() > 0.15) edges.push({ from: idx, to: idx + 1 })
          if (r < rows - 1 && Math.random() > 0.15) edges.push({ from: idx, to: idx + cols })
        }
      }

      s.nodes = nodes
      s.edges = edges
      s.pulses = []
    }

    // Build adjacency list for fast pathfinding
    function getAdj(): Map<number, number[]> {
      const adj = new Map<number, number[]>()
      s.edges.forEach(({ from, to }) => {
        if (!adj.has(from)) adj.set(from, [])
        if (!adj.has(to)) adj.set(to, [])
        adj.get(from)!.push(to)
        adj.get(to)!.push(from)
      })
      return adj
    }

    function findPath(adj: Map<number, number[]>, startIdx: number, maxLen: number): number[] {
      const path = [startIdx]
      const visited = new Set([startIdx])
      let cur = startIdx

      for (let i = 0; i < maxLen; i++) {
        const nbrs = (adj.get(cur) || []).filter(n => !visited.has(n))
        if (nbrs.length === 0) break
        const next = nbrs[Math.floor(Math.random() * nbrs.length)]
        path.push(next)
        visited.add(next)
        cur = next
      }
      return path
    }

    let adj: Map<number, number[]> = new Map()

    function spawnRandomPulse() {
      if (s.nodes.length === 0) return
      // Prefer nodes near current viewport
      const viewTop = s.scrollY
      const viewBot = s.scrollY + viewH
      const visible = s.nodes
        .map((n, i) => ({ i, y: n.y }))
        .filter(({ y }) => y > viewTop - 200 && y < viewBot + 200)
      if (visible.length === 0) return

      const start = visible[Math.floor(Math.random() * visible.length)].i
      const path = findPath(adj, start, 8 + Math.floor(Math.random() * 12))
      if (path.length < 3) return

      s.pulses.push({
        path, progress: 0,
        speed: 0.006 + Math.random() * 0.01,
        opacity: 0.8,
      })
    }

    function spawnZonePulse(zoneTop: number) {
      const candidates = s.nodes
        .map((n, i) => ({ n, i }))
        .filter(({ n }) => Math.abs(n.y - zoneTop) < 120)
      if (candidates.length === 0) return
      const start = candidates[Math.floor(Math.random() * candidates.length)]
      const path = findPath(adj, start.i, 15)
      if (path.length < 3) return

      s.pulses.push({ path, progress: 0, speed: 0.012, opacity: 0.9 })

      // Light up nodes along path
      path.forEach(idx => {
        const node = s.nodes[idx]
        if (!node) return
        node.targetOpacity = 0.9
        node.fadeSpeed = 0.04
        setTimeout(() => {
          if (s.nodes[idx]) {
            s.nodes[idx].targetOpacity = 0.2
            s.nodes[idx].fadeSpeed = 0.015
          }
        }, 1500)
      })
    }

    // IntersectionObserver for zone activation
    const observers: IntersectionObserver[] = []
    const firedZones = new Set<string>()

    function setupZoneObservers() {
      document.querySelectorAll<HTMLElement>('[data-circuit-zone]').forEach(el => {
        const zoneId = el.dataset.circuitZone || '0'
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !firedZones.has(zoneId)) {
                firedZones.add(zoneId)
                // Reset after 4s so it can re-fire on next scroll
                setTimeout(() => firedZones.delete(zoneId), 4000)

                const rect = el.getBoundingClientRect()
                spawnZonePulse(rect.top + window.scrollY)

                // Border glow
                el.style.transition = 'box-shadow 0.6s ease-out'
                el.style.boxShadow = `0 0 8px rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.15)`
                setTimeout(() => {
                  el.style.boxShadow = '0 0 0px rgba(201,168,76,0)'
                }, 1500)
              }
            })
          },
          { threshold: 0.15 }
        )
        observer.observe(el)
        observers.push(observer)
      })
    }

    function draw(now: number) {
      const sy = s.scrollY
      ctx!.clearRect(0, 0, viewW, viewH)

      // Only draw what's in viewport (with padding)
      const pad = 100
      const vTop = sy - pad
      const vBot = sy + viewH + pad

      // Draw edges (traces at 15% opacity)
      ctx!.lineWidth = 0.8
      ctx!.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.15)`
      ctx!.beginPath()
      s.edges.forEach(({ from, to }) => {
        const a = s.nodes[from]
        const b = s.nodes[to]
        if (!a || !b) return
        // Cull offscreen
        if (a.y < vTop && b.y < vTop) return
        if (a.y > vBot && b.y > vBot) return
        ctx!.moveTo(a.x, a.y - sy)
        ctx!.lineTo(b.x, b.y - sy)
      })
      ctx!.stroke()

      // Update and draw pulses
      s.pulses = s.pulses.filter(pulse => {
        pulse.progress += pulse.speed
        if (pulse.progress >= 1) return false

        const pathIdx = pulse.progress * (pulse.path.length - 1)
        const segIdx = Math.floor(pathIdx)
        const t = pathIdx - segIdx

        if (segIdx >= pulse.path.length - 1) return false

        const fn = s.nodes[pulse.path[segIdx]]
        const tn = s.nodes[pulse.path[segIdx + 1]]
        if (!fn || !tn) return false

        const px = fn.x + (tn.x - fn.x) * t
        const py = fn.y + (tn.y - fn.y) * t
        const screenY = py - sy

        // Only draw if near viewport
        if (screenY > -60 && screenY < viewH + 60) {
          // Glow
          const grad = ctx!.createRadialGradient(px, screenY, 0, px, screenY, 28)
          grad.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${pulse.opacity * 0.5})`)
          grad.addColorStop(1, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0)`)
          ctx!.fillStyle = grad
          ctx!.fillRect(px - 28, screenY - 28, 56, 56)

          // Trail
          const trailLen = 3
          for (let i = Math.max(0, segIdx - trailLen); i <= segIdx; i++) {
            const a = s.nodes[pulse.path[i]]
            const b = s.nodes[pulse.path[i + 1]]
            if (!a || !b) continue
            const age = (segIdx - i) / trailLen
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y - sy)
            ctx!.lineTo(b.x, b.y - sy)
            ctx!.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${pulse.opacity * (1 - age * 0.7)})`
            ctx!.lineWidth = 1.5
            ctx!.stroke()
          }

          // Dot
          ctx!.beginPath()
          ctx!.arc(px, screenY, 2.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${pulse.opacity})`
          ctx!.fill()
        }

        return true
      })

      // Draw visible nodes
      s.nodes.forEach(node => {
        if (node.y < vTop || node.y > vBot) return

        // Ease toward target
        if (node.opacity < node.targetOpacity) {
          node.opacity = Math.min(node.opacity + node.fadeSpeed, node.targetOpacity)
        } else if (node.opacity > node.targetOpacity) {
          node.opacity = Math.max(node.opacity - node.fadeSpeed, node.targetOpacity)
        }

        ctx!.beginPath()
        ctx!.arc(node.x, node.y - sy, 1.8, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${node.opacity})`
        ctx!.fill()
      })

      // Idle flicker
      if (now - s.lastIdleFlicker > 800 + Math.random() * 400) {
        s.lastIdleFlicker = now
        if (s.nodes.length > 0) {
          const idx = Math.floor(Math.random() * s.nodes.length)
          s.nodes[idx].targetOpacity = 0.45
          s.nodes[idx].fadeSpeed = 0.06
          setTimeout(() => {
            if (s.nodes[idx]) {
              s.nodes[idx].targetOpacity = 0.2
              s.nodes[idx].fadeSpeed = 0.03
            }
          }, 400)
        }
      }

      // Spawn ambient pulses every 3-4s
      if (now - s.lastPulseSpawn > 3000 + Math.random() * 1000) {
        s.lastPulseSpawn = now
        spawnRandomPulse()
        if (Math.random() > 0.5) setTimeout(spawnRandomPulse, 600)
      }

      raf = requestAnimationFrame(draw)
    }

    // Scroll listener
    const onScroll = () => { s.scrollY = window.scrollY }

    buildGrid()
    adj = getAdj()
    onScroll()

    setTimeout(setupZoneObservers, 300)
    raf = requestAnimationFrame(draw)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', () => { buildGrid(); adj = getAdj() })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', () => {})
      observers.forEach(o => o.disconnect())
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
