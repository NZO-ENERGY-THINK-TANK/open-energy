import pageGlow from '@/assets/backgrounds/page-glow.png'
import ContactForm from './ContactForm'

export default function ContactPage() {
  return (
    <div dir="rtl" className="relative isolate overflow-hidden">
      <img
        src={pageGlow}
        width={600}
        height={600}
        alt=""
        className="pointer-events-none absolute top-0 left-0 -z-10 size-[600px] max-w-none"
      />
      <div className="container relative mx-auto w-full px-5 py-10 md:py-[52px]">
        <h1 className="text-3xl leading-tight font-extrabold text-[#484C56] md:text-[45px]">
          יצירת קשר
        </h1>
        <div className="mt-3 mr-0 h-1 w-[46px] bg-[#276E4E] md:mt-[18px]" />
        <div className="mt-5 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] p-5 md:mt-[30px] md:rounded-[40px] md:p-10">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div className="min-w-0">
              <h2 className="text-2xl leading-[110%] font-extrabold text-[#484C56] md:text-[34px]">
                לא מצאתם מה שחיפשתם?
                <br />
                <span className="text-[#276E4E]">יש לכם הצעת שיפור?</span>
              </h2>
              <div className="my-3 mr-0 h-1 w-[46px] bg-[#276E4E] md:my-5" />
              <p className="text-base text-[#484C56] md:text-lg">
                אתם מוזמנים ליצור איתנו קשר ונענה בהקדם
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
