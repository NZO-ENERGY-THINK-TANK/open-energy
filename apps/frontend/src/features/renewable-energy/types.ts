export type RenewableEnergyTopic = 'production' | 'facilities' | 'requests'
export type ChartMetric = 'capacity' | 'count'
export type DateRange = { start_date: string; end_date: string }
export type RenewableFilters = { year?: number; district?: string; technology?: string; response_type?: string; include_cancelled?: boolean }
export type ProductionMixPoint = { period: string; label?: string; solar_mwh: number; wind_mwh: number; other_mwh: number; total_mwh: number }
export type ProductionMixResponse = {
  start_date: string
  end_date: string
  filter: 'day' | 'month' | 'year'
  series: ProductionMixPoint[]
  monthly_series?: ProductionMixPoint[]
  data_availability_note?: string | null
}
export type RenewableShareResponse = {
  start_date: string
  end_date: string
  series: { date?: string; period?: string; month?: string; solar_mwh?: number; wind_mwh?: number; other_mwh?: number; renewable_mwh?: number; total_mwh: number }[]
  data_availability_note?: string | null
}
export type CumulativeCapacityResponse = {
  series: { period: string; cumulative_mw: number; added_mw: number }[]
  technology_breakdown?: Record<string, number>
}
export type CapacityGrowthResponse = {
  series: { year: number; added_mw: number; cumulative_mw: number; growth_rate_percent: number | null }[]
  technology_breakdown?: Record<string, number>
}
export type BracketStat = number | { total_mw?: number; facility_count?: number; count?: number }
export type FacilitySizeResponse = { series: { year: number; size_brackets: Record<string, BracketStat> }[] }
export type ResponseBreakdown = Partial<Record<'Negative' | 'Limited Positive' | 'Partial Positive' | 'Positive', number | { total_mw?: number; count?: number }>>
export type ResponsesByPeriodResponse = {
  series: { period: string; total_mw: number; request_count: number; response_type_breakdown?: ResponseBreakdown }[]
  response_type_breakdown: ResponseBreakdown
}
export type ResponsesBySizeResponse = { yearly_series?: { year: number; size_brackets: Record<string, BracketStat> }[] }
export type ResponsesByDistrictResponse = {
  series: { district: string; total_mw: number; request_count: number; response_breakdown?: ResponseBreakdown }[]
  district_response_breakdown?: Record<string, ResponseBreakdown>
}
