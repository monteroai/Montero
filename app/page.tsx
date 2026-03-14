import { Nav } from '@/components/Nav'
import { MainHero } from '@/components/MainHero'
import { Services } from '@/components/Services'
import { CaseStudies } from '@/components/CaseStudies'
import { MainContact } from '@/components/MainContact'

export default function HomePage() {
  return (
    <>
      <Nav variant="main" />
      <main>
        <MainHero />
        <Services />
        <CaseStudies />
        <MainContact />
      </main>
    </>
  )
}
