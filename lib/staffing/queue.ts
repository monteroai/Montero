// Outgoing mail for the staffing pages. This repository is public, so no sending key lives here.
// The site drops each message into a private storage folder (only the server's service key can write there),
// then pings the automation that empties the folder and sends from ai@montero.cool as "Montero Team".
export type Mail = { to: string; subject: string; text: string; replyTo?: string }

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const H = () => ({ Authorization: `Bearer ${KEY}`, apikey: KEY })
export const mailReady = () => Boolean(URL_ && KEY)

export async function enqueue(mails: Mail[]): Promise<boolean> {
  if (!mailReady()) return false
  try {
    for (const m of mails) {
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.json`
      const r = await fetch(`${URL_}/storage/v1/object/mailq/${name}`, { method: 'POST', headers: { ...H(), 'Content-Type': 'application/json' }, body: JSON.stringify(m) })
      if (!r.ok) return false
    }
    const cfg = await fetch(`${URL_}/storage/v1/object/mailq/_config.json`, { headers: H(), cache: 'no-store' })
    if (cfg.ok) {
      const { hook } = (await cfg.json()) as { hook?: string }
      if (hook) await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null)
    }
    return true
  } catch { return false }
}
