export type DateRange = {
  start: string
  end: string
}

type View = 'day' | 'month' | 'year'

type NullablePrices = {
  price_with_constraints: number | null
  price_without_constraints: number | null
}

type PricePoint = {
  timestamp: string
  /** Price in ₪/MWh. */
  price: number
}

type GenerationAggregate = NullablePrices & {
  /** YYYY-MM-DD, YYYY-MM, or YYYY depending on the aggregate. */
  period: string
  /** Total generation in MWh, not mean MW or demand minus renewables. */
  net_demand: number | null
}

type GenerationPoint = NullablePrices & {
  /** Source-local timestamp without a timezone offset; not UTC. */
  timestamp: string
  /** Mean total generation in MW over the half-hour bin. */
  net_demand: number | null
}

type ProductionAggregate = GenerationAggregate & {
  /** Mean price in ₪/MWh; month/year prices are means of daily means. */
  avg_smp: number | null
}

export type SMPResponse = {
  /** Effective backend range in YYYY-MM-DD, not observed data coverage. */
  start_date: string
  end_date: string
  view: View
  chart_with_constraints: PricePoint[]
  chart_without_constraints: PricePoint[]
  correlation_view: Array<PricePoint & { net_demand: number }>
  daily_average: GenerationAggregate[]
  monthly_average: GenerationAggregate[]
  /** Included only for the day view. Prices are in ₪/MWh; generation is MW. */
  samples?: Array<GenerationPoint & { date: string }>
}

export type ProductionVsMarginalPriceResponse = {
  /** Effective backend range in YYYY-MM-DD, not observed data coverage. */
  start_date: string
  end_date: string
  view: View
  smp_series: Array<{
    timestamp: string
    /** Price in ₪/MWh; the backend mirrors a lone constraint price. */
    smp: number
    price_with_constraints: number
    price_without_constraints: number
  }>
  net_demand_series: Array<{
    timestamp: string
    /** Mean total generation in MW over the half-hour bin. */
    net_demand: number
  }>
  combined_series: Array<GenerationPoint & { smp: number | null }>
  /** Same rows as correlation_by_view.day, not { smp, net_demand } pairs. */
  correlation: GenerationPoint[]
  correlation_by_view: {
    day: GenerationPoint[]
    month: GenerationAggregate[]
    year: GenerationAggregate[]
  }
  daily_average: ProductionAggregate[]
  monthly_average: ProductionAggregate[]
  yearly_average: ProductionAggregate[]
  /** These prices divide daily sums by a fixed 48, even for incomplete days. */
  daily_smp: Array<{
    date: string
    daily_smp_avg: number
    daily_smp_avg_with_constraints: number | null
    daily_smp_avg_without_constraints: number | null
  }>
}
