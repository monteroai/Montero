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

export const mainBg = 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)'

export const glass: CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
}

export const card: CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
}

export const gradientButton: CSSProperties = {
  background: 'linear-gradient(135deg, #1B2B5E, #2563eb)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
  transition: 'opacity 0.2s',
}

export const secondaryButton: CSSProperties = {
  background: 'rgba(255,255,255,0.5)',
  color: '#1e293b',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: '12px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.2s',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '6px',
}
