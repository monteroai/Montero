import type { Metadata } from 'next'
import { RecruitingPage } from '@/components/recruiting/RecruitingPage'

export const metadata: Metadata = {
  title: 'Video ads for staffing agencies · MONTERO',
  description: 'Type your open roles and watch your hiring reel build in seconds. Animated video ads for Instagram, TikTok, LinkedIn and your job posts. No filming.',
}

export default function Page() {
  return <RecruitingPage />
}
