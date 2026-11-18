import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Get set up · MONTERO', robots: { index: false } }
const box = { width: '100%', boxSizing: 'border-box' as const, padding: '14px 16px', borderRadius: 12, border: '1px solid #cfc7b8', font: '17px Arial, Helvetica, sans-serif', background: '#fff', color: '#1d1a16' }
const label = { display: 'grid', gap: 6, font: '600 14px Arial, Helvetica, sans-serif', color: '#5c5448' }
const h1 = { font: '800 30px/1.15 Arial, Helvetica, sans-serif', margin: 0 }

export default function Page({ searchParams }: { searchParams: { done?: string; error?: string } }) {
  return (
    <main style={{ minHeight: '100vh', background: '#f7f3ea', color: '#1d1a16', font: '17px/1.5 Arial, Helvetica, sans-serif', padding: '36px 18px 60px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'grid', gap: 18 }}>
        {searchParams.done ? (
          <>
            <h1 style={h1}>You are set up.</h1>
            <p style={{ margin: 0 }}>Check your email. Your apply page link is in it, and your first ad arrives Monday.</p>
            <p style={{ margin: 0, color: '#5c5448' }}>There is nothing to install and nothing to connect.</p>
          </>
        ) : (
          <>
            <h1 style={h1}>A few questions and you are done</h1>
            <p style={{ margin: 0, color: '#5c5448' }}>This takes about a minute. There is nothing to install and no accounts to connect.</p>
            {searchParams.error === '2' ? <p style={{ margin: 0, color: '#b83227' }}>Something went wrong on our side and your details were not saved. Please email ai@montero.cool and we will set you up by hand.</p>
              : searchParams.error ? <p style={{ margin: 0, color: '#b83227' }}>Please add your agency name and a working email.</p> : null}
            <form method="post" action="/api/start" style={{ display: 'grid', gap: 14 }}>
              <input name="company_site" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: -9999 }} aria-hidden="true" />
              <label style={label}>Agency name<input name="agency" required style={box} /></label>
              <label style={label}>Email where new applicants should land<input name="email" type="email" required autoComplete="email" style={box} /></label>
              <label style={label}>Phone applicants can call (optional)<input name="phone" type="tel" style={box} /></label>
              <label style={label}>Link to your job board<input name="board" placeholder="youragency.com/jobs" style={box} /></label>
              <label style={label}>Which openings matter most right now? (optional)<textarea name="jobs" rows={3} style={{ ...box, resize: 'vertical' as const }} /></label>
              <button type="submit" style={{ padding: '16px 20px', borderRadius: 999, border: 0, background: '#1d1a16', color: '#fff', font: '700 18px Arial, Helvetica, sans-serif', cursor: 'pointer' }}>Set me up</button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
