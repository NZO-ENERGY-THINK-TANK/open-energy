import InterestSection from '@/components/InterestSection'
import HeatLoadGenerationChart from './charts/HeatLoadGenerationChart'

export default function ClimatePage() {
  return (
    <div dir="rtl">
      <div className="container relative mx-auto w-full px-5 py-5 md:py-[52px]">
        <section aria-labelledby="climate-heading" className="space-y-8 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] p-6 md:space-y-[52px] md:rounded-[40px] md:px-[60px] md:py-[50px]">
          <div>
            <h1 id="climate-heading" className="text-2xl font-bold text-[#276E4E] md:text-3xl">אקלים</h1>
            <div className="my-3 h-1 w-[46px] bg-[#276E4E] md:my-5" />
            <p className="max-w-[1043px] text-base leading-[120%] text-[#484C56] md:text-xl">
              האקלים ומזג האוויר משפיעים רבות על הביקוש לחשמל. עם התגברות משבר האקלים אנו צפויים לראות באופן תדיר תופעות כמו גלי חום וקור קיצוניים.
            </p>
          </div>
          <HeatLoadGenerationChart />
        </section>
      </div>
      <InterestSection />
    </div>
  )
}
