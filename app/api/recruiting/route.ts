import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/portal/email'
import { clean, encodeReel } from '@/lib/recruiting/reel'

// Lead from /recruiting: the visitor built a reel and wants the HD file. Emails ai@montero.cool (Resend) with the
// reel spec and a link that reopens it, and mirrors to the n8n contact webhook; succeeds if either lands.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  const email = String(b.email || '').slice(0, 160)
  const reel = clean(b.reel)
  const agency = String(b.agency || reel?.agency || '').slice(0, 120), site = String(b.site || reel?.site || '').slice(0, 200)
  const roles = String(b.roles || '').slice(0, 2000) || (reel?.jobs.map((j) => `${j.role}, ${j.city} ${j.st}, ${j.pay}, ${j.type}`).join('\n') ?? '')
  if (!/^\S+@\S+\.\S+$/.test(email) || !roles) return NextResponse.json({ error: 'Add your work email so we know where to send it.' }, { status: 400 })

  const link = reel ? `https://montero.cool/recruiting?r=${encodeReel(reel)}` : ''
  const text = `HD reel request (montero.cool/recruiting)\n\nAgency: ${agency}\nWebsite: ${site}\nEmail: ${email}\nBrand: ${reel?.brand || ''}\n\nRoles:\n${roles}\n\nTheir preview: ${link}\n\nReel spec (JobMap props):\n${reel ? JSON.stringify(reel) : ''}`
  const [mail, hook] = await Promise.all([
    sendEmail({ to: process.env.FREE_REEL_NOTIFY_EMAIL || 'ai@montero.cool', subject: `HD reel request: ${agency}`, text, replyTo: email }),
    fetch('https://montero-cool.app.n8n.cloud/webhook/agent-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: agency, email, message: text, source: 'montero.cool/recruiting', reel }),
    }).then((r) => r.ok).catch(() => false),
  ])
  if (!mail.ok && !hook) return NextResponse.json({ error: 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
