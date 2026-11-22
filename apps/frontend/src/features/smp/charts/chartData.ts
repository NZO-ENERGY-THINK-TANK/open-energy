import type { ProductionVsMarginalPriceResponse, SMPResponse } from '../types'

export type ChartView = 'half-hour' | 'daily' | 'monthly' | 'yearly'
export type ChartRow = {
  period: string
  withConstraints: number | null
  withoutConstraints: number | null
  generation: number | null
}

export const viewNames: Record<ChartView, string> = {
  'half-hour': 'נתונים חצי־שעתיים',
  daily: 'נתונים יומיים',
  monthly: 'נתונים חודשיים',
  yearly: 'נתונים שנתיים',
}

export function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function requestedView(
  start: string,
  end: string,
  comparison: boolean,
): ChartView {
  // Dates describe the effective range, not observed coverage. UTC here is only
  // calendar arithmetic; source-local chart timestamps are never converted.
  const days = (Date.parse(end) - Date.parse(start)) / 86_400_000
  if (!Number.isFinite(days) || days < 0) return 'half-hour'
  if (days <= 1 || (!comparison && days < 28)) return 'half-hour'
  if (days <= 61) return 'daily'
  if (days < 730) return 'monthly'
  return 'yearly'
}

type Aggregate = {
  period: string
  price_with_constraints: number | null
  price_without_constraints: number | null
  net_demand: number | null
}

function aggregateRows(rows: Aggregate[] = []): ChartRow[] {
  return rows.map((row) => ({
    period: row.period,
    withConstraints: finite(row.price_with_constraints),
    withoutConstraints: finite(row.price_without_constraints),
    generation: finite(row.net_demand),
  }))
}

function rawRows(
  rows: Array<Omit<Aggregate, 'period'> & { timestamp: string }> = [],
): ChartRow[] {
  return aggregateRows(rows.map((row) => ({ ...row, period: row.timestamp })))
}

function selectView(
  start: string,
  end: string,
  candidates: Partial<Record<ChartView, ChartRow[]>>,
  comparison: boolean,
) {
  const requested = requestedView(start, end, comparison)
  const views: ChartView[] = ['half-hour', 'daily', 'monthly', 'yearly']
  const index = views.indexOf(requested)
  // Prefer the requested resolution, then finer returned data, then coarser.
  // Never manufacture an aggregate or relabel a fallback as the requested view.
  const preference = [
    requested,
    ...views.slice(0, index).reverse(),
    ...views.slice(index + 1),
  ]
  const hasValues = (row: ChartRow) =>
    row.withConstraints !== null ||
    row.withoutConstraints !== null ||
    (comparison && row.generation !== null)
  const view =
    preference.find((key) => candidates[key]?.some(hasValues)) ?? requested
  const rows = (candidates[view] ?? [])
    .filter((row) => Boolean(row.period))
    .slice()
    .sort((a, b) => a.period.localeCompare(b.period))
  return {
    view,
    requested,
    rows,
    generationUnit: view === 'half-hour' ? 'MW' : 'MWh',
  }
}

export function getSMPPriceView(data: SMPResponse) {
  const points = new Map<string, ChartRow>()
  const pointAt = (period: string) => {
    let row = points.get(period)
    if (!row) {
      row = {
        period,
        withConstraints: null,
        withoutConstraints: null,
        generation: null,
      }
      points.set(period, row)
    }
    return row
  }
  // Samples retain rows where both prices are missing; the separate price
  // arrays omit missing values. Union by timestamp, never by array position.
  for (const row of data.samples ?? []) pointAt(row.timestamp)
  for (const row of data.chart_with_constraints ?? []) {
    pointAt(row.timestamp).withConstraints = finite(row.price)
  }
  for (const row of data.chart_without_constraints ?? []) {
    pointAt(row.timestamp).withoutConstraints = finite(row.price)
  }
  return selectView(
    data.start_date,
    data.end_date,
    {
      'half-hour': [...points.values()],
      daily: aggregateRows(data.daily_average),
      monthly: aggregateRows(data.monthly_average),
    },
    false,
  )
}

export function getProductionComparisonView(
  data: ProductionVsMarginalPriceResponse,
) {
  let halfHourly = rawRows(data.combined_series)
  if (!halfHourly.length) halfHourly = rawRows(data.correlation_by_view?.day)
  if (!halfHourly.length) {
    const points = new Map<string, ChartRow>()
    for (const row of data.smp_series ?? []) {
      points.set(row.timestamp, {
        period: row.timestamp,
        withConstraints: finite(row.price_with_constraints),
        withoutConstraints: finite(row.price_without_constraints),
        generation: null,
      })
    }
    for (const row of data.net_demand_series ?? []) {
      const point = points.get(row.timestamp) ?? {
        period: row.timestamp,
        withConstraints: null,
        withoutConstraints: null,
        generation: null,
      }
      point.generation = finite(row.net_demand)
      points.set(row.timestamp, point)
    }
    halfHourly = [...points.values()]
  }
  return selectView(
    data.start_date,
    data.end_date,
    {
      'half-hour': halfHourly,
      daily: aggregateRows(data.daily_average),
      monthly: aggregateRows(
        data.monthly_average?.length
          ? data.monthly_average
          : data.correlation_by_view?.month,
      ),
      yearly: aggregateRows(
        data.yearly_average?.length
          ? data.yearly_average
          : data.correlation_by_view?.year,
      ),
    },
    true,
  )
}

export function getProductionCorrelationView(
  data: ProductionVsMarginalPriceResponse,
) {
  const days =
    (Date.parse(data.end_date) - Date.parse(data.start_date)) / 86_400_000
  const timeView = getProductionComparisonView(data)
  const rows =
    days < 62
      ? rawRows(
          data.correlation_by_view?.day?.length
            ? data.correlation_by_view.day
            : data.combined_series,
        )
      : aggregateRows(
          days < 730
            ? data.correlation_by_view?.month
            : data.correlation_by_view?.year,
        )

  return rows.length
    ? {
        ...timeView,
        rows,
        view:
          days < 62
            ? ('half-hour' as const)
            : days < 730
              ? ('monthly' as const)
              : ('yearly' as const),
        requested:
          days < 62
            ? ('half-hour' as const)
            : days < 730
              ? ('monthly' as const)
              : ('yearly' as const),
        generationUnit: days < 62 ? 'MW' : 'MWh',
      }
    : timeView
}

export function periodLabel(period: string): string {
  // Format the literal source-local components, independent of browser timezone.
  const [date, time] = period.split('T')
  const [year, month, day] = date.split('-')
  const label = day
    ? `${day}/${month}/${year}`
    : month
      ? `${month}/${year}`
      : year
  return time ? `${label} ${time.slice(0, 5)}` : label
}

export function viewDescription(view: ChartView, requested: ChartView): string {
  return view === requested
    ? viewNames[view]
    : `${viewNames[view]} — הרזולוציה המבוקשת אינה זמינה בתשובה; מוצגים נתונים זמינים ללא חישוב מחדש.`
}
