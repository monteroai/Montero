import type { Metadata } from 'next'
import { HookStart } from '@/components/hook/HookStart'

export const metadata: Metadata = {
  title: 'Start your hook reel · MONTERO',
  description: 'Tell us your line and send your clips. First cut in 3 days.',
  robots: { index: false },
}

export default function Page() {
  return <HookStart />
}
