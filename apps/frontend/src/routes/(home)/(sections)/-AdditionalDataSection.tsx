import { useId, useState } from 'react'

const tabs = [
  { value: 'market', label: 'שוק מספקי חשמל פרטיים' },
  { value: 'smp', label: 'SMP' },
] as const

type DataTab = (typeof tabs)[number]['value']

export default function AdditionalDataSection() {
  const [activeTab, setActiveTab] = useState<DataTab>()
  const id = useId()

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="space-y-[30px] rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 pb-5 md:rounded-[40px] md:px-[60px]"
    >
      <div className="my-[30px] flex flex-col gap-2">
        <h2
          id={`${id}-heading`}
          className="text-base font-extrabold text-[#276E4E] md:text-lg"
        >
          לנתונים נוספים
        </h2>

        <div
          role="group"
          aria-label="בחירת נתונים נוספים"
          className="flex flex-col items-center gap-3 md:flex-row md:gap-6"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              id={`${id}-${tab.value}-button`}
              aria-expanded={activeTab === tab.value}
              aria-controls={`${id}-${tab.value}-panel`}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full border px-6 py-[6px] text-sm font-bold transition-colors md:text-base ${
                tab.value === 'smp' ? 'w-full md:w-auto' : ''
              } ${
                activeTab === tab.value
                  ? 'border-[#1E8025] bg-[#1E8025] text-white'
                  : 'border-[#DEDEDE] bg-white text-[#59687D] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-10 md:mt-[60px]">
          <div
            id={`${id}-market-panel`}
            role="region"
            aria-labelledby={`${id}-market-button`}
            hidden={activeTab !== 'market'}
          >
            {/* TODO: Migrate Market, DashChart, and RejectionChart here. */}
          </div>

          <div
            id={`${id}-smp-panel`}
            role="region"
            aria-labelledby={`${id}-smp-button`}
            hidden={activeTab !== 'smp'}
          >
            {/* TODO: Migrate SMP and Electritiy here. */}
          </div>
        </div>
      </div>
    </section>
  )
}
