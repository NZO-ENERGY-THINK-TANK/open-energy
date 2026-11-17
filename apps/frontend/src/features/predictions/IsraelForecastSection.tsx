import IsraelForecastChart from './charts/IsraelForecastChart'

export default function IsraelForecastSection() {
  return (
    <section aria-labelledby="israel-forecast-heading" className="space-y-8 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-6 py-6 md:space-y-[52px] md:rounded-[40px] md:px-[60px] md:py-[50px]">
      <div>
        <h2 id="israel-forecast-heading" className="text-2xl font-bold text-[#276E4E] md:text-3xl">יעדי אנרגיה מתחדשת</h2>
        <div className="my-3 h-1 w-[46px] bg-[#276E4E] md:my-5" />
        <p className="text-base leading-[120%] text-[#484C56] md:text-xl">החלטת ממשלה 465 קובעת יעד לייצור חשמל ממקורות מתחדשים של 20% בשנת 2025, ו-30% בשנת 2030. אנו ב-NZO מציבים יעדים שאפנתיים יותר. בגרף ניתן לראות יעדים אלו לעומת שיעור המתחדשות בפועל</p>
      </div>
      <div className="min-w-0 space-y-[30px] rounded-[20px] border border-[#E9C863] bg-white px-5 py-10 md:rounded-[40px]">
        <IsraelForecastChart />
      </div>
    </section>
  )
}
