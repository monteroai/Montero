import { NextResponse } from 'next/server'
import { lookup } from 'dns/promises'
import { parsePosting } from '@/lib/make/parse'

// Reads a job posting from a link or from pasted text and returns the fields the ad needs.
const PRIVATE = /^(0\.|10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|::1$|f[cd][0-9a-f]{2}:|fe80:|::ffff:)/i

async function safeUrl(input: string): Promise<URL | null> {
  let u: URL
  try { u = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input) } catch { return null }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port))) return null
  const host = u.hostname.toLowerCase()
  if (host === 'localhost' || !host.includes('.') || /\.(local|internal|lan|home)$/.test(host) || /^[\d.]+$/.test(host) || host.includes(':')) return null
  try { const all = await lookup(host, { all: true }); if (!all.length || all.some((a) => PRIVATE.test(a.address))) return null } catch { return null }
  return u
}

export async function POST(req: Request) {
  let input = ''
  try { input = String((await req.json()).input || '').trim().slice(0, 20000) } catch { return NextResponse.json({ error: 'bad' }, { status: 400 }) }
  if (input.length < 8) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const looksLikeLink = !/\s/.test(input) && (/^https?:\/\//i.test(input) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(input))
  if (!looksLikeLink) return NextResponse.json({ from: 'text', ...parsePosting(input) })

  const url = await safeUrl(input)
  if (!url) return NextResponse.json({ error: 'link' }, { status: 400 })
  try {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 8000)
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MonteroJobVideo/1.0; +https://montero.cool/video)', Accept: 'text/html,*/*' } })
    clearTimeout(timer)
    if (!r.ok || !/text\/html|text\/plain|xhtml/i.test(r.headers.get('content-type') || '')) return NextResponse.json({ error: 'blocked' }, { status: 422 })
    const html = (await r.text()).slice(0, 1_500_000)
    const found = parsePosting(html, url.toString())
    // Some job boards only load the posting with scripts, so the page we get is an empty shell.
    if (!found.rate && !found.shift && found.title.length < 4) return NextResponse.json({ error: 'blocked' }, { status: 422 })
    if (found.kind !== 'job') return NextResponse.json({ error: found.kind }, { status: 422 })
    return NextResponse.json({ from: 'link', ...found })
  } catch { return NextResponse.json({ error: 'blocked' }, { status: 422 }) }
}
