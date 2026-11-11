import type { Metadata } from 'next'
import { HookStart } from '@/components/hook/HookStart'

export const metadata: Metadata = {
  title: 'Start your restaurant reel · MONTERO',
  description: 'Tell us about your food. Preview within 24 hours.',
  robots: { index: false },
}

export default function Page() {
  return <HookStart food />
}
