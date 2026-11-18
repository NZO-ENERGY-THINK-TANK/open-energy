import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type {
  ConnectedConsumersResponse,
  CustomerType,
  SwitchingRequestsResponse,
} from './types'

const API_BASE = '/api/v1'
const STALE_TIME = 5 * 60 * 1000
const REFETCH_INTERVAL = 15 * 60 * 1000

function normalizeYears(years?: number[]): number[] {
  if (years?.some((year) => !Number.isSafeInteger(year) || year < 2021)) {
    throw new Error('Years must be integers greater than or equal to 2021.')
  }
  return [...new Set(years ?? [])].sort((a, b) => a - b)
}

function switchingUrl(path: '/' | '/export', customerType: CustomerType | undefined, years: number[]) {
  const params = new URLSearchParams()
  if (customerType) params.set('customer_type', customerType)
  years.forEach((year) => params.append('year', String(year)))
  const query = params.toString()
  return `${API_BASE}/switching-requests${path}${query ? `?${query}` : ''}`
}

async function requireSuccess(response: Response): Promise<Response> {
  if (response.ok) return response

  let detail = ''
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object') {
      const message = 'detail' in body ? body.detail : 'error' in body ? body.error : undefined
      if (typeof message === 'string') detail = message
    }
  } catch {
    // Proxy errors may be HTML; don't expose that page as an error message.
  }
  throw new Error(`Private supplier market request failed (${response.status})${detail ? `: ${detail}` : '.'}`)
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await requireSuccess(await apiFetch(url, { signal, headers: { Accept: 'application/json' } }))
  return response.json() as Promise<T>
}

export function useConnectedConsumers() {
  return useQuery<ConnectedConsumersResponse>({
    queryKey: ['private-supplier-market', 'connected-consumers'],
    queryFn: ({ signal }) => fetchJson(`${API_BASE}/private-supplier-connected-consumers/`, signal),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    placeholderData: () => undefined,
  })
}

export function useSwitchingRequests(customerType?: CustomerType, years?: number[]) {
  const normalizedYears = normalizeYears(years)
  return useQuery<SwitchingRequestsResponse>({
    queryKey: ['private-supplier-market', 'switching-requests', customerType ?? 'all', normalizedYears],
    queryFn: ({ signal }) => fetchJson(switchingUrl('/', customerType, normalizedYears), signal),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    // Override any global keepPreviousData default: previous filters aren't this result.
    placeholderData: () => undefined,
  })
}

function exportFilename(disposition: string | null, fallback: string): string {
  let filename: string | undefined
  if (disposition) {
    const encoded = disposition.match(/(?:^|;)\s*filename\*\s*=\s*(?:"([^"]*)"|([^;]*))/i)
    const extended = (encoded?.[1] ?? encoded?.[2])?.trim().match(/^UTF-8'[^']*'(.*)$/i)
    if (extended) {
      try {
        filename = decodeURIComponent(extended[1])
      } catch {
        // A malformed extended filename can still have a valid plain fallback.
      }
    }
    if (!filename) {
      const plain = disposition.match(/(?:^|;)\s*filename\s*=\s*(?:"((?:\\.|[^"\\])*)"|([^;]*))/i)
      filename = plain?.[1]?.replace(/\\(.)/g, '$1') ?? plain?.[2]?.trim()
    }
  }

  // Ignore path components and unsafe characters supplied by an upstream filename.
  const basename = filename?.split(/[\\/]/).pop() ?? ''
  const safe = Array.from(basename)
    .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
    .join('')
    .replace(/[<>:"|?*]/g, '')
    .trim()
  return safe && /\.xlsx$/i.test(safe) ? safe : fallback
}

async function downloadExcel(url: string, fallback: string): Promise<void> {
  const response = await requireSuccess(await apiFetch(url, {
    signal: AbortSignal.timeout(120_000),
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  }))
  const contentType = response.headers.get('Content-Type')?.toLowerCase() ?? ''
  if (contentType.includes('json') || contentType.includes('text/')) {
    throw new Error('Expected an Excel workbook but the server returned a different content type.')
  }
  const blob = await response.blob()
  if (blob.size === 0) throw new Error('The server returned an empty Excel workbook.')

  const filename = exportFilename(response.headers.get('Content-Disposition'), fallback)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    // Let the browser start consuming the download before releasing its URL.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}

export function exportConnectedConsumers(): Promise<void> {
  return downloadExcel(
    `${API_BASE}/private-supplier-connected-consumers/export`,
    'private_suppliers_consumers.xlsx',
  )
}

export async function exportSwitchingRequests(customerType?: CustomerType, years?: number[]): Promise<void> {
  const normalizedYears = normalizeYears(years)
  const yearSuffix = normalizedYears.length ? normalizedYears.join('_') : 'all'
  const customerSuffix = customerType ? `_${customerType}` : ''
  return downloadExcel(
    switchingUrl('/export', customerType, normalizedYears),
    `switching_requests${customerSuffix}_${yearSuffix}.xlsx`,
  )
}
