import { NextResponse } from 'next/server'
import { enqueue, mailReady } from '@/lib/staffing/queue'
import { isEmail, SITE } from '@/lib/staffing/token'
import { cleanProps } from '@/lib/make/ad'
import { sign, storeReady, trialKey, trialUsed, trialSave } from '@/lib/make/store'

// The visitor asks for the video file. The first one per company is free: we email a private link to the address they give,
// which proves the address is real. A company that already had its free one is pointed to the paid plan.
export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad' }, { status: 400 }) }
  if (body.company_site) return NextResponse.json({ ok: true })                      // honeypot
  const email = String(body.email || '').trim().toLowerCase().slice(0, 120)
  if (!isEmail(email)) return NextResponse.json({ error: 'email' }, { status: 400 })
  if (!mailReady() || !storeReady()) return NextResponse.json({ error: 'down' }, { status: 503 })
  const props = cleanProps(body.props || {})
  const key = trialKey(email)
  if (await trialUsed(key)) return NextResponse.json({ used: true })

  const link = `${SITE}/video/get/${sign({ p: props, e: email, t: Date.now() })}`
  const sent = await enqueue([{
    to: email, replyTo: 'ai@montero.cool', subject: `Your ${props.title} video`,
    text: [`Here is your video for the ${props.title} job:`, link, '',
      'Open the link on the device you want to save it to. The video is made on the spot and the download button appears under it.', '',
      'This first one is free. For a new ad every week, see montero.cool/weekly, or reply to this email with a posting and tell me what you thought of the first one.', '',
      'Montero Team', '475-977-1707', 'ai@montero.cool', 'montero.cool'].join('\n'),
  }, {
    to: 'ai@montero.cool', replyTo: email, subject: `Job video claimed: ${props.agency}, ${props.title}`,
    text: [`Email: ${email}`, `Agency: ${props.agency}`, `Job: ${props.title}`, `Pay: ${props.rate ?? 'not given'}`, `Shift: ${props.shift}`, `Came from: ${String(body.from || 'video page').slice(0, 80)}`, '', link].join('\n'),
  }])
  if (!sent) return NextResponse.json({ error: 'down' }, { status: 503 })
  await trialSave(key, { email, at: new Date().toISOString(), agency: props.agency, title: props.title, from: String(body.from || '').slice(0, 80) })
  return NextResponse.json({ ok: true })
}
