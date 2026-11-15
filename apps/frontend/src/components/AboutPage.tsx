export default function AboutPage() {
  return (
    <div dir="rtl" className="relative isolate overflow-hidden text-right text-[#484C56]">
      <img
        src="/legacy/images/Ellipse 89 (1).png"
        width={600}
        height={600}
        className="pointer-events-none absolute top-0 left-0 -z-10 size-[600px] max-w-none"
        alt=""
        aria-hidden="true"
      />
      <div className="container mx-auto min-h-[500px] p-5 md:p-12">
        <h1 className="text-3xl font-extrabold md:text-5xl">אודותינו</h1>
        <div aria-hidden="true" className="my-3 h-1 w-[92px] bg-[#276E4E] md:my-5" />
        <div className="flex flex-col gap-6">
          <section aria-labelledby="about-nzo" className="rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 py-10 md:rounded-[40px] md:px-[60px] md:py-[50px]">
            <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
              <div className="flex w-full flex-col gap-3 md:gap-5">
                <h2 id="about-nzo" className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]">
                  <a href="http://www.nzo.org.il" target="_blank" rel="noopener noreferrer" className="hover:underline">פרויקט NZO<span className="sr-only"> (נפתח בכרטיסייה חדשה)</span></a>
                </h2>
                <div aria-hidden="true" className="h-1 w-[46px] bg-[#276E4E]" />
                <p className="text-sm leading-relaxed md:text-lg">
                  פרויקט NZO (שמשמעותו Net ZerO Emissions) נוסד במטרה לצמצם את פליטות הפחמן של מדינת ישראל, על ידי איפוס הפליטות מהמרכיב הגדול ביותר - ייצור חשמל. הפרויקט פועל החל משנת 2019 להאצת המעבר של מדינת ישראל למשק מבוסס אנרגיה מתחדשת, באמצעות מחקר, מודלים מבוססי נתונים ומעורבות בשיח ובמדיניות הממשלתית.
                  <br />
                  <a href="http://www.nzo.org.il" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><bdi>www.NZO.org.il</bdi><span className="sr-only"> (נפתח בכרטיסייה חדשה)</span></a>
                </p>
              </div>
              <div className="flex w-full justify-end">
                <img src="/legacy/images/nzo_logo.png" width={350} height={230} className="h-auto w-[350px] max-w-full rounded-full object-contain md:h-[230px]" alt="פרויקט NZO" loading="lazy" />
              </div>
            </div>
          </section>

          <section aria-labelledby="about-heschel" className="px-5 py-10 md:px-[60px] md:py-[50px]">
            <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
              <div className="flex w-full justify-start">
                <img src="/legacy/images/heshel_logo.png" width={350} height={230} className="h-auto w-[350px] max-w-full object-contain md:h-[230px]" alt="מרכז השל לקיימות" loading="lazy" />
              </div>
              <div className="flex w-full flex-col gap-3 md:gap-5">
                <h2 id="about-heschel" className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]">
                  <a href="http://www.heschel.org.il/" target="_blank" rel="noopener noreferrer" className="hover:underline">מרכז השל לקיימות<span className="sr-only"> (נפתח בכרטיסייה חדשה)</span></a>
                </h2>
                <div aria-hidden="true" className="h-1 w-[46px] bg-[#276E4E]" />
                <p className="text-sm leading-relaxed md:text-lg">
                  מרכז השל לקיימות (ע"ר) מפתח ומיישם את חזון הקיימות: חברה צודקת ומלוכדת, כלכלה חסונה ודמוקרטית, וסביבה יצרנית ובריאה לכל תושביה. המרכז מחבר בין ידע רעיוני לידע מעשי, מפיץ את סיפור הקיימות בדרכים יצירתיות, ומסייע לסוכני שינוי מכל המגזרים לקדם תהליכי שינוי משמעותיים בישראל.
                  <br />
                  <a href="http://www.heschel.org.il/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><bdi>www.Heschel.org.il</bdi><span className="sr-only"> (נפתח בכרטיסייה חדשה)</span></a>
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="about-contact" className="rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 py-10 md:rounded-[40px] md:px-[60px] md:py-[50px]">
            <div className="flex flex-col items-center justify-between gap-5 md:flex-row md:gap-8">
              <div className="flex w-full flex-col gap-3 md:gap-5">
                <h2 id="about-contact" className="text-2xl font-extrabold text-[#276E4E] md:text-[34px]">יצירת קשר</h2>
                <div aria-hidden="true" className="h-1 w-[46px] bg-[#276E4E]" />
                <address className="flex flex-col gap-1 text-sm leading-relaxed not-italic md:text-lg">
                  <p>סעדיה גאון 26 תל אביב</p>
                  <p>טלפון: <bdi>077-3448514</bdi></p>
                  <p><a href="mailto:Nufar@Heschel.org.il" className="break-words text-blue-600 hover:underline"><bdi>Nufar@Heschel.org.il</bdi></a></p>
                </address>
              </div>
              <div className="flex w-full justify-end">
                <img src="/legacy/images/Frame 427319914 (2).png" width={350} height={230} className="h-[150px] w-[350px] max-w-full rounded-full object-cover md:h-[230px]" alt="" loading="lazy" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
