import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/portal/email'

// Free-sample request from /recruiting. Emails ai@montero.cool (Resend) and mirrors to the n8n contact
// webhook; succeeds if either lands.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  const agency = String(b.agency || '').slice(0, 120), email = String(b.email || '').slice(0, 160)
  const site = String(b.site || '').slice(0, 200), roles = String(b.roles || '').slice(0, 2000), posts = String(b.posts || '').slice(0, 120)
  if (!agency || !/^\S+@\S+\.\S+$/.test(email) || !roles) return NextResponse.json({ error: 'Add your agency, email and at least one role.' }, { status: 400 })

  const text = `Free sample reel request (montero.cool/recruiting)\n\nAgency: ${agency}\nWebsite: ${site}\nEmail: ${email}\nPosts on: ${posts}\n\nRoles:\n${roles}`
  const [mail, hook] = await Promise.all([
    sendEmail({ to: process.env.FREE_REEL_NOTIFY_EMAIL || 'ai@montero.cool', subject: `Sample reel request: ${agency}`, text, replyTo: email }),
    fetch('https://montero-cool.app.n8n.cloud/webhook/agent-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: agency, email, message: text, source: 'montero.cool/recruiting' }),
    }).then((r) => r.ok).catch(() => false),
  ])
  if (!mail.ok && !hook) return NextResponse.json({ error: 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
