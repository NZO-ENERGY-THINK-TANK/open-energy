import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type {
  DateRange,
  ProductionVsMarginalPriceResponse,
  SMPResponse,
} from './types'

const API_BASE = '/api/v1/energy'
const STALE_TIME = 5 * 60 * 1000
const REFETCH_INTERVAL = 15 * 60 * 1000
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
type Resource = 'smp' | 'smp-production-vs-marginal-price'

function resourceUrl(
  resource: Resource,
  range: DateRange,
  exporting = false,
): string {
  const params = new URLSearchParams({
    start_date: range.start,
    end_date: range.end,
  })
  return `${API_BASE}/${resource}/${exporting ? 'export' : ''}?${params}`
}

async function requireSuccess(response: Response): Promise<Response> {
  if (response.ok) return response

  let detail = ''
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object') {
      const message =
        'detail' in body
          ? body.detail
          : 'error' in body
            ? body.error
            : undefined
      if (typeof message === 'string') detail = message
    }
  } catch {
    // Proxy errors may be HTML; don't expose a page as an error message.
  }
  throw new Error(
    `SMP request failed (${response.status})${detail ? `: ${detail}` : '.'}`,
  )
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await requireSuccess(
    await apiFetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    }),
  )
  return response.json() as Promise<T>
}

export function useSMP(range: DateRange) {
  return useQuery<SMPResponse>({
    queryKey: ['smp', range.start, range.end],
    queryFn: ({ signal }) => fetchJson(resourceUrl('smp', range), signal),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    // Override any global keepPreviousData default when the range changes.
    placeholderData: () => undefined,
  })
}

export function useProductionVsMarginalPrice(range: DateRange) {
  return useQuery<ProductionVsMarginalPriceResponse>({
    queryKey: ['smp-production-vs-marginal-price', range.start, range.end],
    queryFn: ({ signal }) =>
      fetchJson(resourceUrl('smp-production-vs-marginal-price', range), signal),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    placeholderData: () => undefined,
  })
}

function exportFilename(disposition: string | null, fallback: string): string {
  let filename: string | undefined
  if (disposition) {
    const encoded = disposition.match(
      /(?:^|;)\s*filename\*\s*=\s*(?:"([^"]*)"|([^;]*))/i,
    )
    const extended = (encoded?.[1] ?? encoded?.[2])
      ?.trim()
      .match(/^UTF-8'[^']*'(.*)$/i)
    if (extended) {
      try {
        filename = decodeURIComponent(extended[1])
      } catch {
        // Malformed UTF-8 can still have a valid ordinary filename fallback.
      }
    }
    if (!filename) {
      const plain = disposition.match(
        /(?:^|;)\s*filename\s*=\s*(?:"((?:\\.|[^"\\])*)"|([^;]*))/i,
      )
      filename = plain?.[1]?.replace(/\\(.)/g, '$1') ?? plain?.[2]?.trim()
    }
  }

  const basename = filename?.split(/[\\/]/).pop() ?? ''
  const safe = Array.from(basename)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return (
        code >= 32 &&
        !(code >= 127 && code <= 159) &&
        !(code >= 0x202a && code <= 0x202e) &&
        !(code >= 0x2066 && code <= 0x2069)
      )
    })
    .join('')
    .replace(/[<>:"|?*]/g, '')
    .replace(/^[.\s]+|[.\s]+$/g, '')
  return safe && safe.length <= 200 && /\.xlsx$/i.test(safe) ? safe : fallback
}

async function downloadExcel(
  resource: Resource,
  range: DateRange,
): Promise<void> {
  const response = await requireSuccess(
    await apiFetch(resourceUrl(resource, range, true), {
      signal: AbortSignal.timeout(120_000),
      headers: { Accept: EXCEL_TYPE },
    }),
  )
  const contentType = response.headers.get('Content-Type')?.toLowerCase() ?? ''
  if (
    contentType.includes('json') ||
    contentType.includes('text/') ||
    contentType.includes('xml')
  ) {
    // The XLSX MIME type contains "xmlformats", but is not an XML response.
    if (contentType.split(';')[0].trim() !== EXCEL_TYPE) {
      throw new Error(
        'Expected an Excel workbook but the server returned a different content type.',
      )
    }
  }
  const blob = await response.blob()
  if (blob.size === 0)
    throw new Error('The server returned an empty Excel workbook.')

  // XLSX is a ZIP archive. Reject JSON/HTML errors even if incorrectly labelled.
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (
    signature[0] !== 0x50 ||
    signature[1] !== 0x4b ||
    signature[2] !== 0x03 ||
    signature[3] !== 0x04
  ) {
    throw new Error('The server did not return an Excel workbook.')
  }
  const filename = exportFilename(
    response.headers.get('Content-Disposition'),
    `${resource}-data.xlsx`,
  )
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    // Allow the browser to start the download before releasing its URL.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}

export function exportSMP(range: DateRange): Promise<void> {
  return downloadExcel('smp', range)
}

export function exportProductionVsMarginalPrice(
  range: DateRange,
): Promise<void> {
  return downloadExcel('smp-production-vs-marginal-price', range)
}
