import InterestSection from '@/components/InterestSection'
import IsraelForecastSection from './IsraelForecastSection'
import InternationalComparisonSection from './InternationalComparisonSection'

export default function PredictionsPage() {
  return (
    <div dir="rtl">
      <div className="container relative mx-auto w-full space-y-5 overflow-hidden px-5 py-5 md:space-y-[52px] md:py-[52px]">
        <IsraelForecastSection />
        <InternationalComparisonSection />
      </div>
      <InterestSection />
    </div>
  )
}
