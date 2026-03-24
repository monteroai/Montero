'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingStepIndicator } from '@/components/portal/OnboardingStepIndicator'
import { card, colors, gradientButton, secondaryButton, inputStyle, labelStyle } from '@/lib/portal/styles'
import { SDT_WORKFLOWS, CATEGORY_LABELS } from '@/lib/portal/constants'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [goLiveChecks, setGoLiveChecks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/portal/onboarding').then(r => r.json()).then(d => {
      if (d.complete) { router.push('/portal'); return }
      setStep(d.step || 1)
      setFormData(d.data || {})
    })
  }, [router])

  async function saveAndNext() {
    setSaving(true)
    const isLast = step === 5
    await fetch('/api/portal/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: isLast ? 5 : step + 1, data: formData, complete: isLast }),
    })
    setSaving(false)
    if (isLast) router.push('/portal')
    else setStep(step + 1)
  }

  async function saveLater() {
    await fetch('/api/portal/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, data: formData }),
    })
  }

  function updateField(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.navy, marginBottom: '8px', fontFamily: 'var(--font-cinzel)' }}>
          Welcome to Montero
        </h1>
        <p style={{ fontSize: '14px', color: colors.textMuted }}>
          Let&apos;s get your business set up. This takes about 5 minutes.
        </p>
      </div>

      <OnboardingStepIndicator currentStep={step} />

      <div style={{ ...card, padding: '32px', marginTop: '24px' }}>
        {/* Step 1: Business Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '4px' }}>Business Information</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>Tell us about your business so we can personalize your experience.</p>

            {[
              { key: 'business_name', label: 'Business Name', placeholder: 'Smile Dental Temps LLC', required: true },
              { key: 'owner_name', label: 'Your Name', placeholder: 'Janeth', required: true },
              { key: 'phone', label: 'Phone', placeholder: '(555) 123-4567' },
              { key: 'email', label: 'Email', placeholder: 'info@smiledentaltemps.com' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{f.label}{f.required && <span style={{ color: colors.error }}> *</span>}</label>
                <input
                  style={inputStyle}
                  value={(formData[f.key] as string) || ''}
                  onChange={e => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Industry</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={(formData.industry as string) || ''}
                onChange={e => updateField('industry', e.target.value)}
              >
                <option value="">Select your industry</option>
                <option value="dental-staffing">Dental Staffing</option>
                <option value="dental-practice">Dental Practice</option>
                <option value="real-estate">Real Estate</option>
                <option value="restaurant">Restaurant</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Agreement */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '4px' }}>Service Agreement</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>Please review and acknowledge our service terms.</p>

            <div style={{
              height: '300px', overflowY: 'auto', padding: '20px',
              background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
              fontSize: '13px', lineHeight: '1.7', color: colors.textDark,
              marginBottom: '20px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Montero Industries — Client Service Agreement</h3>
              <p>This agreement is between Montero Industries (&quot;Provider&quot;) and the undersigned Client for AI automation, website development, and marketing services.</p>
              <p style={{ marginTop: '12px' }}><strong>1. Services.</strong> Provider will deliver AI-powered automation workflows, voice agent configuration, website development, and ongoing maintenance as outlined in the onboarding process.</p>
              <p style={{ marginTop: '12px' }}><strong>2. Data.</strong> Client data is stored securely via Supabase and processed through n8n automation workflows. Provider will not share client data with third parties except as required to deliver services (e.g., VAPI for voice, Airtable for CRM).</p>
              <p style={{ marginTop: '12px' }}><strong>3. Modifications.</strong> Website content changes submitted through the portal require Provider approval before going live. Automation configurations may be adjusted by the Client via the portal dashboard.</p>
              <p style={{ marginTop: '12px' }}><strong>4. Payment.</strong> Monthly subscription fee as agreed. Invoices are generated on the 1st of each month and due within 15 days.</p>
              <p style={{ marginTop: '12px' }}><strong>5. Term.</strong> This agreement is month-to-month and may be cancelled by either party with 30 days written notice.</p>
              <p style={{ marginTop: '12px' }}><strong>6. Support.</strong> Provider offers support via the portal dashboard and direct communication. Response time: within 24 hours on business days.</p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: colors.textDark }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => { setAgreedToTerms(e.target.checked); updateField('agreed_to_terms', String(e.target.checked)) }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              I have read and agree to the service agreement
            </label>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '4px' }}>Payment Setup</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>Set up your billing to activate your services.</p>

            <div style={{
              padding: '40px', textAlign: 'center',
              background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <p style={{ fontSize: '16px', fontWeight: 600, color: colors.textDark, marginBottom: '8px' }}>Payment will be set up with your account manager</p>
              <p style={{ fontSize: '13px', color: colors.textMuted }}>
                Emilio will reach out to finalize billing details. You can continue setup and start using the portal now.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Automations Overview */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '4px' }}>Your Automations</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>Here&apos;s everything that will be working for your business.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SDT_WORKFLOWS.map(wf => {
                const cat = CATEGORY_LABELS[wf.category] || { label: wf.category, color: '#64748b', bg: '#f1f5f9' }
                return (
                  <div key={wf.n8n_workflow_id} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textDark }}>{wf.friendly_name}</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>{wf.description}</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      background: cat.bg, color: cat.color,
                    }}>{cat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 5: Go Live */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textDark, marginBottom: '4px' }}>Go Live Checklist</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>Confirm these items before activating your automations.</p>

            {[
              { key: 'phone_verified', label: 'Phone number verified and forwarded to VAPI' },
              { key: 'test_call', label: 'Test call completed successfully' },
              { key: 'business_hours', label: 'Business hours confirmed' },
              { key: 'contacts_imported', label: 'Existing contacts imported (or skipped)' },
              { key: 'website_reviewed', label: 'Website content reviewed and approved' },
            ].map(item => (
              <label key={item.key} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '12px', marginBottom: '8px',
                background: goLiveChecks[item.key] ? colors.successBg : '#f8fafc',
                border: `1px solid ${goLiveChecks[item.key] ? '#bbf7d0' : '#e2e8f0'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={goLiveChecks[item.key] || false}
                  onChange={e => setGoLiveChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: colors.textDark, fontWeight: goLiveChecks[item.key] ? 600 : 400 }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} style={{ ...secondaryButton }}>
                Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={saveLater} style={{ ...secondaryButton, fontSize: '13px' }}>
              Save & Continue Later
            </button>
            <button
              onClick={saveAndNext}
              disabled={saving || (step === 2 && !agreedToTerms)}
              style={{
                ...gradientButton,
                opacity: saving || (step === 2 && !agreedToTerms) ? 0.5 : 1,
                cursor: saving || (step === 2 && !agreedToTerms) ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : step === 5 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
