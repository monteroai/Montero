import { Nav } from '@/components/Nav'
import { MainHero } from '@/components/MainHero'
import { Services } from '@/components/Services'
import { CaseStudies } from '@/components/CaseStudies'
import { WhyMontero } from '@/components/WhyMontero'
import { MainContact } from '@/components/MainContact'

export default function HomePage() {
  return (
    <>
      <Nav variant="main" />
      <main>
        <MainHero />
        <Services />
        <CaseStudies />
        <WhyMontero />
        <MainContact />
      </main>
    </>
  )
}
