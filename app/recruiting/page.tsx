import type { Metadata } from 'next'
import { RecruitingPage } from '@/components/recruiting/RecruitingPage'

export const metadata: Metadata = {
  title: 'Video ads for staffing agencies · MONTERO',
  description: 'Send us your job orders. Get short animated reels back in 48 hours, ready for Instagram, TikTok, LinkedIn and your job posts. No filming.',
}

export default function Page() {
  return <RecruitingPage />
}
