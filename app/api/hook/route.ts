import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/portal/email'

// Onboarding for the $497 hook reel (montero.cool/hook/start). Emails ai@montero.cool with the brief, mirrors to n8n.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  const f = (k: string, n = 300) => String(b[k] || '').trim().slice(0, n)
  const brief = { business: f('business', 120), name: f('name', 120), email: f('email', 160), instagram: f('instagram', 80), dream: f('dream', 120),
    service: f('service', 160), phone: f('phone', 120), clips: f('clips', 500), notes: f('notes', 2000) }
  if (!/^\S+@\S+\.\S+$/.test(brief.email)) return NextResponse.json({ error: 'Add your email so we can send you the first cut.' }, { status: 400 })
  if (!brief.business || !brief.dream) return NextResponse.json({ error: 'Add your business name and what your customers dream of owning.' }, { status: 400 })

  const text = [
    'HOOK REEL BRIEF (montero.cool/hook/start)', '',
    `Business: ${brief.business}`, `Name: ${brief.name}`, `Email: ${brief.email}`, `Instagram: ${brief.instagram}`, '',
    `Line: "What actually hurts is not owning ${brief.dream}... but if you do, we can ${brief.service || 'help'}."`, '',
    `Phone/site on end card: ${brief.phone || '-'}`, `Clips: ${brief.clips || '(none: full 3D version)'}`, '', 'Notes:', brief.notes || '-',
  ].join('\n')
  const [mail, hook] = await Promise.all([
    sendEmail({ to: process.env.FREE_REEL_NOTIFY_EMAIL || 'ai@montero.cool', subject: `HOOK REEL brief: ${brief.business}`, text, replyTo: brief.email }),
    fetch('https://montero-cool.app.n8n.cloud/webhook/agent-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: brief.name || brief.business, email: brief.email, message: text, source: 'montero.cool/hook', brief }),
    }).then((r) => r.ok).catch(() => false),
  ])
  if (!mail.ok && !hook) return NextResponse.json({ error: 'That didn’t go through. Email ai@montero.cool and we’ll take it from there.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
