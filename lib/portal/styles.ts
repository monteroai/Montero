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

// Soft-glass canvas: cool blue-gray with ambient light pools (the "milky
// waves" look) — stacked radial gradients, no extra DOM needed.
export const mainBg = [
  'radial-gradient(1000px 520px at 12% 6%, rgba(255,255,255,0.95), transparent 60%)',
  'radial-gradient(1200px 640px at 90% 24%, rgba(203,216,240,0.55), transparent 65%)',
  'radial-gradient(1100px 720px at 26% 100%, rgba(210,222,245,0.6), transparent 62%)',
  'linear-gradient(180deg, #eef1f7 0%, #e9edf5 100%)',
].join(', ')

// Frosted panel (sidebar, sheets) — floats over the canvas.
export const glass: CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(28px) saturate(170%)',
  WebkitBackdropFilter: 'blur(28px) saturate(170%)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 18px 44px rgba(23,32,64,0.08)',
}

// Card — near-white glass bubble with a soft, wide drop shadow.
export const card: CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 2px 6px rgba(23,32,64,0.04), 0 18px 44px rgba(23,32,64,0.07)',
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
