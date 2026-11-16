import { useEffect, useId, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/routes/(layout)/-Logo'

const navItems = [
  { to: '/about', label: 'אודותינו' },
  { to: '/contact', label: 'צור קשר' },
  { to: '/api', label: 'API' },
] as const

const topics = [
  { to: '/predictions', hash: '', label: 'תחזיות והשוואות' },
  // TODO: Restore climate and CO2 emissions links when the Noga content is ready.
  { to: '/renewable-energy', hash: '', label: 'אנרגיות מתחדשות' },
  { to: '/', hash: 'electricity-sector', label: 'משק החשמל' },
] as const

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const menuId = useId()
  const searchId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const showTopics = pathname !== '/' || isScrolled

  useEffect(() => {
    let frame: number | undefined
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 300)
      frame = undefined
    }
    const handleScroll = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateScroll)
    }
    updateScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== undefined) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const handleResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMenuOpen])

  const submitSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchValue.trim()
    if (!query) return
    setIsMenuOpen(false)
    void navigate({ to: '/search/result', search: { q: query } })
  }

  const isTopicActive = (topic: (typeof topics)[number]) =>
    pathname === topic.to && (!topic.hash || hash === topic.hash)

  return (
    <header
      className={`sticky top-0 z-50 bg-[#2A2E33] text-white transition-shadow duration-300 ${
        showTopics ? 'shadow-[0_4px_20px_rgba(0,0,0,0.1)]' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 md:flex-nowrap">
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
              <Logo />
            </Link>
            <img
              src="/legacy/hetchel.png"
              alt="מרכז השל לקיימות"
              width={47}
              height={40}
              className="h-auto w-[47px] md:w-[76px]"
            />
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center justify-between gap-4 md:gap-8">
              <nav aria-label="ניווט ראשי" className="hidden items-center gap-8 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={pathname === item.to ? 'page' : undefined}
                    className={`py-2 text-base font-bold transition-colors hover:text-gray-200 ${
                      pathname === item.to ? 'text-[#1E8025]' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3 md:gap-4">
                <form role="search" aria-label="חיפוש באתר" onSubmit={submitSearch}>
                  <label htmlFor={searchId} className="sr-only">חיפוש באתר</label>
                  <div className="flex w-[175px] items-center gap-2 rounded-full border border-white px-4 py-2 pl-3 transition-colors hover:border-gray-300 md:w-[200px]">
                    <input
                      id={searchId}
                      type="search"
                      placeholder="חיפוש"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      className="w-full min-w-0 border-none bg-transparent text-sm text-white placeholder:text-white focus:outline-none"
                    />
                    <button type="submit" aria-label="חיפוש" className="flex shrink-0 items-center justify-center transition-transform hover:scale-110">
                      <Search size={18} aria-hidden="true" className="text-[#DEDEDE]" />
                    </button>
                  </div>
                </form>
                <Button
                  ref={toggleRef}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={isMenuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
                  aria-expanded={isMenuOpen}
                  aria-controls={menuId}
                  className="border border-white hover:bg-slate-700 hover:text-white md:hidden"
                  onClick={() => setIsMenuOpen((open) => !open)}
                >
                  {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </Button>
              </div>
            </div>

            {showTopics && (
              <nav aria-label="נושאי נתוני אנרגיה" className="mt-2 hidden flex-row-reverse items-center gap-4 md:flex">
                {topics.map((topic) => (
                  <Link
                    key={topic.label
}
                    to={topic.to}
                    hash={topic.hash}
                    aria-current={isTopicActive(topic) ? 'location' : undefined}
                    className={`relative mt-3 rounded-full border px-5 py-[6px] text-base font-bold text-white transition-colors hover:text-gray-200 ${
                      isTopicActive(topic)
                        ? 'border-[#1E8025] bg-[#1E8025]'
                        : 'border-transparent bg-[linear-gradient(#2A2E33,#2A2E33),linear-gradient(180deg,#357A5B80,#C3D44A80)] [background-origin:border-box] [background-clip:padding-box,border-box]'
                    }`}
                  >
                    {topic.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>

        <nav
 id={menuId}
          ref={menuRef}
          aria-label="ניווט לנייד"
          hidden={!isMenuOpen}
          className="mt-3 border-t border-slate-600 px-2 pt-2 pb-3 md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? 'page' : undefined}
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full rounded px-4 py-2 text-base font-bold transition-colors hover:bg-slate-600 ${
                pathname === item.to ? 'bg-slate-700 text-[#1E8025]' : 'text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {showTopics && (
            <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-600 pt-4">
              {topics.map((topic) => (
                <Link
                  key={topic.label}
                  to={topic.to}
                  hash={topic.hash}
                  aria-current={isTopicActive(topic) ? 'location' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-max rounded-full border border-gray-400 px-4 py-2 text-base font-bold text-white transition-colors hover:bg-slate-600 ${
                    isTopicActive(topic) ? 'bg-[#1E8025]' : ''
                  }`}
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
