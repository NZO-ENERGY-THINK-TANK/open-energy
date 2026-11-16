import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="relative border-t-[3px] border-t-[#1E8025] bg-[#FDFBF6]">
      <div className="container mx-auto bg-[#FDFBF6] p-5 pt-8">
        <div className="flex h-full flex-col-reverse justify-between gap-5 px-0 md:flex-row md:px-[60px]">
          <div className="mb-4 flex h-auto flex-col items-start justify-between gap-2 md:mb-0">
            <nav
              aria-label="קישורים בתחתית האתר"
              className="flex w-full flex-row-reverse justify-center gap-5 md:w-fit"
            >
              <Link
                to="/terms"
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                תקנון ומדיניות פרטיות
              </Link>
              <span aria-hidden="true" className="text-sm text-slate-600">|</span>
              <Link
                to="/about"
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                אודותינו
              </Link>
            </nav>
            <p className="w-full text-center text-base font-medium text-[#59687D] md:text-left">
              © מרכז השל לקיימות 2026.
            </p>
          </div>

          <div className="flex w-full max-w-[676px] flex-col items-start gap-3 text-right md:gap-5">
            <div className="flex w-full items-center justify-end gap-6">
              <img
                src="/legacy/images/cofounded.png"
                width={120}
                height={26}
                className="h-auto w-[120px] md:w-[250px]"
                alt="Co-funded by the European Union"
              />
            </div>
            <p lang="en" dir="ltr" className="text-right text-sm font-medium text-[#59687D]">
              This website was co-funded by the European Union. Its content is
              the sole responsibility of The Heschel Center for Sustainability,
              and does not necessarily reflect the views of the European Union

            </p>
            <div className="ml-0 flex w-full items-end justify-end gap-0 text-sm md:text-base">
              עיצוב ופיתוח ע״י
              <img
                src="/legacy/images/omnis_logo1.png"
                width={90}
                height={30}
                className="h-auto w-[75px] md:w-[90px]"
                alt="Omnis"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
