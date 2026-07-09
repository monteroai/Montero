import crypto from 'crypto'

// Best-effort live text push for Montero-hosted static sites on Netlify.
// Given the site's public URL and a set of {old, new} text swaps, it:
//   1. resolves the Netlify site by domain,
//   2. pulls the current deploy's file manifest (all shas),
//   3. fetches each HTML file, applies the swaps, recomputes its sha,
//   4. creates a digest deploy declaring every file (unchanged files keep
//      their existing sha so Netlify reuses them), and uploads only the
//      changed HTML.
// Returns a structured result; ANY failure returns ok:false so the caller
// falls back to the team-email path — we never claim a publish we didn't do.

const NETLIFY_API = 'https://api.netlify.com/api/v1'

type Swap = { old: string; new: string }
type PushResult = { ok: boolean; applied: number; missed: number; error?: string; siteName?: string }

function sha1(content: string): string {
  return crypto.createHash('sha1').update(content, 'utf8').digest('hex')
}

function normHost(s: string): string {
  return s.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').toLowerCase()
}

async function findSite(token: string, host: string) {
  const r = await fetch(`${NETLIFY_API}/sites?per_page=100`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(`netlify sites list ${r.status}`)
  const sites = await r.json() as Array<Record<string, unknown>>
  const target = normHost(host)
  return sites.find(s => {
    const cands = [s.custom_domain, s.ssl_url, s.url, `${s.name}.netlify.app`, ...((s.domain_aliases as string[]) || [])]
      .filter(Boolean).map(x => normHost(String(x)))
    return cands.includes(target)
  })
}

export async function pushTextToLiveSite(websiteUrl: string, swaps: Swap[]): Promise<PushResult> {
  const token = process.env.NETLIFY_AUTH_TOKEN
  if (!token) return { ok: false, applied: 0, missed: swaps.length, error: 'NETLIFY_AUTH_TOKEN not set' }
  const usable = swaps.filter(s => s.old && s.new && s.old !== s.new)
  if (usable.length === 0) return { ok: false, applied: 0, missed: 0, error: 'no usable swaps' }

  try {
    const host = normHost(websiteUrl)
    const site = await findSite(token, host)
    if (!site) return { ok: false, applied: 0, missed: usable.length, error: `no Netlify site for ${host}` }
    const siteId = site.id as string
    const base = String(site.ssl_url || site.url || websiteUrl).replace(/\/$/, '')

    // Current file manifest (path → sha)
    const mr = await fetch(`${NETLIFY_API}/sites/${siteId}/files`, { headers: { Authorization: `Bearer ${token}` } })
    if (!mr.ok) throw new Error(`files manifest ${mr.status}`)
    const manifestRaw = await mr.json() as Array<{ id?: string; path?: string; sha: string }>
    const digest: Record<string, string> = {}
    for (const f of manifestRaw) {
      const p = (f.path || f.id || '').startsWith('/') ? (f.path || f.id)! : `/${f.path || f.id}`
      digest[p] = f.sha
    }

    // Apply swaps to each HTML file; track which content changed.
    const changed: Record<string, string> = {}
    let applied = 0
    const htmlPaths = Object.keys(digest).filter(p => p.endsWith('.html'))
    for (const p of htmlPaths) {
      const fetchUrl = p === '/index.html' ? `${base}/` : `${base}${p}`
      const cr = await fetch(fetchUrl)
      if (!cr.ok) continue
      let html = await cr.text()
      let touched = false
      for (const s of usable) {
        if (html.includes(s.old)) { html = html.split(s.old).join(s.new); applied++; touched = true }
      }
      if (touched) { changed[p] = html; digest[p] = sha1(html) }
    }

    if (applied === 0) return { ok: false, applied: 0, missed: usable.length, error: 'text not found verbatim in site HTML', siteName: site.name as string }

    // Create a digest deploy; Netlify replies with the shas it still needs.
    const dr = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: digest }),
    })
    if (!dr.ok) throw new Error(`create deploy ${dr.status}`)
    const deploy = await dr.json() as { id: string; required?: string[] }
    const required = new Set(deploy.required || [])

    // Upload each changed file whose sha Netlify is missing.
    for (const [p, content] of Object.entries(changed)) {
      if (!required.has(digest[p])) continue
      const ur = await fetch(`${NETLIFY_API}/deploys/${deploy.id}/files${p}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
        body: content,
      })
      if (!ur.ok) throw new Error(`upload ${p} ${ur.status}`)
    }

    return { ok: true, applied, missed: usable.length - applied, siteName: site.name as string }
  } catch (e) {
    return { ok: false, applied: 0, missed: usable.length, error: e instanceof Error ? e.message : 'unknown' }
  }
}
