import { Nav } from '@/components/Nav'
import { MainHero } from '@/components/MainHero'
import { TickerStrip } from '@/components/TickerStrip'
import { Services } from '@/components/Services'
import { CaseStudies } from '@/components/CaseStudies'
import { Testimonials } from '@/components/Testimonials'
import { WhyMontero } from '@/components/WhyMontero'
import { MainContact } from '@/components/MainContact'

export default function HomePage() {
  return (
    <>
      <Nav variant="main" />
      <main>
        <MainHero />
        <TickerStrip />
        <Services />
        <CaseStudies />
        <Testimonials />
        <WhyMontero />
        <MainContact />
      </main>
    </>
  )
}
