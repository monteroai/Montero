'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  speed: number
  opacity: number
  radius: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const initParticles = () => {
      particles.length = 0
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.2 + Math.random() * 0.6,
          opacity: 0.3 + Math.random() * 0.5,
          radius: 1.5 + Math.random() * 1.5,
        })
      }
    }

    resize()
    initParticles()

    const handleResize = () => {
      resize()
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.y -= p.speed
        if (p.y < 0) {
          p.y = canvas.height
          p.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
