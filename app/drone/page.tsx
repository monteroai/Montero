import type { Metadata } from 'next'
import { DronePage } from '@/components/hook/DronePage'

export const metadata: Metadata = {
  title: 'The drone reel, built for your restaurant · MONTERO',
  description: 'Tanks, drones, QR codes, then your food. The story-hook reel small restaurants are using right now, built for yours. $235, preview in 24 hours.',
  robots: { index: false },
}

export default function Page() {
  return <DronePage />
}
