'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Check } from 'lucide-react'

const navy = '#1B2B5E'
const blue = '#2563eb'
const textDark = '#1e293b'
const textMuted = '#64748b'
const border = '#e2e8f0'
const inputBg = '#f8fafc'

interface Question {
  key: string
  label: string
  type: string
  options?: string[]
}

const SELLER_QUESTIONS: Question[] = [
  { key: 'seller_motivation', label: "What is the seller's primary motivation?", type: 'select', options: ['Downsizing', 'Divorce', 'Relocation', 'Financial', 'Timeline pressure', 'Estate sale', 'Other'] },
  { key: 'timeline', label: 'What is their ideal closing timeline?', type: 'select', options: ['ASAP (under 30 days)', '1-2 months', '3-6 months', 'Flexible / no rush'] },
  { key: 'concerns', label: 'What concerns did they express about price or condition?', type: 'textarea' },
  { key: 'competing_agents', label: 'Did they mention other agents or offers they are considering?', type: 'textarea' },
  { key: 'winning_factors', label: 'What would make them choose this agent over another?', type: 'textarea' },
  { key: 'additional_notes', label: 'Anything else that would help win this listing?', type: 'textarea' },
]

const BUYER_QUESTIONS: Question[] = [
  { key: 'must_haves', label: "What is the buyer's must-have vs nice-to-have list?", type: 'textarea' },
  { key: 'budget', label: 'What is their real budget ceiling vs stated budget?', type: 'text' },
  { key: 'motivation_level', label: 'How motivated are they on a scale of 1-10 and why?', type: 'textarea' },
  { key: 'dealbreakers', label: 'What has turned them off on other properties they have seen?', type: 'textarea' },
  { key: 'offer_trigger', label: 'What would make them write an offer today?', type: 'textarea' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', border: `1px solid ${border}`, borderRadius: '10px',
  padding: '10px 14px', fontSize: '14px', color: textDark, outline: 'none',
  boxSizing: 'border-box', background: '#ffffff',
}

export default function ContextFormPage() {
  const params = useParams()
  const listingId = params.id as string

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState<'seller' | 'buyer'>('seller')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const questions = relationship === 'seller' ? SELLER_QUESTIONS : BUYER_QUESTIONS

  function updateAnswer(key: string, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          submitted_by_name: name,
          submitted_by_email: email,
          relationship,
          ...answers,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} style={{ color: '#16a34a' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '8px' }}>Context submitted</h1>
          <p style={{ fontSize: '15px', color: textMuted, lineHeight: 1.6 }}>
            Your insights have been received and will be used to generate more targeted content for this listing. You can close this page.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: inputBg, padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: blue }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: blue }}>MONTERO</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: navy, marginBottom: '8px' }}>Share listing context</h1>
          <p style={{ fontSize: '14px', color: textMuted, lineHeight: 1.6 }}>
            Your insights help generate more accurate, deal-specific content. Takes under 2 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: `1px solid ${border}`, padding: '24px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Your name *</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Angel Rodriguez" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Your email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="angel@email.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>You are representing the...</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['seller', 'buyer'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRelationship(r); setAnswers({}) }}
                    style={{
                      flex: 1, padding: '10px', fontSize: '14px', fontWeight: 600,
                      borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                      border: relationship === r ? `2px solid ${blue}` : `1px solid ${border}`,
                      background: relationship === r ? 'rgba(37,99,235,0.04)' : '#ffffff',
                      color: relationship === r ? blue : textMuted,
                      textTransform: 'capitalize',
                    }}
                  >
                    {r} side
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '14px', border: `1px solid ${border}`, padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, marginBottom: '20px' }}>
              {relationship === 'seller' ? 'Seller intelligence' : 'Buyer intelligence'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {questions.map(q => (
                <div key={q.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{q.label}</label>
                  {q.type === 'select' ? (
                    <select
                      value={answers[q.key] || ''}
                      onChange={e => updateAnswer(q.key, e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select...</option>
                      {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : q.type === 'textarea' ? (
                    <textarea
                      value={answers[q.key] || ''}
                      onChange={e => updateAnswer(q.key, e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Type your answer..."
                    />
                  ) : (
                    <input
                      value={answers[q.key] || ''}
                      onChange={e => updateAnswer(q.key, e.target.value)}
                      style={inputStyle}
                      placeholder="Type your answer..."
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '14px', background: navy, color: '#ffffff', border: 'none',
              borderRadius: '12px', fontSize: '15px', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit context'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#94a3b8' }}>
          Powered by MONTERO
        </p>
      </div>
    </main>
  )
}
