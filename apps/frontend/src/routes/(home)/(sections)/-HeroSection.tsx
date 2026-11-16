import { Link } from '@tanstack/react-router'
import { CloudLightning, Leaf, Scale, SolarPanel } from 'lucide-react'
import { Button } from '@/components/ui/button'

const topicLinkClassName =
  'w-max justify-between gap-2 rounded-full border-[#DEDEDE] bg-transparent px-2 text-slate-700 hover:bg-white/90 md:px-3'

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="min-h-[500px] overflow-hidden rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] md:rounded-[40px]"
    >
      <div className="relative z-10 flex min-h-[500px] flex-col-reverse md:grid md:grid-cols-2">
        <div className="max-w-2xl p-6 text-right md:p-[60px] md:pb-[30px]">
          <h1
            id="hero-heading"
            className="text-3xl leading-tight font-extrabold text-[#484C56] md:text-[45px]"
          >
            נתוני משק החשמל
          </h1>
          <div className="my-3 mr-0 h-1 w-[46px] bg-[#276E4E] md:my-[18px]" />

          <p className="mr-0 mb-12 max-w-lg text-base leading-relaxed text-slate-700 md:text-xl">
            פלטפורמה מרכזית למעקב אחר משק החשמל בישראל: נתונים עדכניים, מגמות ותובנות
            לקידום מערכת חשמל מבוססת אנרגיה מתחדשת.
          </p>

          <div className="mt-10 md:mt-20">
            <h2 className="mb-2 text-lg font-bold text-[#276E4E] md:mb-4 md:text-2xl">
              מה מעניין אותך?
            </h2>
            <nav aria-label="נושאי נתוני אנרגיה" className="flex flex-wrap gap-2 md:gap-3">
              {/* TODO: Add the electricity-sector target when migrating the main content. */}
              <Button asChild variant="outline" className={topicLinkClassName}>
                <a href="#electricity-sector">
                  <Leaf size={32} aria-hidden="true" className="shrink-0 text-[#59687D]" />
                  <span className="font-medium">משק החשמל</span>
                </a>
              </Button>

              <Button asChild variant="outline" className={topicLinkClassName}>
                <Link to="/renewable-energy">
                  <SolarPanel size={32} aria-hidden="true" className="shrink-0 text-[#59687D]" />
                  <span className="font-medium">אנרגיות מתחדשות</span>
                </Link>
              </Button>

              {/* TODO: Restore the CO2 emissions topic once enabled in the legacy design. */}

              <Button asChild variant="outline" className={topicLinkClassName}>
                <Link to="/climate">
                  <CloudLightning size={32} aria-hidden="true" className="shrink-0 text-[#59687D]" />
                  <span className="font-medium">אקלים</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className={topicLinkClassName}>
                <Link to="/predictions">
                  <Scale size={32} aria-hidden="true" className="shrink-0 text-[#59687D]" />
                  <span className="font-medium">תחזיות והשוואות</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>

        <div className="relative flex w-full justify-between gap-4 p-6 md:p-[30px] md:pr-0">
          <div className="w-full min-w-0">
            <img
              src="/legacy/images/main_img.jpg"
              width={192}
              height={308}
              className="w-full rounded-full md:h-[308px] md:w-[192px]"
              alt=""
            />
          </div>
          <div className="w-full min-w-0">
            <img
              src="/legacy/Frame 427319913.png"
              width={192}
              height={308}
              className="mt-20 w-full md:mt-40 md:h-[308px] md:w-[192px]"
              alt=""
            />
          </div>
          <div className="w-full min-w-0">
            <img
              src="/legacy/Frame 427319915.png"
              width={192}
              height={308}
              className="w-full md:h-[308px] md:w-[192px]"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  )
}
