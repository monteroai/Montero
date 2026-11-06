import type { Metadata } from 'next'
import { HomePage } from '@/components/home/HomePage'

export const metadata: Metadata = {
  title: 'MONTERO · Video ads for businesses with nothing to film',
  description: 'Short animated reels built from what you already have, plus the landing pages and automations they point to. First reel free.',
}

export default function Page() {
  return <HomePage />
}
