'use client'

import { colors } from '@/lib/portal/styles'
import { ONBOARDING_STEPS } from '@/lib/portal/constants'

export function OnboardingStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {ONBOARDING_STEPS.map((s, i) => {
        const done = currentStep > s.step
        const active = currentStep === s.step
        return (
          <div key={s.step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: 'absolute', top: '14px', right: '50%', width: '100%', height: '2px',
                background: done ? colors.blue : '#e2e8f0',
                zIndex: 0,
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, zIndex: 1,
              background: done ? colors.blue : active ? '#ffffff' : '#f1f5f9',
              color: done ? '#ffffff' : active ? colors.navy : colors.textLight,
              border: active ? `2px solid ${colors.blue}` : done ? 'none' : '2px solid #e2e8f0',
              boxShadow: active ? `0 0 0 4px rgba(37,99,235,0.12)` : 'none',
              transition: 'all 0.3s',
            }}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : s.step}
            </div>
            {/* Label */}
            <span style={{
              fontSize: '11px', fontWeight: active ? 600 : 500, marginTop: '6px',
              color: active ? colors.navy : done ? colors.blue : colors.textLight,
            }}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
