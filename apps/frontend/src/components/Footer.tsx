import { Link } from '@tanstack/react-router';

export default function Footer() {
  return (
    <footer dir="rtl" className="relative border-t-[3px] border-[#1E8025] bg-[#FDFBF6] text-[#59687D]">
      <div className="container mx-auto p-5 pt-8 md:px-20">
        <div className="flex flex-col gap-5 md:flex-row-reverse md:justify-between">
          <div className="flex flex-col justify-between gap-2">
            <nav aria-label="ניווט בתחתית העמוד" className="flex flex-wrap items-center justify-center gap-5 text-sm">
              <Link to="/about" className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
                אודותינו
              </Link>
              <span aria-hidden="true">|</span>
              <Link to="/terms" className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
                תקנון ומדיניות פרטיות
              </Link>
            </nav>
            <p className="w-full text-center text-base font-medium md:text-left">© מרכז השל לקיימות 2026.</p>
          </div>
          <div className="flex w-full max-w-[676px] flex-col gap-3 text-right md:gap-5">
            <img
              src="/legacy/images/cofounded.png"
              width={250}
              height={54}
              className="h-auto w-[120px] self-start md:w-[250px]"
              alt="Co-funded by the European Union"
              loading="lazy"
            />
            <p lang="en" dir="ltr" className="text-right text-sm font-medium">
              This website was co-funded by the European Union. Its content is
              the sole responsibility of The Heschel Center for Sustainability,
              and does not necessarily reflect the views of the European Union
            </p>
            <div className="flex items-center gap-2 text-sm md:text-base">
              עיצוב ופיתוח ע״י
              <img
                src="/legacy/images/omnis_logo1.png"
                width={90}
                height={30}
                className="h-auto w-[75px] md:w-[90px]"
                alt="omnis"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
