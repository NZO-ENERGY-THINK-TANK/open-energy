import { useQuery } from '@tanstack/react-query'
import { climateRangeSchema, climateResponseSchema, climateViewSchema } from './types'
import type { ClimateRange, ClimateView } from './types'

const BASE = '/api/backend/api/v1/heat-load-vs-generation'
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function getClimateView(range: ClimateRange): ClimateView {
  climateRangeSchema.parse(range)
  // ISO date-only strings parse as UTC, so endpoint differences are independent of DST.
  const days = (Date.parse(range.end) - Date.parse(range.start)) / 86_400_000
  return days <= 62 ? 'month' : days <= 730 ? 'year' : 'custom'
}

function filterParams(range: ClimateRange, view: ClimateView) {
  climateRangeSchema.parse(range)
  climateViewSchema.parse(view)
  return new URLSearchParams({ start_date: range.start, end_date: range.end, view })
}

async function requireSuccess(response: Response) {
  if (!response.ok) throw new Error(`Climate request failed (${response.status}).`)
  return response
}

export function useHeatLoadGeneration(range: ClimateRange, view: ClimateView) {
  return useQuery({
    queryKey: ['climate', 'heat-load-vs-generation', range, view],
    queryFn: async ({ signal }) => {
      const response = await requireSuccess(await fetch(`${BASE}/?${filterParams(range, view)}`, { signal, headers: { Accept: 'application/json' } }))
      return climateResponseSchema.parse(await response.json())
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: () => undefined,
  })
}

function exportFilename(disposition: string | null, fallback: string) {
  const extended = disposition?.match(/filename\*\s*=\s*(?:"UTF-8''([^"]*)"|UTF-8''([^;]*))/i)
  let filename: string | undefined
  if (extended) {
    try { filename = decodeURIComponent(extended[1] ?? extended[2]) } catch { /* Use the ordinary filename instead. */ }
  }
  filename ??= disposition?.match(/(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i)?.slice(1).find(Boolean)?.trim()
  return filename && filename.length <= 200 && !/[\p{Cc}\p{Cf}\\/<>:"|?*]/u.test(filename) && !/^[.\s]|[.\s]$/.test(filename) && /\.xlsx$/i.test(filename) ? filename : fallback
}

export async function exportHeatLoadGeneration(range: ClimateRange, view: ClimateView) {
  const response = await requireSuccess(await fetch(`${BASE}/export?${filterParams(range, view)}`, {
    signal: AbortSignal.timeout(120_000), headers: { Accept: EXCEL_TYPE },
  }))
  const blob = await response.blob()
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== EXCEL_TYPE || signature[0] !== 0x50 || signature[1] !== 0x4b || signature[2] !== 0x03 || signature[3] !== 0x04) throw new Error('The server did not return an Excel workbook.')
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = objectUrl
    link.download = exportFilename(response.headers.get('Content-Disposition'), `heat_load_vs_generation_${range.start}_to_${range.end}.xlsx`)
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}
