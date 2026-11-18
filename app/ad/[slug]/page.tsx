import type { Metadata } from 'next'

// An agency's ad page. Nothing about an agency lives in this codebase: the page details and the videos are read from
// storage when the link is opened, so a new agency needs an upload (scripts/ad_publish.py), never a site update.
export const metadata: Metadata = { title: 'Your ad · MONTERO TEAM', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Ad = { agency: string; job: string; facts: string; caption: string; expires?: string; versions: { name: string; about: string; file: string }[] }
const STORE = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfaqxsuscjtabsvrhlrd.supabase.co'}/storage/v1/object/public/ads`

async function load(slug: string): Promise<Ad | null> {
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return null
  try {
    const r = await fetch(`${STORE}/${slug}/meta.json`, { cache: 'no-store' })
    if (!r.ok) return null
    const ad = (await r.json()) as Ad
    if (ad.expires && ad.expires < new Date().toISOString().slice(0, 10)) return null
    return ad && Array.isArray(ad.versions) ? ad : null
  } catch { return null }
}

const wrap = { minHeight: '100vh', background: '#15110d', color: '#f4efe6', font: '16px/1.55 Arial, Helvetica, sans-serif', padding: '32px 16px 56px' }
const card = { background: '#211b15', border: '1px solid #3a3128', borderRadius: 14, padding: 14 }
const btn = { display: 'block', marginTop: 12, padding: '13px 20px', borderRadius: 999, background: '#fff', color: '#15110d', fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const }
const foot = <p style={{ marginTop: 30, fontSize: 13, color: '#8a8275' }}>Montero Team · 475-977-1707 · ai@montero.cool · montero.cool</p>

export default async function Page({ params }: { params: { slug: string } }) {
  const ad = await load(params.slug)
  if (!ad) return (
    <main style={wrap}><div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>This ad is no longer online</h1>
      <p style={{ color: '#b9ad9a' }}>We keep each ad up for a month. Reply to the email we sent you, or write to ai@montero.cool, and we will send a fresh one for whichever opening matters most now.</p>
      {foot}
    </div></main>
  )
  const one = ad.versions.length === 1, base = `${STORE}/${params.slug}`
  return (
    <main style={wrap}>
      <div style={{ maxWidth: one ? 560 : 1040, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Your {ad.job} ad{one ? ', ready to post' : ', three ways'}</h1>
        <p style={{ margin: '0 0 14px', color: '#b9ad9a', maxWidth: 640 }}>{ad.facts} {one ? 'It plays here, and the button under it saves the file to your phone or computer.' : 'Each one plays here, and the button under it saves the file to your phone or computer.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: one ? 'minmax(0, 340px)' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, margin: '26px 0 34px' }}>
          {ad.versions.map((v) => (
            <div key={v.file} style={card}>
              {one ? null : <><h2 style={{ fontSize: 18, margin: '0 0 4px' }}>{v.name}</h2><p style={{ fontSize: 14, margin: '0 0 12px', color: '#b9ad9a' }}>{v.about}</p></>}
              <video src={`${base}/${v.file}.mp4`} poster={`${base}/${v.file}.jpg`} controls playsInline preload="metadata" style={{ width: '100%', borderRadius: 10, background: '#000', display: 'block', aspectRatio: '9 / 16' }} />
              <a href={`${base}/${v.file}.mp4?download=${params.slug}-${v.file}.mp4`} style={btn}>{one ? 'Download the video' : 'Download this one'}</a>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Caption, ready to paste</h2>
        <p style={{ margin: '0 0 22px', padding: '12px 14px', border: '1px solid #3a3128', borderRadius: 10, background: '#211b15', maxWidth: 640 }}>{ad.caption}</p>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>How to post it</h2>
        <ol style={{ margin: '0 0 26px', paddingLeft: 22, color: '#d9cfbe', maxWidth: 640 }}>
          <li style={{ marginBottom: 8 }}>Download it and post it as a Reel on Instagram and Facebook.</li>
          <li style={{ marginBottom: 8 }}>Paste the caption above.</li>
          <li style={{ marginBottom: 8 }}>Share it to your local jobs groups on Facebook the same day.</li>
        </ol>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Want one every week?</h2>
        <p style={{ margin: '0 0 4px', color: '#b9ad9a', maxWidth: 640 }}>A new ad each Monday for the opening you most want filled, and an apply page that answers every applicant for you.</p>
        <a href="/weekly" style={{ ...btn, maxWidth: 300 }}>See how it works</a>
        {foot}
      </div>
    </main>
  )
}
