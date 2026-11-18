import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ApiEndpoint } from './endpoints'

type EndpointCardProps = {
  endpoint: ApiEndpoint
  status?: 'success' | 'error'
  onCopy: (endpoint: ApiEndpoint) => Promise<void>
}

export default function EndpointCard({ endpoint, status, onCopy }: EndpointCardProps) {
  return (
    <article id={endpoint.id} aria-labelledby={`${endpoint.id}-heading`} className="w-full min-w-0 max-w-[780px] rounded-xl border border-[#C3C3C3] bg-white p-5">
      <div className="flex items-start justify-between gap-3 border-b border-[#59687D] py-3 md:items-center">
        <h3 id={`${endpoint.id}-heading`} className="text-right text-base font-extrabold md:text-xl">{endpoint.title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => void onCopy(endpoint)} aria-label={`${status === 'success' ? 'Copied!' : 'Copy'} — העתקת פרטי API: ${endpoint.title} (${endpoint.method} ${endpoint.path})`} className={`shrink-0 rounded border-[#276E4E] ${status === 'success' ? 'bg-[#276E4E] text-white' : 'text-[#276E4E] hover:bg-[#276E4E] hover:text-white'}`} dir="ltr">
          {status === 'success' ? 'Copied!' : <><span>Copy</span><Copy size={16} aria-hidden="true" /></>}
        </Button>
      </div>
      <p role="status" aria-atomic="true" className="text-sm text-[#276E4E]">{status === 'success' ? 'הפרטים הועתקו ללוח.' : ''}</p>
      <p role="alert" aria-atomic="true" className="text-sm text-red-700">{status === 'error' ? 'ההעתקה נכשלה. אפשר לסמן ולהעתיק את הטקסט ידנית.' : ''}</p>
      <dl className="space-y-3 py-4 text-sm md:text-lg">
        <div dir="ltr" className="text-right">
          <dt className="inline font-semibold">Endpoint: </dt>
          <dd className="inline"><code className="break-all rounded py-1 text-[#4859D8]">{endpoint.method} {endpoint.path}</code></dd>
        </div>
        <div dir="ltr" className="text-right">
          <dt className="inline font-semibold">Description: </dt>
          <dd dir="auto" className="inline [unicode-bidi:isolate]">{endpoint.description}</dd>
        </div>
        <div dir="ltr" className="text-right">
          <dt className="inline font-semibold">Method: </dt>
          <dd className="inline rounded bg-green-700 px-2 py-0.5 text-sm text-white">{endpoint.method}</dd>
        </div>
        {endpoint.parameters?.length ? (
          <div dir="ltr" className="text-right">
            <dt className="font-semibold">Parameters:</dt>
            <dd><ul className="mt-1 list-inside list-disc space-y-1 break-words font-mono text-sm">
              {endpoint.parameters.map((parameter) => <li key={parameter}>{parameter}</li>)}
            </ul></dd>
          </div>
        ) : null}
        {endpoint.responseExample ? (
          <div dir="ltr" className="min-w-0 text-right">
            <dt className="font-semibold">Response Example <span className="text-xs font-normal">(illustrative)</span>:</dt>
            <dd><pre tabIndex={0} aria-label={`Response example: ${endpoint.title}`} className="mt-2 max-w-full overflow-x-auto rounded bg-[#1e1e1e] p-3 text-left font-mono text-xs text-[#d4d4d4] focus-visible:outline-2 focus-visible:outline-offset-4"><code>{endpoint.responseExample}</code></pre></dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}
