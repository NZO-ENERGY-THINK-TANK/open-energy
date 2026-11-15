import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useRouter } from '@tanstack/react-router';
import Logo from './Logo';

const deferredTopics = ['תחזיות והשוואות', 'אנרגיות מתחדשות', 'משק החשמל'];
const linkClassName = 'rounded px-2 py-2 font-bold transition-colors hover:text-gray-200 focus-visible:outline-2 focus-visible:outline-offset-4';

function ComingSoon({ label }: { label: string }) {
  return (
    <span aria-disabled="true" className="inline-flex cursor-not-allowed flex-wrap items-center gap-2 px-2 py-2 text-sm text-gray-300">
      {label}<span className="text-xs">(בקרוב)</span>
    </span>
  );
}

export default function Header() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 300);
  const menuId = useId();
  const searchId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const showTopics = pathname !== '/' || isScrolled;

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => router.subscribe('onResolved', () => setIsMenuOpen(false)), [router]);

  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header dir="rtl" className={`sticky top-0 z-50 bg-[#2A2E33] text-white transition-shadow ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" onClick={closeMenu} aria-label="אנרגיה פתוחה — דף הבית" className="rounded focus-visible:outline-2 focus-visible:outline-offset-4">
              <Logo />
            </Link>
            <img src="/legacy/hetchel.png" alt="מרכז השל לקיימות" width={76} height={65} className="h-auto w-[47px] md:w-[76px]" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 lg:gap-8">
              <nav aria-label="ניווט ראשי" className="hidden items-center gap-4 md:flex lg:gap-8">
                <Link to="/about" className={linkClassName} activeProps={{ className: 'text-[#9ACA75]' }}>
                  אודותינו
                </Link>
                <ComingSoon label="צור קשר" />
                <ComingSoon label="API" />
              </nav>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-white/60 px-3 py-2 sm:flex">
                  <input
                    id={searchId}
                    type="search"
                    disabled
                    aria-label="חיפוש — בקרוב"
                    placeholder="חיפוש — בקרוב"
                    className="w-[125px] cursor-not-allowed border-none bg-transparent text-sm text-white placeholder:text-gray-300 disabled:opacity-100"
                  />
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="8" cy="8" r="5.75" /><path d="m12.25 12.25 3.5 3.5" />
                  </svg>
                </div>
                <button
                  ref={toggleRef}
                  type="button"
                  aria-label={isMenuOpen ? 'סגירת תפריט הניווט' : 'פתיחת תפריט הניווט'}
                  aria-expanded={isMenuOpen}
                  aria-controls={menuId}
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-4 md:hidden"
                >
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {isMenuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                  </svg>
                </button>
              </div>
            </div>
            {showTopics && (
              <nav aria-label="נושאי אנרגיה" className="hidden flex-wrap gap-4 md:flex">
                {deferredTopics.map((label) => (
                  <div key={label} className="rounded-full border border-[#91AB53]/60 px-3"><ComingSoon label={label} /></div>
                ))}
              </nav>
            )}
          </div>
        </div>
        <nav ref={menuRef} id={menuId} aria-label="ניווט לנייד" hidden={!isMenuOpen} className="mt-3 border-t border-slate-600 pt-3 md:hidden">
          <div className="flex flex-col items-start gap-1">
            <Link to="/" onClick={closeMenu} className={linkClassName}>דף הבית</Link>
            <Link to="/about" onClick={closeMenu} className={linkClassName} activeProps={{ className: 'text-[#9ACA75]' }}>אודותינו</Link>
            <ComingSoon label="צור קשר" />
            <ComingSoon label="API" />
            <div className="flex flex-wrap gap-2 border-t border-slate-600 pt-2">
              {deferredTopics.map((label) => <ComingSoon key={label} label={label} />)}
            </div>
            <span aria-disabled="true" className="px-2 py-2 text-sm text-gray-300 sm:hidden">חיפוש — בקרוב</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
