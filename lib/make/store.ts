import { createHmac } from 'crypto'

// Signed links and the one-free-per-company record for the job video maker. No key lives in this public repository:
// signing and storage both use the server's own service key from the site environment.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const secret = () => process.env.APPLY_SECRET || KEY
const H = () => ({ Authorization: `Bearer ${KEY}`, apikey: KEY })
export const storeReady = () => Boolean(URL_ && KEY)

const sig = (body: string) => createHmac('sha256', secret()).update('video:' + body).digest('base64url').slice(0, 22)
export function sign(data: object): string { const body = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url'); return `${body}.${sig(body)}` }
export function unsign<T>(token: string): T | null {
  const [body, s] = String(token || '').split('.')
  if (!secret() || !body || !s || sig(body) !== s) return null
  try { return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T } catch { return null }
}

const FREEMAIL = new Set(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'live.com', 'msn.com', 'comcast.net', 'me.com', 'proton.me', 'protonmail.com', 'att.net', 'verizon.net', 'sbcglobal.net', 'ymail.com'])
// One free video per company: the key is the email's domain, or the whole address for personal mailboxes.
export const trialKey = (email: string) => { const [user, dom] = email.toLowerCase().split('@'); return (FREEMAIL.has(dom) ? `${user}_at_${dom}` : dom).replace(/[^a-z0-9._-]/g, '_').slice(0, 120) }

export async function trialUsed(key: string): Promise<boolean> {
  const r = await fetch(`${URL_}/storage/v1/object/trials/${key}.json`, { headers: H(), cache: 'no-store' })
  return r.ok
}
export async function trialSave(key: string, data: object): Promise<boolean> {
  const r = await fetch(`${URL_}/storage/v1/object/trials/${key}.json`, { method: 'POST', headers: { ...H(), 'Content-Type': 'application/json', 'x-upsert': 'true' }, body: JSON.stringify(data) })
  return r.ok
}
// One small file per real view of a pre-made video link (see app/api/video/seen). Read back by scripts/outreach_scorecard.py.
export async function viewSave(slug: string, data: object): Promise<boolean> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const r = await fetch(`${URL_}/storage/v1/object/trials/views/${slug}/${name}.json`, { method: 'POST', headers: { ...H(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  return r.ok
}
