import { createHmac } from 'crypto'

// An agency's apply page is one signed link. No database and no deploy per client:
// the link itself carries the agency's details, and the signature stops anyone from forging one.
export type Agency = { n: string; e: string; p?: string; b?: string }   // name, email for applicants, phone, job board link

const secret = () => process.env.APPLY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64url')
const sig = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url').slice(0, 22)

export function makeToken(a: Agency): string {
  const body = b64(JSON.stringify(a))
  return `${body}.${sig(body)}`
}

export function readToken(token: string): Agency | null {
  const [body, s] = String(token || '').split('.')
  if (!secret() || !body || !s || sig(body) !== s) return null
  try {
    const a = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    return a && typeof a.n === 'string' && typeof a.e === 'string' ? a : null
  } catch { return null }
}

export const clean = (v: unknown, max = 120) => String(v ?? '').replace(/[\r\n<>]/g, ' ').trim().slice(0, max)
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
export const SITE = 'https://montero.cool'
