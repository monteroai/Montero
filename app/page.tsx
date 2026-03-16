import { Nav } from '@/components/Nav'
import { MainHero } from '@/components/MainHero'
import { TickerStrip } from '@/components/TickerStrip'
import { Services } from '@/components/Services'
import { CaseStudies } from '@/components/CaseStudies'
import { WhyMontero } from '@/components/WhyMontero'
import { MainContact } from '@/components/MainContact'
import { CircuitBackground } from '@/components/CircuitBackground'

export default function HomePage() {
  return (
    <>
      <CircuitBackground />
      <Nav variant="main" />
      <main>
        <MainHero />
        <TickerStrip />
        <Services />
        <CaseStudies />
        <WhyMontero />
        <MainContact />
      </main>
    </>
  )
}
