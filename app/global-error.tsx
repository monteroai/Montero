'use client'

import { useEffect } from 'react'

// Top-level error boundary. Logs the full error to the console for debugging
// but only shows a friendly message + Try Again / Email Emilio buttons to the
// user. Replace this with something fancier once we have proper telemetry.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface in console so Emilio can debug if it happens to him
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body style={{
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        margin: 0,
        padding: '60px 24px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
        color: '#1e293b',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B2B5E', marginBottom: 10 }}>
            Something went wrong on this page
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
            Try reloading. If it sticks, email <a href="mailto:ai@montero.cool" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>ai@montero.cool</a> and let us know what you were doing.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: 'linear-gradient(135deg, #1B2B5E, #2563eb)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '11px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: 'rgba(255,255,255,0.7)',
                color: '#1e293b',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 12,
                padding: '11px 22px',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              Home
            </a>
          </div>

          {error.digest && (
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 32, fontFamily: 'ui-monospace, Menlo, monospace' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
