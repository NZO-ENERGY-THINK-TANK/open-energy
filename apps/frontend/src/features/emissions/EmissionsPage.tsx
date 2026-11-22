import InterestSection from '@/components/InterestSection'
import EmissionsHistoryCard from './charts/EmissionsHistoryCard'
import EmissionsIntensityCard from './charts/EmissionsIntensityCard'
import EmissionsMixCard from './charts/EmissionsMixCard'

export default function EmissionsPage() {
  return (
    <div dir="rtl">
      <div className="relative container mx-auto w-full px-5 py-5 md:py-[52px]">
        <section
          aria-labelledby="emissions-heading"
          className="space-y-8 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] p-6 md:space-y-[52px] md:rounded-[40px] md:px-[60px] md:py-[50px]"
        >
          <div>
            <h1
              id="emissions-heading"
              className="text-2xl font-bold text-[#276E4E] md:text-3xl"
            >
              פליטות CO₂
            </h1>
            <div className="my-3 h-1 w-[46px] bg-[#276E4E] md:my-5" />
            <p className="max-w-[1043px] text-base leading-[120%] text-[#484C56] md:text-xl">
              ייצור חשמל ממקורות מאובנים גורם לפליטות רבות של גזי חממה, ובראשם
              CO2. המעבר לאנרגיה מתחדשת צפוי להפחית פליטות גזי חממה, ולמתן את
              התדרדרות משבר האקלים.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[23px] lg:grid-cols-[1fr_1.22fr]">
            <EmissionsMixCard />
            <EmissionsHistoryCard />
          </div>
          <EmissionsIntensityCard />
        </section>
      </div>
      <InterestSection />
    </div>
  )
}
