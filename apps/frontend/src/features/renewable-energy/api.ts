import { useQuery } from '@tanstack/react-query'
import type { CapacityGrowthResponse, CumulativeCapacityResponse, DateRange, FacilitySizeResponse, ProductionMixResponse, RenewableFilters, RenewableShareResponse, ResponsesByDistrictResponse, ResponsesByPeriodResponse, ResponsesBySizeResponse } from './types'

type Responses = {
  'production-mix': ProductionMixResponse
  'potential-by-industry': RenewableShareResponse
  'installed-capacity/cumulative': CumulativeCapacityResponse
  'installed-capacity/growth': CapacityGrowthResponse
  'installed-capacity/by-facility-size': FacilitySizeResponse
  'response-capacity/by-period': ResponsesByPeriodResponse
  'response-capacity/by-size': ResponsesBySizeResponse
  'response-capacity/by-district': ResponsesByDistrictResponse
}
type Resource = keyof Responses
type Filters = RenewableFilters | DateRange
const BASE = '/api/backend/api/v1/renewables'
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function resourceUrl(resource: Resource, filters: Filters, exporting = false) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return `${BASE}/${resource}${exporting ? '/export' : ''}${params.size ? `?${params}` : ''}`
}
async function requireSuccess(response: Response) {
  if (response.ok) return response
  let detail = ''
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object') {
      const message = 'detail' in body ? body.detail : 'error' in body ? body.error : undefined
      if (typeof message === 'string') detail = message
    }
  } catch { /* Proxy errors can be HTML. */ }
  throw new Error(`Renewable energy request failed (${response.status})${detail ? `: ${detail}` : '.'}`)
}
function useRenewableQuery<R extends Resource>(resource: R, filters: Filters, enabled = true) {
  return useQuery<Responses[R]>({
    queryKey: ['renewable-energy', resource, filters],
    queryFn: async ({ signal }) => {
      const response = await requireSuccess(await fetch(resourceUrl(resource, filters), { signal, headers: { Accept: 'application/json' } }))
      const data: unknown = await response.json()
      if (!data || typeof data !== 'object' || (resource === 'response-capacity/by-size'
        ? !('yearly_series' in data) || !Array.isArray(data.yearly_series)
        : !('series' in data) || !Array.isArray(data.series))) {
        throw new Error('Unexpected renewable energy response shape.')
      }
      return data as Responses[R]
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    placeholderData: () => undefined,
  })
}
export function useProductionMix(range: DateRange) { return useRenewableQuery('production-mix', range) }
export function useRenewableShare(range: DateRange) { return useRenewableQuery('potential-by-industry', range) }
export function useCumulativeCapacity(filters: RenewableFilters) { return useRenewableQuery('installed-capacity/cumulative', filters) }
export function useCapacityGrowth(filters: RenewableFilters) { return useRenewableQuery('installed-capacity/growth', filters) }
export function useFacilitySize(filters: RenewableFilters) { return useRenewableQuery('installed-capacity/by-facility-size', filters) }
export function useResponsesByPeriod(filters: RenewableFilters, enabled = true) { return useRenewableQuery('response-capacity/by-period', filters, enabled) }
export function useResponsesBySize() { return useRenewableQuery('response-capacity/by-size', {}) }
export function useResponsesByDistrict(filters: RenewableFilters) { return useRenewableQuery('response-capacity/by-district', filters) }

export function yearRangeSuffix(years: string[]): string | undefined {
  const sorted = [...new Set(years)].sort((a, b) => Number(a) - Number(b))
  return sorted.length > 1 ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted[0]
}
export function exportFilename(disposition: string | null, fallback: string, suffix?: string) {
  const extended = disposition?.match(/filename\*\s*=\s*(?:"UTF-8''([^"]*)"|UTF-8''([^;]*))/i)
  let filename: string | undefined
  if (extended) {
    try { filename = decodeURIComponent(extended[1] ?? extended[2]) } catch { /* Fall back to the ordinary filename. */ }
  }
  filename ??= disposition?.match(/(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i)?.slice(1).find(Boolean)?.trim()
  const safe = (filename?.split(/[\\/]/).pop() ?? '').replace(/[\p{Cc}\p{Cf}<>:"|?*]/gu, '').replace(/^[.\s]+|[.\s]+$/g, '')
  filename = safe && safe.length <= 200 && /\.xlsx$/i.test(safe) ? safe : fallback
  return suffix && !filename.includes(suffix) ? filename.replace(/\.xlsx$/i, `-${suffix}.xlsx`) : filename
}
export async function exportRenewableData(resource: Resource, filters: Filters, suffix?: string): Promise<void> {
  const response = await requireSuccess(await fetch(resourceUrl(resource, filters, true), { signal: AbortSignal.timeout(120_000), headers: { Accept: EXCEL_TYPE } }))
  const blob = await response.blob()
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (signature[0] !== 0x50 || signature[1] !== 0x4b || signature[2] !== 0x03 || signature[3] !== 0x04) throw new Error('The server did not return an Excel workbook.')
  const fallback = `${resource.startsWith('production') || resource.startsWith('potential') ? 'renewables-' : ''}${resource.replaceAll('/', '-')}.xlsx`
  const filename = exportFilename(response.headers.get('Content-Disposition'), fallback, suffix)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
