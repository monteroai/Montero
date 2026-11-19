import type { Metadata } from 'next'
import Maker from '../../Maker'
import { cleanProps, type AdProps } from '@/lib/make/ad'
import { unsign } from '@/lib/make/store'

// The private link we email after someone asks for their video. The signature proves we issued it.
export const metadata: Metadata = { title: 'Your video · MONTERO', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default function Page({ params }: { params: { token: string } }) {
  const data = unsign<{ p: AdProps }>(decodeURIComponent(params.token))
  if (!data?.p) return (
    <main style={{ minHeight: '100vh', background: '#f7f3ea', color: '#1d1a16', font: '17px/1.5 Arial, Helvetica, sans-serif', padding: '48px 18px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <h1 style={{ font: '800 30px/1.15 Arial, Helvetica, sans-serif', margin: 0 }}>This link does not work.</h1>
        <p>It may have been cut off when it was copied. Open it again from our email, or <a href="/video" style={{ color: '#1e3fff' }}>make the video again</a>.</p>
      </div>
    </main>
  )
  return <Maker mode="file" initial={cleanProps(data.p)} />
}
