// Shared shape of a Job Map reel: what the builder edits, the API returns, share links carry and the HD render takes.
export type Job = { role: string; city: string; st: string; lon: number; lat: number; pay: string; type: string }
export const FORMATS = ['jobmap', 'departures', 'jobdrop'] as const
export type Format = (typeof FORMATS)[number]
export type Reel = { agency: string; site: string; brand: string; jobs: Job[]; format?: Format }

export const MAX_JOBS = 6

export const ST: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// What the empty builder shows before anyone types.
export const STARTER: Reel = {
  agency: 'Your Agency', site: 'youragency.com', brand: '#1E4BFF',
  jobs: [
    { role: 'Forklift Operator', city: 'Newark', st: 'NJ', lon: -74.172, lat: 40.735, pay: '$24/hr', type: 'Full-time' },
    { role: 'Warehouse Lead', city: 'Albany', st: 'NY', lon: -73.756, lat: 42.652, pay: '$26/hr', type: '1st shift' },
    { role: 'CNC Machinist', city: 'Buffalo', st: 'NY', lon: -78.878, lat: 42.886, pay: '$31/hr', type: 'Full-time' },
  ],
}

export const statesOf = (r: Reel) => r.jobs.map((j) => ST[j.st]).filter((v, i, a) => v && a.indexOf(v) === i)

const str = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

// Coerces anything (API reply, share link, request body) into a safe Reel, or null.
export function clean(x: any): Reel | null {
  if (!x || typeof x !== 'object' || !Array.isArray(x.jobs)) return null
  const jobs = x.jobs.slice(0, MAX_JOBS).map((j: any) => ({
    role: str(j?.role, 40), city: str(j?.city, 30), st: str(j?.st, 2).toUpperCase(),
    lon: Number(j?.lon), lat: Number(j?.lat), pay: str(j?.pay, 16) || 'Apply today', type: str(j?.type, 16) || 'Open now',
  })).filter((j: Job) => j.role && j.city && ST[j.st] && isFinite(j.lon) && isFinite(j.lat))
  if (!jobs.length) return null
  const brand = /^#[0-9a-f]{6}$/i.test(String(x.brand)) ? String(x.brand) : STARTER.brand
  const format = FORMATS.includes(x.format) ? (x.format as Format) : 'jobmap'
  return { agency: str(x.agency, 40) || STARTER.agency, site: str(x.site, 40).replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''), brand, jobs, format }
}

// Share links: /recruiting?r=<base64url JSON>. Short keys keep the URL under ~600 chars for six jobs.
export function encodeReel(r: Reel) {
  const j = JSON.stringify({ a: r.agency, s: r.site, b: r.brand, f: r.format, j: r.jobs.map((x) => [x.role, x.city, x.st, +x.lon.toFixed(3), +x.lat.toFixed(3), x.pay, x.type]) })
  return btoa(unescape(encodeURIComponent(j))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function decodeReel(s: string): Reel | null {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))))
    return clean({ agency: o.a, site: o.s, brand: o.b, format: o.f, jobs: (o.j || []).map((x: any[]) => ({ role: x[0], city: x[1], st: x[2], lon: x[3], lat: x[4], pay: x[5], type: x[6] })) })
  } catch { return null }
}
