import { useId } from 'react'
import { useSwitchingRequests } from './api'
import ConnectedConsumersCard from './ConnectedConsumersCard'
import RejectionReasonsCard from './RejectionReasonsCard'
import SwitchingRequestsCard from './SwitchingRequestsCard'

export default function Market() {
  const headingId = useId()
  // This unfiltered query supplies stable year options and shares the cards' cache.
  const { data } = useSwitchingRequests()
  const availableYears = data?.available_years ?? []

  return (
    <section aria-labelledby={headingId} dir="rtl" className="flex min-w-0 flex-col gap-6 md:gap-[30px]">
      <div className="flex w-full max-w-[1043px] flex-col gap-3 md:gap-5">
        <h2 id={headingId} className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]">שוק מספקי חשמל פרטיים</h2>
        <p className="text-base font-normal text-[#484C56] md:text-xl">
          תהליך המעבר למספקי חשמל פרטיים החל בשנת 2021. בחלק זה ניתן לראות את כמות הצרכנים שעברו למספק חשמל פרטי, סטטוס בקשות הניוד, וסיבות הדחייה.
        </p>
      </div>
      <ConnectedConsumersCard />
      <SwitchingRequestsCard availableYears={availableYears} />
      <RejectionReasonsCard availableYears={availableYears} />
    </section>
  )
}
