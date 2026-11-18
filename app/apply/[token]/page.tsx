import type { Metadata } from 'next'
import { readToken } from '@/lib/staffing/token'

export const metadata: Metadata = { title: 'Apply', robots: { index: false } }
const box = { width: '100%', boxSizing: 'border-box' as const, padding: '14px 16px', borderRadius: 12, border: '1px solid #cfc7b8', font: '17px Arial, Helvetica, sans-serif', background: '#fff', color: '#1d1a16' }
const label = { display: 'grid', gap: 6, font: '600 14px Arial, Helvetica, sans-serif', color: '#5c5448' }
const h1 = { font: '800 30px/1.15 Arial, Helvetica, sans-serif', margin: 0 }

export default function Page({ params, searchParams }: { params: { token: string }; searchParams: { sent?: string; error?: string; job?: string } }) {
  const token = decodeURIComponent(params.token), ag = readToken(token)
  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ea', color: '#1d1a16', font: '17px/1.5 Arial, Helvetica, sans-serif', padding: '36px 18px 60px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto', display: 'grid', gap: 18 }}>
        {!ag ? <p>This apply link is not valid. Ask the agency for a new one.</p> : searchParams.sent ? (
          <>
            <h1 style={h1}>Sent. {ag.n} has your application.</h1>
            <p style={{ margin: 0 }}>Check your email for a confirmation. A recruiter will reach out to you.</p>
            {ag.p ? <p style={{ margin: 0 }}>Questions? Call {ag.p}.</p> : null}
          </>
        ) : (
          <>
            <h1 style={h1}>Apply to {ag.n}</h1>
            <p style={{ margin: 0, color: '#5c5448' }}>Takes under a minute. No resume needed to start.</p>
            {searchParams.error ? <p style={{ margin: 0, color: '#b83227' }}>Please add your name, a phone or email, and tick the box.</p> : null}
            <form method="post" action="/api/apply" style={{ display: 'grid', gap: 14 }}>
              <input type="hidden" name="token" value={token} />
              <input name="company_site" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: -9999 }} aria-hidden="true" />
              <label style={label}>Your name<input name="name" required autoComplete="name" style={box} /></label>
              <label style={label}>Phone<input name="phone" type="tel" autoComplete="tel" style={box} /></label>
              <label style={label}>Email<input name="email" type="email" autoComplete="email" style={box} /></label>
              <label style={label}>Which job?<input name="job" defaultValue={searchParams.job || ''} placeholder="The job you saw" style={box} /></label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#5c5448' }}>
                <input type="checkbox" name="ok" value="yes" required style={{ marginTop: 3, width: 18, height: 18 }} />
                <span>{ag.n} may contact me by phone or email about this application.</span>
              </label>
              <button type="submit" style={{ padding: '16px 20px', borderRadius: 999, border: 0, background: '#1d1a16', color: '#fff', font: '700 18px Arial, Helvetica, sans-serif', cursor: 'pointer' }}>Send my application</button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
