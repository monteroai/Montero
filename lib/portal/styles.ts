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

// iOS-style neutral canvas: soft light gray with a faint top glow — no pink.
export const mainBg = 'radial-gradient(1400px 700px at 50% -12%, #fbfbfd 0%, #f2f3f5 48%, #e9ebee 100%)'

// Frosted panel (sidebars, sheets). More transparent + heavier blur so the
// gray canvas reads through — the "foggy glass" look.
export const glass: CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(28px) saturate(170%)',
  WebkitBackdropFilter: 'blur(28px) saturate(170%)',
  borderRadius: '22px',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 8px 32px rgba(17,24,39,0.06)',
}

// Frosted card (list rows, stat tiles). Translucent bubble over the canvas.
export const card: CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(22px) saturate(160%)',
  WebkitBackdropFilter: 'blur(22px) saturate(160%)',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.05)',
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
