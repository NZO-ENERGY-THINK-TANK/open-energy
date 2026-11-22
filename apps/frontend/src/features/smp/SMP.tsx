import { useId } from 'react'
import ProductionVsMarginalPriceCard from './ProductionVsMarginalPriceCard'
import SMPPriceCard from './SMPPriceCard'

export default function SMP() {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      dir="rtl"
      className="flex min-w-0 flex-col gap-5 md:gap-[30px]"
    >
      <div className="flex w-full max-w-[1043px] flex-col gap-3 md:gap-5">
        <h2
          id={headingId}
          className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]"
        >
          SMP
        </h2>
        <p className="text-base font-normal text-[#484C56] md:text-xl">
          מחיר השוק הסיטונאי, SMP, משמש כבסיס לסחר בחשמל בין יצרנים ומספקים
          במשק. בחלק זה ניתן לראות את השינויים ב-SMP לאורך זמן, אל מול נתוני
          הביקוש לחשמל.
        </p>
      </div>
      <SMPPriceCard />
      <ProductionVsMarginalPriceCard />
    </section>
  )
}
