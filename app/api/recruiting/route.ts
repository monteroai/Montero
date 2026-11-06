import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/portal/email'
import { clean, encodeReel } from '@/lib/recruiting/reel'

// Leads from /recruiting, two kinds: an HD file of the reel they built, or their own idea (offered 2 free reels).
// Emails ai@montero.cool (Resend) with the reel spec and a link that reopens it, and mirrors to the n8n contact
// webhook; succeeds if either lands.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  const email = String(b.email || '').slice(0, 160), idea = String(b.idea || '').slice(0, 3000)
  const name = String(b.name || '').slice(0, 120), phone = String(b.phone || '').slice(0, 40)
  const reel = clean(b.reel)
  const agency = String(b.agency || reel?.agency || '').slice(0, 120), site = String(b.site || reel?.site || '').slice(0, 200)
  const roles = String(b.roles || '').slice(0, 2000) || (reel?.jobs.map((j) => `${j.role}, ${j.city} ${j.st}, ${j.pay}, ${j.type}`).join('\n') ?? '')
  if (!/^\S+@\S+\.\S+$/.test(email) || !(roles || idea)) return NextResponse.json({ error: 'Add your work email so we know where to reach you.' }, { status: 400 })

  const kind = idea ? 'Custom idea (2 free reels offered)' : 'HD reel request'
  const link = reel ? `https://montero.cool/recruiting?r=${encodeReel(reel)}` : ''
  const text = [
    `${kind} (montero.cool/recruiting)`, '',
    ...(idea ? ['Their idea:', idea, '', `Name: ${name}`, `Phone: ${phone}`] : []),
    `Agency: ${agency}`, `Website: ${site}`, `Email: ${email}`, `Format: ${reel?.format || ''}`, `Brand: ${reel?.brand || ''}`, '',
    'Roles:', roles, '', `Their preview: ${link}`, '', 'Reel spec:', reel ? JSON.stringify(reel) : '',
  ].join('\n')
  const [mail, hook] = await Promise.all([
    sendEmail({ to: process.env.FREE_REEL_NOTIFY_EMAIL || 'ai@montero.cool', subject: `${idea ? 'Custom idea' : 'HD reel request'}: ${agency || name}`, text, replyTo: email }),
    fetch('https://montero-cool.app.n8n.cloud/webhook/agent-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || agency, email, message: text, source: 'montero.cool/recruiting', reel }),
    }).then((r) => r.ok).catch(() => false),
  ])
  if (!mail.ok && !hook) return NextResponse.json({ error: 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
