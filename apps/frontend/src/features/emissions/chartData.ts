import type {
  EmissionsHistoryResponse,
  EmissionsIntensityResponse,
  EmissionsMixResponse,
} from './types'

export const FUELS = [
  { key: 'coal', label: 'פחם', color: '#6B707C' },
  { key: 'diesel', label: 'סולר', color: '#1C1A17' },
  { key: 'natural_gas', label: 'גז טבעי', color: '#957669' },
  { key: 'fuel_oil', label: 'שמן הסקה', color: '#9A7B4F' },
  { key: 'methanol', label: 'מתנול', color: '#6B8E7D' },
] as const

export function formatNumber(value: number, decimals = 2) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const dayFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const monthFormatter = new Intl.DateTimeFormat('he-IL', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatPeriod(period: string) {
  const monthly = /^\d{4}-\d{2}$/.test(period)
  const date = new Date(
    monthly ? `${period}-01T00:00:00Z` : `${period.slice(0, 10)}T00:00:00Z`,
  )
  if (Number.isNaN(date.getTime())) return period
  if (monthly) return monthFormatter.format(date)
  const label = dayFormatter.format(date)
  return period.length > 10 ? `${label} ${period.slice(11)}` : label
}

export function getMixSlices(response: EmissionsMixResponse | undefined) {
  const values = response?.level2?.fossil_emissions
  const total = response?.total_emissions
  if (!values || total == null || !Number.isFinite(total) || total < 0)
    return null

  const slices = []
  for (const fuel of FUELS) {
    const value = values[fuel.key]
    if (value == null || !Number.isFinite(value) || value < 0) return null
    slices.push({
      ...fuel,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
    })
  }
  // Five independently rounded fuels and the rounded total may differ by 0.03 tons.
  const sum = slices.reduce((value, slice) => value + slice.value, 0)
  if (
    !Number.isFinite(sum) ||
    (total === 0 && sum !== 0) ||
    Math.abs(sum - total) > 0.030001
  )
    return null
  // Keep the familiar three fuels even at zero; extra fuels appear when nonzero.
  return slices.filter((slice, index) => index < 3 || slice.value !== 0)
}

export function getHistoryPoints(
  response: EmissionsHistoryResponse | undefined,
) {
  return (response?.chart_data ?? []).map((point) => ({
    period: point.period,
    fossil: point.level1?.fossil_emissions ?? point.total_emissions ?? null,
    savings:
      point.level1?.renewable_emissions_savings ??
      point.level2?.renewable_emissions_savings?.renewables ??
      point.emissions_savings ??
      null,
    // The backend exposes both hierarchy and direct fields; prefer hierarchy.
    coal: point.level2?.fossil_emissions?.coal ?? point.coal ?? null,
    diesel: point.level2?.fossil_emissions?.diesel ?? point.diesel ?? null,
    natural_gas:
      point.level2?.fossil_emissions?.natural_gas ?? point.natural_gas ?? null,
    fuel_oil:
      point.level2?.fossil_emissions?.fuel_oil ?? point.fuel_oil ?? null,
    methanol:
      point.level2?.fossil_emissions?.methanol ?? point.methanol ?? null,
  }))
}

export function getIntensityPoints(
  response: EmissionsIntensityResponse | undefined,
) {
  return (response?.chart_data ?? []).map((point) => ({
    period: point.period,
    total: point.total_emissions ?? point.level1?.fossil_emissions ?? null,
    // Preserve the supplied ratio; the endpoint's extra /12 is not corrected here.
    ratio: point.emissions_ratio ?? null,
  }))
}
