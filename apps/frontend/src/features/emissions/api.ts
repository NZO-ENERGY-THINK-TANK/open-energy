import { useQuery } from '@tanstack/react-query'
import {
  emissionsHistoryResponseSchema,
  emissionsIntensityResponseSchema,
  emissionsMixResponseSchema,
  emissionsRangeSchema,
} from './types'
import type { EmissionsRange } from './types'
import { apiFetch } from '@/lib/api'

const BASE = '/api/v1/co2'
const VIEW = 'month'
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const endpoints = {
  mix: 'emissions-mix',
  history: 'emissions-over-time',
  intensity: 'total-vs-ratio',
} as const
const caching = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  placeholderData: () => undefined,
}

function filterParams(range: EmissionsRange) {
  const { start, end } = emissionsRangeSchema.parse(range)
  return new URLSearchParams({ start_date: start, end_date: end, view: VIEW })
}

function requireSuccess(response: Response) {
  if (!response.ok)
    throw new Error(`Emissions request failed (${response.status}).`)
  return response
}

export function useEmissionsMix(range: EmissionsRange) {
  return useQuery({
    ...caching,
    queryKey: ['emissions', 'mix', range, VIEW],
    enabled: emissionsRangeSchema.safeParse(range).success,
    queryFn: async ({ signal }) => {
      const response = requireSuccess(
        await apiFetch(`${BASE}/${endpoints.mix}?${filterParams(range)}`, {
          signal,
          headers: { Accept: 'application/json' },
        }),
      )
      return emissionsMixResponseSchema.parse(await response.json())
    },
  })
}

export function useEmissionsHistory(range: EmissionsRange) {
  return useQuery({
    ...caching,
    queryKey: ['emissions', 'history', range, VIEW],
    enabled: emissionsRangeSchema.safeParse(range).success,
    queryFn: async ({ signal }) => {
      const response = requireSuccess(
        await apiFetch(`${BASE}/${endpoints.history}?${filterParams(range)}`, {
          signal,
          headers: { Accept: 'application/json' },
        }),
      )
      return emissionsHistoryResponseSchema.parse(await response.json())
    },
  })
}

export function useEmissionsIntensity(range: EmissionsRange) {
  return useQuery({
    ...caching,
    queryKey: ['emissions', 'intensity', range, VIEW],
    enabled: emissionsRangeSchema.safeParse(range).success,
    queryFn: async ({ signal }) => {
      const response = requireSuccess(
        await apiFetch(
          `${BASE}/${endpoints.intensity}?${filterParams(range)}`,
          {
            signal,
            headers: { Accept: 'application/json' },
          },
        ),
      )
      return emissionsIntensityResponseSchema.parse(await response.json())
    },
  })
}

function exportFilename(
  disposition: string | null,
  extension: 'xlsx' | 'csv',
  fallback: string,
) {
  const extended = disposition?.match(
    /filename\*\s*=\s*(?:"UTF-8''([^"]*)"|UTF-8''([^;]*))/i,
  )
  let filename: string | undefined
  if (extended) {
    try {
      filename = decodeURIComponent(extended[1] ?? extended[2])
    } catch {
      /* Try the ordinary filename instead. */
    }
  }
  filename ??= disposition
    ?.match(/(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i)
    ?.slice(1)
    .find(Boolean)
    ?.trim()
  return filename &&
    filename.length <= 200 &&
    !/[\p{Cc}\p{Cf}\\/<>:"|?*]/u.test(filename) &&
    !/^[.\s]|[.\s]$/.test(filename) &&
    filename.toLowerCase().endsWith(`.${extension}`)
    ? filename
    : fallback
}

export async function exportEmissions(
  kind: 'mix' | 'history' | 'intensity',
  range: EmissionsRange,
) {
  const params = filterParams(range)
  const csv = kind === 'intensity'
  const extension = csv ? 'csv' : 'xlsx'
  const mime = csv ? 'text/csv' : EXCEL_TYPE
  const response = requireSuccess(
    await apiFetch(
      `${BASE}/${endpoints[kind]}/${csv ? 'export-csv' : 'export'}?${params}`,
      {
        signal: AbortSignal.timeout(120_000),
        headers: { Accept: mime },
      },
    ),
  )
  if (
    response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !==
    mime
  )
    throw new Error(`The server did not return a valid ${extension} file.`)

  const blob = await response.blob()
  if (csv) {
    // Check the backend CSV header too: mislabeled JSON/HTML must not download.
    const header = (await blob.slice(0, 4096).text())
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/, 1)[0]
    if (!header.startsWith('period,label,total_emissions,emissions_ratio,'))
      throw new Error('The server did not return an emissions CSV.')
  } else {
    const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
    if (
      signature[0] !== 0x50 ||
      signature[1] !== 0x4b ||
      signature[2] !== 0x03 ||
      signature[3] !== 0x04
    )
      throw new Error('The server did not return an Excel workbook.')
  }

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = objectUrl
    link.download = exportFilename(
      response.headers.get('Content-Disposition'),
      extension,
      `co2_${endpoints[kind].replaceAll('-', '_')}_${range.start}_to_${range.end}.${extension}`,
    )
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}
