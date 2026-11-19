import type { Metadata } from 'next'
import Maker from '../../video/Maker'
import { cleanProps, type AdProps } from '@/lib/make/ad'

// One agency's job, already filled in. The details are read from storage when the link is opened
// (scripts/video_link.py uploads them), so a new agency never needs a site update.
export const metadata: Metadata = { title: 'Your job ad · MONTERO', robots: { index: false } }
export const dynamic = 'force-dynamic'
const STORE = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfaqxsuscjtabsvrhlrd.supabase.co'}/storage/v1/object/public/ads`

export default async function Page({ params }: { params: { slug: string } }) {
  let made: { props: AdProps; hey?: string; expires?: string } | null = null
  if (/^[a-z0-9-]{2,60}$/.test(params.slug)) {
    try { const r = await fetch(`${STORE}/${params.slug}/make.json`, { cache: 'no-store' }); if (r.ok) made = await r.json() } catch { /* fall through */ }
  }
  if (made?.expires && made.expires < new Date().toISOString().slice(0, 10)) made = null
  if (!made?.props) return <Maker mode="make" from={`expired link ${params.slug}`} />
  return <Maker mode="made" initial={cleanProps(made.props)} madeFor={made.hey} from={`link ${params.slug}`} />
}
