import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ScrollProgress } from '@/components/ScrollProgress'

const inter   = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel  = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  title: 'montero. — AI automation for businesses that move fast',
  description: 'AI automation, custom workflows, and intelligent content tools for real estate teams, restaurants, law firms, and anyone who moves fast.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', background: '#0F1117' }}>
        <Providers>
          <ScrollProgress />
          {children}
        </Providers>
      </body>
    </html>
  )
}
