import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import InterestSection from '@/components/InterestSection'
import EndpointCard from './EndpointCard'
import { endpoints, type ApiEndpoint } from './endpoints'

function configuredOrigin(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.href !== `${url.origin}/`) return null
    return url.origin
  } catch {
    return null
  }
}

function copyText(endpoint: ApiEndpoint) {
  return `Endpoint: ${endpoint.method} ${endpoint.path}\nDescription: ${endpoint.description}\nMethod: ${endpoint.method}${endpoint.parameters?.length ? `\nParameters:\n${endpoint.parameters.map((parameter) => `- ${parameter}`).join('\n')}` : ''}`
}

const origin = configuredOrigin(import.meta.env.VITE_UPSTREAM_ORIGIN)
const panelClass = 'min-w-0 rounded-[20px] border border-[#DEDEDE]/70 bg-[#FDFBF6] px-5 py-5 md:rounded-[40px] md:px-[60px] md:py-[50px]'
const headingClass = 'text-2xl font-extrabold text-[#276E4E] md:text-[34px]'

export default function ApiPage() {
  const [feedback, setFeedback] = useState<{ id: string; status: 'success' | 'error' } | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const copyRequest = useRef(0)

  useEffect(() => () => {
    clearTimeout(resetTimer.current)
    copyRequest.current += 1
  }, [])

  async function copyEndpoint(endpoint: ApiEndpoint) {
    const request = ++copyRequest.current
    clearTimeout(resetTimer.current)
    setFeedback(null)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(copyText(endpoint))
      if (request !== copyRequest.current) return
      setFeedback({ id: endpoint.id, status: 'success' })
      resetTimer.current = setTimeout(() => setFeedback(null), 2000)
    } catch {
      if (request === copyRequest.current) setFeedback({ id: endpoint.id, status: 'error' })
    }
  }

  return (
    <div dir="rtl" className="relative isolate min-w-0 text-[#484C56]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img src="/legacy/images/Ellipse 89 (1).png" width={600} height={600} alt="" className="absolute top-0 left-0 size-[600px] max-w-none" />
      </div>
      <div className="container relative mx-auto min-w-0 px-5 py-10 md:py-[52px]">
        <header className="px-5 md:px-[60px]">
          <h1 className="text-3xl font-extrabold md:text-5xl">API</h1>
          <div className="my-3 h-1 w-[92px] bg-[#276E4E] md:my-5" />
          <p className="mb-4 text-base md:text-lg">תיעוד API עבור גישה לנתוני אנרגיה, פליטות CO2, ונתוני שוק החשמל בישראל.</p>
          <p dir="ltr" className="mb-4 text-left text-sm text-[#59687D]">Date parameters use YYYY-MM-DD format (some endpoints also accept DD-MM-YYYY or MM-YYYY). Default ranges vary by endpoint; see Parameters and Description below.</p>
        </header>

        <section aria-labelledby="api-general" className={panelClass}>
          <h2 id="api-general" className={headingClass}>כללי</h2>
          <div dir="ltr" className="space-y-1 text-right text-base md:text-xl">
            <p>Base URL: {origin ? <a href={origin} className="break-all text-[#4859D8] underline-offset-4 hover:underline">{origin}</a> : <span dir="rtl" className="inline-block">כתובת ה-API אינה זמינה: הגדרת VITE_UPSTREAM_ORIGIN חסרה או אינה תקינה.</span>}</p>
            <p>Authentication: API Key required (x-api-key header)</p>
            <p>Formats Supported: JSON, Excel (for export endpoints)</p>
          </div>
        </section>

        <div className="my-5 flex min-w-0 flex-col gap-5 md:my-10 md:gap-10">
          <section aria-labelledby="api-index" className={panelClass}>
            <h2 id="api-index" className={headingClass}>רשימה של שיטות API</h2>
            <p className="mb-4 text-base md:text-lg">נקודות הקצה והפונקציונליות שלהן.</p>
            <div role="region" aria-label="רשימת נקודות קצה — גלילה אופקית" tabIndex={0} className="w-full max-w-[975px] overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4">
              <table className="w-full border-collapse text-right text-base md:text-xl">
                <caption className="sr-only">שיטות API, נקודות קצה ותיאור — קישורים לתיעוד המפורט</caption>
                <thead className="bg-[#DEDEDE]/70 font-extrabold">
                  <tr>
                    <th scope="col" className="border border-[#C3C3C3] p-3">שיטה</th>
                    <th scope="col" className="border border-[#C3C3C3] p-3">נקודת קצה / קוד</th>
                    <th scope="col" className="border border-[#C3C3C3] p-3">תאוּר</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint) => (
                    <tr key={endpoint.id} className="bg-white">
                      <td className="border border-[#C3C3C3] p-3"><bdi dir="ltr">{endpoint.method}</bdi></td>
                      <td className="border border-[#C3C3C3] p-3"><Link to="." hash={endpoint.id} className="text-[#4859D8] hover:underline"><bdi dir="ltr" className="break-all">{endpoint.path}</bdi></Link></td>
                      <td className="min-w-40 border border-[#C3C3C3] p-3">{endpoint.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="api-endpoints" className={panelClass}>
            <h2 id="api-endpoints" className={`${headingClass} mb-6`}>נקודות הקצה</h2>
            <div className="flex min-w-0 flex-col gap-6">
                          {endpoints.map((endpoint) => <EndpointCard key={endpoint.id} endpoint={endpoint} status={feedback?.id === endpoint.id ? feedback.status : undefined} onCopy={copyEndpoint} />)}
                        </div>
          </section>
        </div>
      </div>
      <InterestSection />
    </div>
  )
}
