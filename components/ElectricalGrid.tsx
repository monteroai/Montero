'use client'

import { useEffect } from 'react'

export function ElectricalGrid() {
  useEffect(() => {
    let activeCurrents = 0
    const maxCurrents = 3
    const usedPaths = new Set<string>()

    const createOptimizedGridCurrent = () => {
      const gridContainer = document.querySelector('.grid-container') as HTMLElement
      if (!gridContainer || activeCurrents >= maxCurrents) return

      const gridSize = 80
      const containerRect = gridContainer.getBoundingClientRect()
      const gridCols = Math.floor(containerRect.width / gridSize)
      const gridRows = Math.floor(containerRect.height / gridSize)

      activeCurrents++

      const current = document.createElement('div')
      current.className = 'electrical-current'

      let currentX = Math.floor(Math.random() * gridCols)
      let currentY = Math.floor(Math.random() * gridRows)

      current.style.left  = `${currentX * gridSize - 5}px`
      current.style.top   = `${currentY * gridSize - 5}px`
      gridContainer.appendChild(current)

      const trailSegments: HTMLElement[] = []
      const maxTrailLength = 6
      const currentPath = new Set<string>()

      current.style.transition = 'opacity 0.8s ease-out'
      setTimeout(() => { current.style.opacity = '1' }, 100)

      const createPathKey = (x1: number, y1: number, x2: number, y2: number) =>
        `${Math.min(x1, x2)},${Math.min(y1, y2)}-${Math.max(x1, x2)},${Math.max(y1, y2)}`

      const cleanup = () => {
        current.style.transition = 'opacity 0.8s ease-out'
        current.style.opacity = '0'
        trailSegments.forEach((seg, i) => {
          setTimeout(() => {
            seg.style.transition = 'opacity 0.6s ease-out'
            seg.style.opacity = '0'
            setTimeout(() => { seg.parentNode?.removeChild(seg) }, 600)
          }, i * 50)
        })
        setTimeout(() => {
          current.parentNode?.removeChild(current)
          activeCurrents--
          setTimeout(() => { currentPath.forEach(p => usedPaths.delete(p)) }, 5000)
        }, 800)
      }

      const animateContinuousPath = () => {
        let steps = 0
        const maxSteps = Math.floor(Math.random() * 15) + 12

        const continuousMove = () => {
          if (steps >= maxSteps) { cleanup(); return }

          const prevX = currentX
          const prevY = currentY

          const allDirs = [
            ...(currentX > 0              ? [{ dir: 'left',  x: currentX - 1, y: currentY }] : []),
            ...(currentX < gridCols - 1   ? [{ dir: 'right', x: currentX + 1, y: currentY }] : []),
            ...(currentY > 0              ? [{ dir: 'up',    x: currentX,     y: currentY - 1 }] : []),
            ...(currentY < gridRows - 1   ? [{ dir: 'down',  x: currentX,     y: currentY + 1 }] : []),
          ]

          const available = allDirs.filter(m => {
            const k = createPathKey(currentX, currentY, m.x, m.y)
            return !usedPaths.has(k) && !currentPath.has(k)
          })

          if (available.length === 0) { cleanup(); return }

          const move = available[Math.floor(Math.random() * available.length)]
          currentX = move.x
          currentY = move.y

          const k = createPathKey(prevX, prevY, currentX, currentY)
          usedPaths.add(k)
          currentPath.add(k)

          const seg = document.createElement('div')
          seg.className = 'electrical-trail'

          if (move.dir === 'left' || move.dir === 'right') {
            seg.style.width     = `${gridSize}px`
            seg.style.height    = '4px'
            seg.style.left      = `${Math.min(prevX, currentX) * gridSize - 2}px`
            seg.style.top       = `${prevY * gridSize - 2}px`
            seg.style.setProperty('--trail-direction', move.dir === 'right' ? '90deg' : '270deg')
          } else {
            seg.style.width     = '4px'
            seg.style.height    = `${gridSize}px`
            seg.style.left      = `${prevX * gridSize - 2}px`
            seg.style.top       = `${Math.min(prevY, currentY) * gridSize - 2}px`
            seg.style.setProperty('--trail-direction', move.dir === 'down' ? '180deg' : '0deg')
          }

          gridContainer.appendChild(seg)
          trailSegments.push(seg)
          seg.style.transition = 'opacity 0.5s ease-out'
          setTimeout(() => { seg.style.opacity = '0.8' }, 50)

          if (trailSegments.length > maxTrailLength) {
            const old = trailSegments.shift()!
            old.style.transition = 'opacity 0.6s ease-out'
            old.style.opacity = '0'
            setTimeout(() => { old.parentNode?.removeChild(old) }, 600)
          }

          trailSegments.forEach((s, i) => {
            s.style.transition = 'opacity 0.4s ease-out'
            s.style.opacity = `${(1 - (i / maxTrailLength) * 0.6) * 0.8}`
          })

          current.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          current.style.left = `${currentX * gridSize - 5}px`
          current.style.top  = `${currentY * gridSize - 5}px`

          steps++
          setTimeout(continuousMove, 1000)
        }

        continuousMove()
      }

      setTimeout(animateContinuousPath, 100)
    }

    const createStaggeredCurrents = () => {
      const n = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < n; i++) {
        setTimeout(() => { createOptimizedGridCurrent() }, i * 1500)
      }
    }

    const interval = setInterval(() => {
      if (activeCurrents < maxCurrents) createStaggeredCurrents()
    }, 6000)

    setTimeout(createStaggeredCurrents, 2000)

    return () => {
      clearInterval(interval)
      activeCurrents = 0
      usedPaths.clear()
    }
  }, [])

  return (
    <div
      className="grid-container"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0a0a',
        backgroundImage: `
          linear-gradient(90deg, rgba(255,166,0,0.10) 1px, transparent 1px),
          linear-gradient(rgba(255,166,0,0.10) 1px, transparent 1px),
          linear-gradient(45deg, rgba(255,166,0,0.05) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(255,166,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 40px 40px, 40px 40px',
        overflow: 'hidden',
      }}
    />
  )
}
