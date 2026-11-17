import { useQuery } from '@tanstack/react-query'
import { internationalComparisonSchema, israelForecastSchema } from './types'
import type { ComparisonFilters } from './types'

const BASE = '/api/backend/api/v1/renewables'
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const queryTiming = { staleTime: 5 * 60 * 1000, refetchInterval: 15 * 60 * 1000, placeholderData: () => undefined }

function comparisonParams(filters: ComparisonFilters) {
  return new URLSearchParams({ include_2050_targets: String(filters.include_2050_targets), include_solar_share: String(filters.include_solar_share) })
}
async function requireSuccess(response: Response) {
  if (response.ok) return response
  throw new Error(`Predictions request failed (${response.status}).`)
}
export function useIsraelForecast() {
  return useQuery({
    queryKey: ['predictions', 'israel-forecast'],
    queryFn: async ({ signal }) => {
      const response = await requireSuccess(await fetch(`${BASE}/renewable-forecast-israel`, { signal, headers: { Accept: 'application/json' } }))
      return israelForecastSchema.parse(await response.json())
    },
    ...queryTiming,
  })
}
export function useInternationalComparison(filters: ComparisonFilters) {
  return useQuery({
    queryKey: ['predictions', 'international-comparison', filters],
    queryFn: async ({ signal }) => {
      const response = await requireSuccess(await fetch(`${BASE}/international-renewable-comparison?${comparisonParams(filters)}`, { signal, headers: { Accept: 'application/json' } }))
      return internationalComparisonSchema.parse(await response.json())
    },
    ...queryTiming,
  })
}

function exportFilename(disposition: string | null, fallback: string) {
  const extended = disposition?.match(/filename\*\s*=\s*(?:"UTF-8''([^"]*)"|UTF-8''([^;]*))/i)
  let filename: string | undefined
  if (extended) {
    try { filename = decodeURIComponent(extended[1] ?? extended[2]) } catch { /* Fall back to the ordinary filename. */ }
  }
  filename ??= disposition?.match(/(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i)?.slice(1).find(Boolean)?.trim()
  const safe = (filename?.split(/[\\/]/).pop() ?? '').replace(/[\p{Cc}\p{Cf}<>:"|?*]/gu, '').replace(/^[.\s]+|[.\s]+$/g, '')
  return safe && safe.length <= 200 && /\.xlsx$/i.test(safe) ? safe : fallback
}
async function downloadWorkbook(url: string, fallback: string) {
  const response = await requireSuccess(await fetch(url, { signal: AbortSignal.timeout(120_000), headers: { Accept: EXCEL_TYPE } }))
  const blob = await response.blob()
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (!response.headers.get('Content-Type')?.toLowerCase().includes(EXCEL_TYPE) || signature[0] !== 0x50 || signature[1] !== 0x4b || signature[2] !== 0x03 || signature[3] !== 0x04) throw new Error('The server did not return an Excel workbook.')
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = objectUrl
    link.download = exportFilename(response.headers.get('Content-Disposition'), fallback)
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}
export function exportIsraelForecast() {
  return downloadWorkbook(`${BASE}/renewable-forecast-israel/export`, 'renewable-forecast-israel.xlsx')
}
export function exportInternationalComparison(filters: ComparisonFilters) {
  return downloadWorkbook(`${BASE}/international-renewable-comparison/export?${comparisonParams(filters)}`, 'international-renewable-comparison.xlsx')
}
