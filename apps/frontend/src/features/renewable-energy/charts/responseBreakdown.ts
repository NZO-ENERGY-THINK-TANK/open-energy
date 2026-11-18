import type { ChartMetric, ResponseBreakdown } from '../types'

export const responseSeries = [
  { key: 'negative', apiKey: 'Negative', label: 'שלילית', color: '#A66565' },
  {
    key: 'limitedPositive',
    apiKey: 'Limited Positive',
    label: 'חיובית מוגבלת',
    color: '#6B707C',
  },
  {
    key: 'partialPositive',
    apiKey: 'Partial Positive',
    label: 'חיובית חלקית',
    color: '#957669',
  },
  { key: 'positive', apiKey: 'Positive', label: 'חיובית', color: '#60A261' },
] as const

export function responseStat(
  value: ResponseBreakdown[keyof ResponseBreakdown],
  mode: ChartMetric,
) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  return mode === 'capacity' ? (value?.total_mw ?? 0) : (value?.count ?? 0)
}
