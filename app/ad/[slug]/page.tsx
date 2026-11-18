import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ADS } from '@/lib/staffing/ads'

export const metadata: Metadata = { title: 'Your ad · MONTERO', robots: { index: false } }
export function generateStaticParams() { return Object.keys(ADS).map((slug) => ({ slug })) }

const card = { background: '#211b15', border: '1px solid #3a3128', borderRadius: 14, padding: 14 }
const btn = { display: 'block', marginTop: 12, padding: '13px 20px', borderRadius: 999, background: '#fff', color: '#15110d', fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const }

export default function Page({ params }: { params: { slug: string } }) {
  const ad = ADS[params.slug]
  if (!ad) notFound()
  return (
    <main style={{ minHeight: '100vh', background: '#15110d', color: '#f4efe6', font: '16px/1.55 Arial, Helvetica, sans-serif', padding: '32px 16px 56px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Your {ad.job} ad, {ad.versions.length === 1 ? 'ready to post' : 'three ways'}</h1>
        <p style={{ margin: '0 0 14px', color: '#b9ad9a', maxWidth: 640 }}>{ad.facts} Each one plays here, and the button under it saves the file to your phone or computer.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, margin: '26px 0 34px' }}>
          {ad.versions.map((v) => (
            <div key={v.file} style={card}>
              <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>{v.name}</h2>
              <p style={{ fontSize: 14, margin: '0 0 12px', color: '#b9ad9a' }}>{v.about}</p>
              <video src={`/ad-media/${v.file}.mp4`} poster={`/ad-media/${v.file}.jpg`} controls playsInline preload="metadata" style={{ width: '100%', borderRadius: 10, background: '#000', display: 'block', aspectRatio: '9 / 16' }} />
              <a href={`/ad-media/${v.file}.mp4`} download={`${v.file}.mp4`} style={btn}>Download this one</a>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Caption, ready to paste</h2>
        <p style={{ margin: '0 0 22px', padding: '12px 14px', border: '1px solid #3a3128', borderRadius: 10, background: '#211b15', maxWidth: 640 }}>{ad.caption}</p>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>How to post it</h2>
        <ol style={{ margin: '0 0 26px', paddingLeft: 22, color: '#d9cfbe', maxWidth: 640 }}>
          <li style={{ marginBottom: 8 }}>Download the one you like and post it as a Reel on Instagram and Facebook.</li>
          <li style={{ marginBottom: 8 }}>Paste the caption above.</li>
          <li style={{ marginBottom: 8 }}>Share it to your local jobs groups on Facebook the same day.</li>
        </ol>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Want one every week?</h2>
        <p style={{ margin: '0 0 4px', color: '#b9ad9a', maxWidth: 640 }}>A new ad each Monday for the opening you most want filled, and an apply page that answers every applicant for you.</p>
        <a href="/weekly" style={{ ...btn, maxWidth: 300 }}>See how it works</a>
        <p style={{ marginTop: 30, fontSize: 13, color: '#8a8275' }}>Montero · 475-977-1707 · ai@montero.cool · montero.cool</p>
      </div>
    </main>
  )
}
