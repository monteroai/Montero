import { NextResponse } from 'next/server'
import { storeReady, viewSave } from '@/lib/make/store'

// Counts real views of a pre-made job video (montero.cool/v/<slug>). The page calls this after the video has played
// for a few seconds in a real browser, so link scanners that only fetch the page are not counted. No cookies, no personal data.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let j: { slug?: string; kind?: string } = {}
  try { j = await req.json() } catch { /* empty */ }
  const slug = String(j.slug || ''); const kind = ['view', 'sound', 'ask'].includes(String(j.kind)) ? String(j.kind) : 'view'
  if (!/^[a-z0-9-]{2,60}$/.test(slug) || !storeReady()) return NextResponse.json({ ok: false }, { status: 400 })
  const ua = (req.headers.get('user-agent') || '').slice(0, 160)
  await viewSave(slug, { kind, at: new Date().toISOString(), ua })
  return NextResponse.json({ ok: true })
}
