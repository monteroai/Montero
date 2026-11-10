import type { Metadata } from 'next'
import { HookPage } from '@/components/hook/HookPage'

export const metadata: Metadata = {
  title: 'The viral hook reel, built for your business · MONTERO',
  description: 'The ant reel that got a car detailer 370,000 likes, rebuilt for your business with 3D animation, your line and your footage. $447, first cut in 3 business days, one free redo.',
  robots: { index: false },
}

export default function Page() {
  return <HookPage />
}
