import { useState } from 'react'
import { Button } from '@/components/ui/button'

const topics = ['אנרגיות מתחדשות', 'אקלים', 'תחזיות והשוואות']
const resources = [
  {
    title: 'מפת הסבירות לחיבור מתקני ייצור חדשים לרשת החשמל',
    href: 'https://experience.arcgis.com/experience/50e8bc89f74449298c103615c2899697?locale=he',
  },
  { title: 'דו״ח מצב משק החשמל 2024', href: 'https://www.gov.il/he/pages/dochmeshek' },
  { title: 'דו״ח מצב משק האנרגיה 2025', href: 'https://www.gov.il/he/pages/energy-300424' },
  { title: 'צריכה ביתית שעתית ממוצעת בימי חול ליישוב', href: 'https://www.noga-iso.co.il/statistics/annual-hourly-consumption-data/' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'market' | 'smp'>('market')

  return (
    <div className="relative overflow-hidden">
      <img src="/legacy/images/Ellipse 89.png" width={800} height={500} alt="" className="pointer-events-none absolute top-0 left-0 -z-10 h-50 w-75 md:h-125 md:w-200" />
      <div className="container mx-auto space-y-13 px-5 py-13">
        <section className="overflow-hidden rounded-[20px] border border-[#dedede]/70 bg-[#fdfbf6] md:rounded-[40px]">
          <div className="flex min-h-125 flex-col-reverse md:grid md:grid-cols-2">
            <div className="p-6 text-right md:p-15 md:pb-8">
              <h1 className="text-3xl leading-tight font-extrabold text-[#484c56] md:text-[45px]">נתוני משק החשמל</h1>
              <div className="my-4 h-1 w-12 bg-[#276e4e]" />
              <p className="mb-12 max-w-lg text-base leading-relaxed text-slate-700 md:text-xl">
                פלטפורמה מרכזית למעקב אחר משק החשמל בישראל: נתונים עדכניים, מגמות ותובנות לקידום מערכת חשמל מבוססת אנרגיה מתחדשת.
              </p>
              <div className="mt-10 md:mt-20">
                <h2 className="mb-4 text-lg font-bold text-[#276e4e] md:text-2xl">מה מעניין אותך?</h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Button asChild variant="outline"><a href="#electricity-sector">משק החשמל</a></Button>
                  {topics.map((topic) => (
                    <Button key={topic} variant="outline" disabled>{topic}<span className="text-xs">בקרוב</span></Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 p-6 md:p-8 md:pr-0">
              <img src="/legacy/images/main_img.jpg" width={192} height={308} alt="אנרגיה ומשק החשמל בישראל" className="w-[30%] rounded-full object-cover md:h-77 md:max-w-48" fetchPriority="high" />
              <img src="/legacy/Frame 427319913.png" width={192} height={308} alt="מקורות אנרגיה בישראל" className="mt-20 w-[30%] object-contain md:mt-40 md:h-77 md:max-w-48" />
              <img src="/legacy/Frame 427319915.png" width={192} height={308} alt="ייצור חשמל" className="w-[30%] object-contain md:h-77 md:max-w-48" />
            </div>
          </div>
        </section>

        <section id="electricity-sector" aria-labelledby="additional-data-title" className="scroll-mt-44 rounded-[20px] border border-[#dedede]/70 bg-[#fdfbf6] px-5 py-8 md:rounded-[40px] md:px-15">
          <h2 id="additional-data-title" className="mb-4 text-lg font-extrabold text-[#276e4e]">לנתונים נוספים</h2>
          <div className="flex flex-wrap gap-3" role="group" aria-label="בחירת סוג נתונים">
            <Button variant={activeTab === 'market' ? 'default' : 'outline'} aria-pressed={activeTab === 'market'} onClick={() => setActiveTab('market')}>שוק מספקי חשמל פרטיים</Button>
            <Button variant={activeTab === 'smp' ? 'default' : 'outline'} aria-pressed={activeTab === 'smp'} onClick={() => setActiveTab('smp')}>SMP</Button>
          </div>
          <div className="mt-10 rounded-2xl border border-dashed border-[#dedede] bg-white p-8 md:mt-15" role="status">
            <h3 className="mb-2 font-bold">{activeTab === 'market' ? 'שוק מספקי חשמל פרטיים' : 'מחיר שולי של החשמל (SMP)'}</h3>
            <p className="text-muted-foreground">הנתונים והגרפים יתווספו בשלב הבא. תצוגה זו אינה מחוברת לנתונים חיים.</p>
          </div>
        </section>

        <section aria-labelledby="resources-title" className="pb-4 md:px-15">
          <h2 id="resources-title" className="text-lg font-extrabold text-[#276e4e]">אולי יעניין אותך גם</h2>
          <div className="my-5 h-1 w-12 rounded bg-[#276e4e]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {resources.map((resource) => (
              <article key={resource.href} className="flex flex-col justify-between gap-5 rounded-md border border-[#c3d44a] border-t-[5px] border-t-[#1e8025] bg-white px-4 pt-6 pb-3 text-center shadow-[0_3px_30px_0_#99bf4129]">
                <h3 className="text-lg font-normal">{resource.title}</h3>
                <Button asChild variant="link" className="text-[#358bff]">
                  <a href={resource.href} target="_blank" rel="noopener noreferrer" aria-label={`${resource.title} (נפתח בחלון חדש)`}>למאמר <span aria-hidden="true">&gt;</span></a>
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
