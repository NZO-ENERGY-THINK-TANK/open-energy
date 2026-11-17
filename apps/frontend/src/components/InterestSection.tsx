import { useId } from 'react'
import { Button } from '@/components/ui/button'

const articles = [
  {
    title: 'מפת הסבירות לחיבור מתקני ייצור חדשים לרשת החשמל',
    href: 'https://experience.arcgis.com/experience/50e8bc89f74449298c103615c2899697?locale=he',
  },
  {
    title: 'דו"ח מצב משק החשמל 2024',
    href: 'https://www.gov.il/he/pages/dochmeshek',
  },
  {
    title: 'דו"ח מצב משק האנרגיה 2025',
    href: 'https://www.gov.il/he/pages/energy-300424',
  },
  {
    title: 'צריכה ביתית שעתית ממוצעת בימי חול ליישוב',
    href: 'https://www.noga-iso.co.il/statistics/annual-hourly-consumption-data/',
  },
] as const

export default function InterestSection() {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="relative">
      <div className="pointer-events-none absolute right-0 bottom-0 flex size-[150px] items-end md:size-[250px]">
        <img
          src="/legacy/images/Ellipse 891.png"
          width={250}
          height={250}
          className="w-full object-cover"
          alt=""
        />
      </div>

      <div className="container mx-auto px-
5">
        <div className="flex flex-col px-0 pb-10 md:px-[60px] md:pb-14">
          <div className="flex items-center justify-between px-2">
            <h2
              id={headingId}
              className="text-base font-extrabold text-[#276E4E] md:text-lg"
            >
              אולי יעניין אותך גם
            </h2>
            {/* TODO: Add carousel navigation if more articles are introduced. */}
          </div>
          <div className="my-3 h-1 w-[46px] rounded bg-[#276E4E] md:my-5" />

          <ul className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-16">
            {articles.map((article) => (
              <li
                key={article.href}
                className="flex w-full flex-col justify-between gap-5 rounded-[5px] border border-t-[5px] border-[#C3D44A] border-t-[#1E8025] bg-white px-2 pt-3 pb-2 text-center shadow-[0px_3px_30px_0px_#99BF4129] md:pt-6"
              >
                <h3 className="text-base font-normal text-[#484C56] md:text-lg">
                  {article.title}
                </h3>
                <Button
                  asChild
                  variant="link"
                  className="text-sm font-bold text-[#358BFF] hover:underline md:text-base"
                >
                  <a
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`למאמר: ${article.title} (נפתח בחלון חדש)`}
                  >
                    למאמר <span aria-hidden="true" className="mr-2">&gt;</span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
