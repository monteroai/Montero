import { statesOf, type Format, type Reel } from './reel'

// Turns one Reel (what the builder edits) into the props each preview composition takes.
export const FORMAT_LABEL: Record<Format, { name: string; tag: string }> = {
  jobmap: { name: 'Job Map', tag: 'All roles on a map' },
  departures: { name: 'Departures', tag: 'Hot-jobs board' },
  jobdrop: { name: 'Job Drop', tag: 'One role' },
}

const board = (s: string, n: number) => s.toUpperCase().replace(/[^A-Z0-9$/\-.:' ]/g, '').slice(0, n).trim()
const boardPay = (p: string) => { const x = p.toUpperCase().replace(/,/g, ''); return x.length <= 6 ? x : x.replace(/\/.*$/, '').slice(0, 6) }

export function propsFor(format: Format, r: Reel, pick = 0) {
  if (format === 'departures') {
    const n = Math.min(r.jobs.length, 6)
    const name = board(r.agency, 17)
    return {
      agency: r.agency, preview: true,
      jobs: r.jobs.slice(0, 6).map((j) => [board(j.role, 17), board(`${j.city} ${j.st}`, 12), boardPay(/^\$/.test(j.pay) ? j.pay : '')]),
      finalCall: n > 1 ? 1 : 0, filled: n - 1, filledIn: '',
      message: ['', 'APPLY BEFORE', 'IT DEPARTS', '', name, r.site ? board(r.site, 17) : 'LINK IN BIO'],
    }
  }
  if (format === 'jobdrop') {
    const j = r.jobs[Math.min(pick, r.jobs.length - 1)]
    return {
      agency: r.agency, role: j.role, town: `${j.city}, ${j.st}`, pay: j.pay, shift: j.type, status: 'Hiring now',
      perks: [j.type, `${j.city}, ${j.st}`, 'Apply in 60 seconds'], brand: r.brand, preview: true,
    }
  }
  return { ...r, states: statesOf(r), preview: true, sample: false }
}
