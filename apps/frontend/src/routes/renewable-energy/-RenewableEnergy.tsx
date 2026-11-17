import { lazy, Suspense, useId, useState } from 'react'
import InterestSection from '@/components/InterestSection'
import RenewableEnergyHero from '@/features/renewable-energy/RenewableEnergyHero'
import ProductionSection from '@/features/renewable-energy/ProductionSection'
import type { RenewableEnergyTopic } from '@/features/renewable-energy/types'

const FacilitiesSection = lazy(() => import('@/features/renewable-energy/FacilitiesSection'))
const ConnectionRequestsSection = lazy(() => import('@/features/renewable-energy/ConnectionRequestsSection'))

export default function RenewableEnergy() {
  const [topic, setTopic] = useState<RenewableEnergyTopic>('production')
  const id = useId()

  return (
    <div dir="rtl" className="relative">
      <img src="/legacy/images/Ellipse 89.png" width={600} height={600} alt="" className="pointer-events-none absolute top-0 left-0 z-10 h-[200px] w-[300px] md:h-[500px] md:w-[800px]" />
      <div className="container relative mx-auto w-full space-y-5 overflow-hidden px-5 py-5 md:space-y-[52px] md:py-[52px]">
        <RenewableEnergyHero id={id} topic={topic} onSelect={(next) => setTopic((current) => current === next ? 'production' : next)} />
        <section id={`${id}-panel`} aria-label="נתוני אנרגיה מתחדשת">
          <Suspense fallback={<p role="status" className="min-h-64 text-center text-[#59687D]">טוען נתונים…</p>}>
            {topic === 'production' ? <ProductionSection /> : topic === 'facilities' ? <FacilitiesSection /> : <ConnectionRequestsSection />}
          </Suspense>
        </section>
      </div>
      <InterestSection />
    </div>
  )
}
