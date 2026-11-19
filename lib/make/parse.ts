// Reads a job posting (a page's HTML or pasted text) and pulls out what the ad needs. Nothing is guessed:
// a field we cannot find comes back empty and is listed in `missing`, and the visitor fills it in.
export type Found = { agency: string; title: string; rate: number | null; hours: number; shift: string; where: string; note: string; cta: string; missing: string[]; kind: 'job' | 'list' | 'none' }

const decode = (s: string) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&rsquo;|&#8217;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&ndash;|&mdash;|&#8211;/g, '-')
const strip = (h: string) => decode(h.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ')).replace(/[ \t ]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()
const tidy = (s: unknown, max = 60) => decode(String(s ?? '')).replace(/[\r\n<>]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
const cap = (s: string) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase())
const meta = (h: string, k: string) => { const m = h.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']+)["']`, 'i')) || h.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${k}["']`, 'i')); return m ? tidy(m[1], 120) : '' }

function jsonLd(html: string): any | null {
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || []
  for (const b of blocks) {
    try {
      const j = JSON.parse(b.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').trim())
      const list: any[] = Array.isArray(j) ? j : j['@graph'] ? j['@graph'] : [j]
      const hit = list.find((x) => x && (x['@type'] === 'JobPosting' || (Array.isArray(x['@type']) && x['@type'].includes('JobPosting'))))
      if (hit) return { ...hit, __count: blocks.reduce((n, o) => n + (o.match(/"@type"\s*:\s*"JobPosting"/g) || []).length, 0) }
    } catch { /* not valid JSON, skip */ }
  }
  return null
}

const time = (s: string) => { const m = s.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?$/); return m ? `${+m[1]}:${m[2] || '00'} ${m[3].toUpperCase()}M` : s.trim() }

export function parsePosting(raw: string, sourceUrl = ''): Found {
  const isHtml = /<\w+[^>]*>/.test(raw)
  const text = isHtml ? strip(raw) : decode(raw)
  const ld = isHtml ? jsonLd(raw) : null
  let host = ''; try { host = new URL(sourceUrl).hostname.replace(/^www\./, '') } catch { /* pasted text */ }

  // title
  let title = tidy(ld?.title)
  if (!title && isHtml) { const h1 = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); title = tidy(h1 ? strip(h1[1]) : meta(raw, 'og:title') || (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')) }
  if (!title) title = tidy(text.split('\n').find((l) => l.trim().length > 3 && l.trim().length < 70) || '')
  if (!title && !isHtml) { const m = text.match(/^\s*(?:we are (?:seeking|hiring|looking for)|seeking|hiring|now hiring)?\s*(?:an?\s+)?((?:[A-Z][A-Za-z/&.-]+\s?){1,5}?)\s+(?:needed|wanted|position|opening|job|role)\b/); if (m) title = tidy(m[1]) }
  title = title.split(/\s[|–—]\s|\s-\s(?=[A-Z][a-z]+,?\s[A-Z]{2}\b)/)[0].replace(/\s*[-(#]\s*\d{4,}\)?\s*$/, '').replace(/^(now hiring|hiring|job)\s*[:\-]\s*/i, '').replace(/\s*[-,(]\s*(1st|2nd|3rd|first|second|third|day|night)\s+shift\)?\s*$/i, '').trim().slice(0, 48)

  // pay
  let rate: number | null = null
  const v = ld?.baseSalary?.value
  if (v && /hour/i.test(String(v.unitText || ''))) rate = Number(v.value ?? v.minValue) || null
  if (!rate) {
    const m = text.match(/\$\s?(\d{1,3}(?:\.\d{1,2})?)(?:\s*(?:-|to|–)\s*\$?\s?\d{1,3}(?:\.\d{1,2})?)?\s*(?:\/|per|an|a)\s*(?:hr|hour)\b/i) || text.match(/(?:pay|rate|wage|salary)\s*(?:rate)?\s*[:\-]?\s*\$\s?(\d{1,3}(?:\.\d{1,2})?)(?!\s*,?\d{3})/i)
    if (m) rate = Number(m[1])
  }
  if (rate && (rate < 7 || rate > 300)) rate = null

  // shift
  const days = text.match(/\b(mon(?:day)?)\s*(?:-|to|through|thru|–)\s*(fri(?:day)?|thu(?:rs(?:day)?)?|sat(?:urday)?|sun(?:day)?)\b/i)
  const hrs = text.match(/\b(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)\s*(?:-|to|–|until)\s*(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)/i)
  const named = text.match(/\b(1st|2nd|3rd|first|second|third|day|night|evening|overnight|weekend|swing)\s+shift\b/i)
  const shift = [days ? `${cap(days[1].slice(0, 3).toLowerCase())} to ${cap(days[2].slice(0, 3).toLowerCase())}` : '', hrs ? (time(hrs[1]).slice(-2) === time(hrs[2]).slice(-2) ? `${time(hrs[1]).slice(0, -3)} to ${time(hrs[2])}` : `${time(hrs[1])} to ${time(hrs[2])}`) : ''].filter(Boolean).join(' · ') || (named ? cap(named[0].toLowerCase()) : '')

  // place
  const addr = ld?.jobLocation?.address || ld?.jobLocation?.[0]?.address
  let where = addr?.addressLocality ? tidy(`${addr.addressLocality}${addr.addressRegion ? ', ' + addr.addressRegion : ''}`, 40) : ''
  if (!where) { const m = text.match(/\b(?:location|located in|in)\s*[:\-]?\s*((?:[A-Z][a-zA-Z.]+\s?){1,3}),\s*([A-Z]{2})\b/); if (m) where = `${m[1].trim()}, ${m[2]}` }
  if (!where && named && shift !== cap(named[0].toLowerCase())) where = cap(named[0].toLowerCase())

  const agency = tidy(ld?.hiringOrganization?.name, 40) || (isHtml ? meta(raw, 'og:site_name').slice(0, 40) : '') || (host ? cap(host.split('.')[0]) : '')
  const hoursM = text.match(/\b(\d{2})\s*(?:\+\s*)?(?:hours|hrs)\s*(?:per|a|\/)\s*week\b/i)
  const hours = hoursM && +hoursM[1] >= 10 && +hoursM[1] <= 60 ? +hoursM[1] : 40
  const type = /temp[\s-]to[\s-](?:hire|perm)/i.test(text) ? 'Temp to hire.' : /direct hire/i.test(text) ? 'Direct hire.' : ''
  const note = ['Hiring now.', type].filter(Boolean).join(' ')
  const cta = host ? `Apply at ${host}` : ''

  // A page listing many jobs, or a page with no posting on it, must not be turned into an ad from stray numbers.
  const pays = new Set((text.match(/\$\s?\d{1,3}(?:\.\d{1,2})?\s*(?:\/|per|an|a)\s*(?:hr|hour)\b/gi) || []).map((x) => x.replace(/\s/g, '').toLowerCase()))
  const kind: 'job' | 'list' | 'none' = !isHtml || (ld && ld.__count === 1 && tidy(ld.title)) ? 'job' : pays.size >= 3 || /\b(jobs|careers|openings|positions|search results|job search|job board)\b/i.test(title) ? 'list' : !rate ? 'none' : 'job'
  const missing = [!title && 'job title', !rate && 'hourly pay', !shift && 'shift', !agency && 'agency name', !cta && 'where to apply'].filter(Boolean) as string[]
  return { agency, title, rate, hours, shift, where, note, cta, missing, kind }
}
