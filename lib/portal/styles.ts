import type { CSSProperties } from 'react'

export const colors = {
  navy: '#1B2B5E',
  blue: '#2563eb',
  textDark: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  borderWhite: 'rgba(255,255,255,0.5)',
  inputBg: '#f8fafc',
  success: '#16a34a',
  successBg: '#dcfce7',
  error: '#dc2626',
  errorBg: '#fee2e2',
  warning: '#d97706',
  warningBg: '#fef3c7',
  infoBg: '#dbeafe',
} as const

// MONTERO FROST canvas — darker light-gray with dim ambient light pools.
// The gray depth is what makes the glass read as glass.
export const mainBg = [
  'radial-gradient(900px 480px at 14% 8%, rgba(255,255,255,0.55), transparent 60%)',
  'radial-gradient(1000px 560px at 88% 26%, rgba(178,192,218,0.5), transparent 65%)',
  'linear-gradient(180deg, #dde1e9 0%, #d3d8e2 100%)',
].join(', ')

// Frosted panel (sidebar, rails, sheets) — translucent, floating.
// The inset top highlight is the "light on the glass rim" cue.
export const glass: CSSProperties = {
  background: 'rgba(255,255,255,0.42)',
  backdropFilter: 'blur(30px) saturate(170%)',
  WebkitBackdropFilter: 'blur(30px) saturate(170%)',
  borderRadius: '22px',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 26px 60px rgba(23,32,64,0.16)',
}

// Card — frosted floating bubble: half-transparent, inner rim light,
// deep soft drop shadow.
export const card: CSSProperties = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(28px) saturate(170%)',
  WebkitBackdropFilter: 'blur(28px) saturate(170%)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75), 0 3px 8px rgba(23,32,64,0.06), 0 26px 60px rgba(23,32,64,0.14)',
}

// THE VOICE — ultralight tracked display type for page titles ("Good evening,
// Janeth", tab titles). Locked treatment #6 from the type lab.
export const voiceTitle: CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
  fontWeight: 200,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#16203a',
}

// Small tracked labels (stat-card labels, section eyebrows, nav group labels).
export const voiceLabel: CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
  fontWeight: 300,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
}

// Primary action — flat iOS-style fill of the active business's primary color
// (--mb-primary set by BusinessContext). The old two-color gradient is retired;
// one calm color per business, white label.
export const gradientButton: CSSProperties = {
  background: 'var(--mb-primary, #1B2B5E)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
  transition: 'opacity 0.2s, transform 0.15s',
}

// Kept for decorative accents (sparkle button, header underlines) only —
// no longer used for buttons.
export const themeGradient = 'linear-gradient(135deg, var(--mb-primary, #1B2B5E), var(--mb-secondary, #2563eb))'

// Secondary action — iOS "gray material": translucent neutral, no border.
export const secondaryButton: CSSProperties = {
  background: 'rgba(120,120,128,0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  color: '#1e293b',
  border: 'none',
  borderRadius: '14px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.2s',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'rgba(120,120,128,0.08)',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '6px',
}
