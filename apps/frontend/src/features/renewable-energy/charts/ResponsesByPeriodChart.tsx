import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useState } from 'react'
import QueryContent from '@/components/data/QueryContent'
import {
  exportRenewableData,
  useResponsesByPeriod,
  yearRangeSuffix,
} from '../api'
import {
  ChartCard,
  EmptyChart,
  Legend,
  ModeSwitch,
  MultiSelect,
  SourceNotes,
  StackTooltip,
} from './ChartControls'
import { useChartLegend } from './useChartLegend'
import { responseSeries, responseStat } from './responseBreakdown'
import type {
  ChartMetric,
  ResponseBreakdown,
  ResponsesByPeriodResponse,
} from '../types'
function allocateIntegerShares(total: number, weights: number[]) {
  if (total <= 0) return weights.map(() => 0)
  const safe = weights.map((value) =>
    Number.isFinite(value) && value > 0 ? value : 0,
  )
  const sum = safe.reduce((a, b) => a + b, 0)
  const exact = safe.map((value) =>
    sum > 0 ? (total * value) / sum : total / safe.length,
  )
  const result = exact.map(Math.floor)
  let remaining = total - result.reduce((a, b) => a + b, 0)
  const order = exact
    .map((value, index) => ({ index, fraction: value - result[index] }))
    .sort((a, b) => b.fraction - a.fraction)
  for (const item of order) {
    if (remaining <= 0) break
    result[item.index]++
    remaining--
  }
  return result
}
function responsePeriodRows(
  response: ResponsesByPeriodResponse,
  years: string[],
  mode: ChartMetric,
) {
  const single = years.length === 1
  const points = response.series.filter(
    (point) => !years.length || years.includes(point.period.slice(0, 4)),
  )
  const buckets = new Map<
    string,
    {
      total_mw: number
      request_count: number
      response_type_breakdown?: ResponseBreakdown
    }
  >()
  for (const point of points) {
    const key = single
      ? point.period.split('-')[1] || point.period
      : point.period.split('-')[0]
    const bucket = buckets.get(key) ?? {
      total_mw: 0,
      request_count: 0,
      response_type_breakdown: single
        ? point.response_type_breakdown
        : undefined,
    }
    bucket.total_mw += point.total_mw
    bucket.request_count += point.request_count
    buckets.set(key, bucket)
  }
  return [...buckets]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, point]) => {
      const breakdown =
        point.response_type_breakdown ?? response.response_type_breakdown
      const weights = responseSeries.map((item) =>
        responseStat(breakdown[item.apiKey], mode),
      )
      const sum = weights.reduce((a, b) => a + b, 0)
      const shares = weights.map((value) =>
        sum > 0 ? value / sum : 1 / weights.length,
      )
      // The backend has no per-period breakdown: preserve the legacy global allocation.
      const values =
        mode === 'capacity'
          ? shares.map((share) => point.total_mw * share)
          : allocateIntegerShares(point.request_count, shares)
      return {
        period,
        ...Object.fromEntries(
          responseSeries.map((item, index) => [item.key, values[index]]),
        ),
      }
    })
}

export function ResponsesByPeriodPlot({
  data,
  mode,
  monthly,
}: {
  data: ReturnType<typeof responsePeriodRows>
  mode: ChartMetric
  monthly: boolean
}) {
  const legend = useChartLegend()
  const visible = responseSeries.filter(
    (item) => !legend.hidden.includes(item.key),
  )
  const rows = data.map((row) => ({
    ...row,
    visibleTotal: Math.round(
      visible.reduce(
        (sum, item) => sum + Number(row[item.key as keyof typeof row] || 0),
        0,
      ),
    ),
  }))
  return (
    <>
      <div dir="ltr" className="h-[300px] min-w-0 md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 20, right: 20, left: 60, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="6 6" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis
              width={92}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => value.toLocaleString()}
              label={{
                value: mode === 'capacity' ? 'הספק  [MW]' : 'מספר מתקנים',
                angle: -90,
                position: 'insideLeft',
                dx: 5,
              }}
            />
            <Tooltip
              isAnimationActive={false}
              content={(props) => (
                <StackTooltip
                  {...props}
                  unit={mode === 'capacity' ? 'MW' : 'מתקנים'}
                  series={[...responseSeries]}
                />
              )}
            />
            {visible.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                barSize={monthly ? 36 : 80}
                opacity={
                  legend.hovered && legend.hovered !== item.key ? 0.3 : 1
                }
              >
                {index === visible.length - 1 && (
                  <LabelList
                    dataKey="visibleTotal"
                    position="top"
                    formatter={(value) =>
                      Math.round(Number(value)).toLocaleString()
                    }
                    style={{ fill: '#707585', fontWeight: 400, fontSize: 14 }}
                  />
                )}
              </Bar>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Legend series={[...responseSeries]} {...legend} />
    </>
  )
}

export default function ResponsesByPeriodChart() {
  const [years, setYears] = useState<string[]>([])
  const [mode, setMode] = useState<ChartMetric>('capacity')
  const filters = { year: years.length === 1 ? Number(years[0]) : undefined }
  const query = useResponsesByPeriod(filters)
  const data = query.data ? responsePeriodRows(query.data, years, mode) : []
  const availableYears = [
    ...new Set(
      query.data?.series.map((point) => point.period.split('-')[0]) ?? [],
    ),
  ].sort((a, b) => Number(b) - Number(a))
  return (
    <ChartCard
      title="תשובות מחלק לבקשות חיבור מתקנים לרשת"
      apiHash="response-capacity-by-period"
      notes={<SourceNotes facilities />}
      onExport={() =>
        exportRenewableData(
          'response-capacity/by-period',
          filters,
          yearRangeSuffix(years.length ? years : availableYears),
        )
      }
      filters={
        <div className="flex flex-wrap items-end gap-5">
          <span className="pb-1 text-sm text-slate-600">מיון לפי:</span>
          <MultiSelect
            label="שנה"
            values={years}
            onChange={setYears}
            onToggle={(year) =>
              setYears((current) =>
                current.includes(year)
                  ? current.filter((value) => value !== year)
                  : [...current, year],
              )
            }
            options={availableYears.map((value) => ({ value, label: value }))}
          />
        </div>
      }
    >
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={data.length > 0}
        onRetry={() => void query.refetch()}
      >
        {data.length ? (
          <ResponsesByPeriodPlot
            data={data}
            mode={mode}
            monthly={years.length === 1}
          />
        ) : (
          !query.isError && <EmptyChart />
        )}
      </QueryContent>
      <ModeSwitch
        value={mode}
        onChange={(value) => setMode(value as ChartMetric)}
        options={[
          { value: 'capacity', label: 'הספק מתקנים' },
          { value: 'count', label: 'מספר מתקנים' },
        ]}
      />
    </ChartCard>
  )
}
