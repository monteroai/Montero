export function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '120px 24px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(79,110,247,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />
      {/* Center glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(79,110,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          marginBottom: '24px',
        }}>
          Real estate automation
        </div>
        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: 700,
          lineHeight: 1.1,
          color: '#FFFFFF',
          marginBottom: '24px',
          letterSpacing: '-0.02em',
        }}>
          AI tools built for<br />agents who close.
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#8B95A9',
          lineHeight: 1.7,
          maxWidth: '560px',
          margin: '0 auto 40px',
        }}>
          MLS remarks in your voice. Seller presentations in 60 seconds. Market intelligence that makes you look like the expert in the room.
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}>
          <a
            href="#case-study"
            style={{
              padding: '14px 28px', fontSize: '15px', fontWeight: 600,
              border: '1px solid rgba(79,110,247,0.5)', color: '#4F6EF7',
              borderRadius: '10px', textDecoration: 'none', background: 'rgba(79,110,247,0.08)',
              transition: 'all 0.2s',
            }}
          >
            See Our Work
          </a>
          <a
            href="#pricing"
            style={{
              padding: '14px 28px', fontSize: '15px', fontWeight: 600,
              background: '#4F6EF7', color: '#FFFFFF',
              borderRadius: '10px', textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Start Free
          </a>
        </div>
        <p style={{ fontSize: '12px', color: '#4B5563', letterSpacing: '0.04em' }}>
          Used by the Magyar Team · Greenwich, CT · $1B+ in closed transactions
        </p>
      </div>
    </section>
  )
}
