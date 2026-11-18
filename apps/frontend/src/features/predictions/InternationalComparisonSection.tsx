import InternationalComparisonChart from './charts/InternationalComparisonChart'

export default function InternationalComparisonSection() {
  return (
    <section
      aria-labelledby="international-comparison-heading"
      className="space-y-8 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-6 py-6 md:space-y-[52px] md:rounded-[40px] md:px-[60px] md:py-[50px]"
    >
      <div>
        <h2
          id="international-comparison-heading"
          className="text-2xl font-bold text-[#276E4E] md:text-3xl"
        >
          השוואה למדינות אחרות בעולם
        </h2>
        <div className="my-3 h-1 w-[46px] bg-[#276E4E] md:my-5" />
        <p className="text-base leading-[120%] text-[#484C56] md:text-xl">
          מדינות רבות הציבו יעדים למעבר לאנרגיה מתחדשת. מגוון מקורות האנרגיה
          המתחדשים והנקיים משתנה בין המדינות. בחלק זה ניתן לראות את התקדמות
          תהליך המעבר למשק דל פחמן
        </p>
      </div>
      <div className="relative min-w-0 space-y-[30px] rounded-[20px] border border-[#E9C863] bg-white px-5 py-10 md:rounded-[40px]">
        <InternationalComparisonChart />
      </div>
    </section>
  )
}
