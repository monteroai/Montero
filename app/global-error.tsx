'use client'

import { useEffect } from 'react'

// Top-level error boundary — replaces Next.js's minified "client-side exception"
// screen with the actual error message + stack. Strip back to a generic message
// once the underlying bug is fixed.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body style={{
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        background: '#0a0908',
        color: '#E8E0D0',
        margin: 0,
        padding: '40px 24px',
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, color: '#C9A84C', marginBottom: 8 }}>Something broke</h1>
          <p style={{ fontSize: 13, color: '#8A8070', marginBottom: 20 }}>
            Full error below so Emilio can see what went wrong. Try reload — if it sticks, paste this in chat.
          </p>

          <div style={{
            background: '#141210',
            border: '1px solid #2a2520',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: '#5C544A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Message</div>
            <pre style={{ margin: 0, fontSize: 13, color: '#E8E0D0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {error.message || '(no message)'}
            </pre>
            {error.digest && (
              <>
                <div style={{ fontSize: 11, color: '#5C544A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14, marginBottom: 6 }}>Digest</div>
                <pre style={{ margin: 0, fontSize: 12, color: '#8A8070', fontFamily: 'ui-monospace, Menlo, monospace' }}>{error.digest}</pre>
              </>
            )}
          </div>

          {error.stack && (
            <div style={{
              background: '#141210',
              border: '1px solid #2a2520',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, color: '#5C544A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Stack</div>
              <pre style={{ margin: 0, fontSize: 11, color: '#8A8070', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, Menlo, monospace' }}>
                {error.stack}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={reset}
              style={{
                background: '#C9A84C',
                color: '#0a0908',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                color: '#8A8070',
                border: '1px solid #2a2520',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
