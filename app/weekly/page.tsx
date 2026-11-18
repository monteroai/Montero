import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A new job ad every week · MONTERO',
  description: 'For staffing agencies with nothing to film: a new video ad every Monday and an apply page that answers every applicant. $50 a month.',
  robots: { index: false },
}

// Set STAFFING_PAY_LINK in the site's environment to the Stripe payment link (scripts/staffing_stripe_link.py prints it).
const PAY = process.env.STAFFING_PAY_LINK || ''
const items = [
  'A new video ad every Monday for the opening you most want filled',
  'We keep trying versions until one clearly pulls, then reuse it',
  'Your own apply page that replies to every applicant within seconds',
  "Each applicant's details sent straight to your inbox",
  'Nothing to install and nothing to connect',
  'Cancel any time by replying "stop"',
]

export default function Page() {
  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ea', color: '#1d1a16', font: '17px/1.5 Arial, Helvetica, sans-serif', padding: '40px 18px 64px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gap: 18 }}>
        <h1 style={{ font: '800 34px/1.1 Arial, Helvetica, sans-serif', margin: 0 }}>A new job ad every week. $50 a month.</h1>
        <p style={{ margin: 0, color: '#5c5448' }}>For staffing agencies with nothing to film.</p>
        <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 8 }}>{items.map((t) => <li key={t}>{t}</li>)}</ul>
        {PAY ? (
          <a href={PAY} style={{ display: 'block', textAlign: 'center', padding: '16px 20px', borderRadius: 999, background: '#1d1a16', color: '#fff', font: '700 18px Arial, Helvetica, sans-serif', textDecoration: 'none' }}>Start for $50 a month</a>
        ) : (
          <p style={{ margin: 0, padding: '14px 16px', border: '1px solid #cfc7b8', borderRadius: 12, background: '#fff' }}>To start, reply "weekly" to the email we sent you and we will send the payment link.</p>
        )}
        <p style={{ margin: 0, fontSize: 14, color: '#5c5448' }}>Card payment on a secure checkout page. After paying you answer a few questions and you are done. We work with one agency per area per specialty.</p>
      </div>
    </main>
  )
}
