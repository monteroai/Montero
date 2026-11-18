import { NextResponse } from 'next/server'
import { enqueue, mailReady, type Mail } from '@/lib/staffing/queue'
import { readToken, clean, isEmail, SITE } from '@/lib/staffing/token'

// Tells us (true/false only) whether the mail queue is connected on this deployment.
export async function GET() { return NextResponse.json({ ready: mailReady() }) }

// An applicant fills in the agency's apply page. Within about a minute: the applicant gets a reply in the agency's name,
// and the agency gets the applicant's details with a reply-to that goes straight to the applicant.
export async function POST(req: Request) {
  const f = await req.formData()
  const token = clean(f.get('token'), 2000), ag = readToken(token)
  const back = `${SITE}/apply/${encodeURIComponent(token)}`
  if (!ag) return NextResponse.redirect(`${SITE}/start`, 303)
  if (clean(f.get('company_site'))) return NextResponse.redirect(`${back}?sent=1`, 303)             // honeypot
  const name = clean(f.get('name'), 80), phone = clean(f.get('phone'), 30), email = clean(f.get('email'), 120).toLowerCase(), job = clean(f.get('job'), 100) || 'an open job'
  if (!name || (!phone && !isEmail(email)) || f.get('ok') !== 'yes') return NextResponse.redirect(`${back}?error=1`, 303)
  const first = name.split(/\s+/)[0]
  const mails: Mail[] = []

  if (isEmail(email)) {
    const lines = [`Hi ${first},`, '', `${ag.n} has your application for ${job}. A recruiter will reach out to you${phone ? ` at ${phone}` : ''}.`]
    if (ag.b) lines.push('', `To speed things up, you can also fill in the full application here: ${ag.b}`)
    if (ag.p) lines.push('', `Questions? Call ${ag.p}.`)
    lines.push('', `You can reply to this email and it goes straight to ${ag.n}.`)
    mails.push({ to: email, replyTo: ag.e, subject: `${ag.n} got your application`, text: lines.join('\n') })
  }
  mails.push({
    to: ag.e, ...(isEmail(email) ? { replyTo: email } : {}), subject: `New applicant: ${name}, ${job}`,
    text: [`${name} just applied for ${job}.`, '', `Phone: ${phone || 'not given'}`, `Email: ${email || 'not given'}`, '',
      isEmail(email) ? 'They already got a reply saying you have their application. Reply to this email to write to them directly.' : 'They gave no email, so they have not had a reply yet. Call them.', '', 'Sent by your Montero Team apply page.'].join('\n'),
  })
  const ok = await enqueue(mails)
  return NextResponse.redirect(`${back}?${ok ? 'sent' : 'error'}=1`, 303)
}
