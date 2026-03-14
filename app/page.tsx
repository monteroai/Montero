import { Hero } from '@/components/Hero'
import { WhatWeBuild } from '@/components/WhatWeBuild'
import { CaseStudy } from '@/components/CaseStudy'
import { Pricing } from '@/components/Pricing'
import { HowItWorks } from '@/components/HowItWorks'
import { ContactSection } from '@/components/ContactSection'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WhatWeBuild />
      <CaseStudy />
      <Pricing />
      <HowItWorks />
      <ContactSection />
    </main>
  )
}
