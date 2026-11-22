import renewableStart from '@/assets/heroes/renewable-start.png'
import renewableMiddle from '@/assets/heroes/renewable-middle.png'
import renewableEnd from '@/assets/heroes/renewable-end.png'
import renewableProductionIcon from '@/assets/icons/renewable-production.svg'
import renewableFacilitiesIcon from '@/assets/icons/renewable-facilities.svg'
import renewableRequestsIcon from '@/assets/icons/renewable-requests.svg'
import { Button } from '@/components/ui/button'
import type { RenewableEnergyTopic } from './types'

const topics = [
  {
    value: 'production',
    label: 'ייצור אנרגיות מתחדשות',
    icon: renewableProductionIcon,
    width: 32,
    height: 32,
  },
  {
    value: 'facilities',
    label: 'מתקני ייצור מחוברים',
    icon: renewableFacilitiesIcon,
    width: 27,
    height: 26,
  },
  {
    value: 'requests',
    label: 'בקשות חיבור ותשובות',
    icon: renewableRequestsIcon,
    width: 28,
    height: 28,
  },
] as const
const images = [renewableStart, renewableMiddle, renewableEnd]

export default function RenewableEnergyHero({
  topic,
  onSelect,
  id,
}: {
  topic: RenewableEnergyTopic
  onSelect: (topic: RenewableEnergyTopic) => void
  id: string
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="min-h-[500px] overflow-hidden rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] md:rounded-[40px]"
    >
      <div className="relative z-10 flex min-h-[500px] flex-col-reverse md:flex-row">
        <div className="w-full p-6 text-right md:p-[60px] md:pb-[30px]">
          <h1
            id={`${id}-heading`}
            className="text-2xl font-bold text-[#484C56] md:text-3xl"
          >
            אנרגיה מתחדשת
          </h1>
          <div className="my-3 h-1 w-[46px] bg-[#276E4E] md:my-5" />
          <p className="w-full max-w-[1043px] text-base leading-[140%] text-[#484C56] md:text-xl">
            בחלק זה תוכלו למצוא נתונים על תהליך המעבר לשימוש במקורות אנרגיה
            מתחדשים, מגמות הייצור והחיבור של מתקני אנרגיה מתחדשת לרשת.
          </p>
          <div className="mt-10 md:mt-20">
            <h2
              id={`${id}-topics`}
              className="mb-2 text-lg font-bold text-[#276E4E] md:mb-4 md:text-2xl"
            >
              מה מעניין אותך?
            </h2>
            <fieldset
              aria-labelledby={`${id}-topics`}
              className="flex flex-wrap gap-2 md:gap-3"
            >
              {topics.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant="outline"
                  aria-pressed={topic === item.value}
                  aria-controls={`${id}-panel`}
                  onClick={() => onSelect(item.value)}
                  className={`h-10 w-max gap-2 rounded-full bg-transparent px-2 md:px-3 ${topic === item.value ? 'border-[#1E8025] text-[#1E8025]' : 'border-[#DEDEDE] text-[#59687D] hover:bg-white/90'}`}
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 bg-current"
                    style={{
                      width: item.width,
                      height: item.height,
                      maskImage: `url("${item.icon}")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
            </fieldset>
          </div>
        </div>
        {topic === 'production' && (
          <div
            aria-hidden="true"
            className="relative flex w-full justify-between gap-4 p-6 md:p-[30px] md:pr-0"
          >
            {images.map((image, index) => (
              <div key={image} className="w-full">
                <img
                  src={image}
                  width={192}
                  height={308}
                  alt=""
                  className={`w-full md:h-[308px] md:w-[192px] ${index === 1 ? 'mt-20 md:mt-40' : ''}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
