import { NextResponse } from 'next/server'
import { enqueue, mailReady } from '@/lib/staffing/queue'
import { makeToken, clean, isEmail, SITE } from '@/lib/staffing/token'

// Onboarding: the agency fills in a short form once. They get their apply page link by email within seconds; we get the details.
export async function POST(req: Request) {
  const f = await req.formData()
  if (clean(f.get('company_site'))) return NextResponse.redirect(`${SITE}/start?done=1`, 303)   // honeypot
  const name = clean(f.get('agency'), 80), email = clean(f.get('email'), 120).toLowerCase(), phone = clean(f.get('phone'), 30), board = clean(f.get('board'), 200), jobs = clean(f.get('jobs'), 400)
  if (!name || !isEmail(email)) return NextResponse.redirect(`${SITE}/start?error=1`, 303)
  if (!mailReady()) return NextResponse.redirect(`${SITE}/start?error=2`, 303)
  const link = `${SITE}/apply/${makeToken({ n: name, e: email, ...(phone ? { p: phone } : {}), ...(board ? { b: board } : {}) })}`

  const ok = await enqueue([{
    to: email, replyTo: 'ai@montero.cool', subject: `${name}: you are set up`,
    text: ['You are set up. Here is what happens now.', '',
      `1. Your apply page is live: ${link}`,
      '   Put this link in your Instagram bio and in the caption when you post an ad. Anyone who applies there gets an instant reply in your name, and their details land in this inbox.', '',
      '2. Every Monday you get a new video ad by email for the opening you most want filled. Reply any time to tell me which job is next.', '',
      '3. There is nothing to install and nothing to connect. To stop, reply "stop".', '', 'Montero Team', '475-977-1707', 'ai@montero.cool', 'montero.cool'].join('\n'),
  }, {
    to: 'ai@montero.cool', replyTo: email, subject: `New staffing client: ${name}`,
    text: [`Agency: ${name}`, `Applicants go to: ${email}`, `Phone: ${phone}`, `Job board: ${board}`, `Jobs they want first: ${jobs}`, '', `Apply page: ${link}`].join('\n'),
  }])
  if (!ok) return NextResponse.redirect(`${SITE}/start?error=2`, 303)
  return NextResponse.redirect(`${SITE}/start?done=1`, 303)
}
