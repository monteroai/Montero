import type { Metadata } from 'next'
import { HookPage } from '@/components/hook/HookPage'

export const metadata: Metadata = {
  title: 'The viral hook reel, built for your business · MONTERO',
  description: 'The ant reel that got a car detailer 370,000 likes, rebuilt for your business in 3D with your line and your brand. $235, delivered in 24 hours, no filming needed.',
  robots: { index: false },
}

export default function Page() {
  return <HookPage />
}
