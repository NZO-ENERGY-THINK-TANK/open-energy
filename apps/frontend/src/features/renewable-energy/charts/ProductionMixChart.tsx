import { useState } from 'react'
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

import { endOfMonth, format } from 'date-fns'
import QueryContent from '@/components/data/QueryContent'
import { exportRenewableData, useProductionMix } from '../api'
import type { ProductionMixResponse, ProductionMixPoint } from '../types'
import {
  ChartCard,
  EmptyChart,
  FilterSelect,
  MultiSelect,
  SourceNotes,
} from './ChartControls'

const series = [
  { key: 'other_mwh', label: 'אחר', color: '#2F6497' },
  { key: 'solar_mwh', label: 'סולארי', color: '#F1C40F' },
  { key: 'wind_mwh', label: 'רוח', color: '#7BC94A' },
]
const months = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

function productionMixRows(
  response: ProductionMixResponse,
  year: string,
  selectedMonths: string[],
) {
  const allowed = new Set(
    selectedMonths.map((month) => `${year}-${month.padStart(2, '0')}`),
  )
  const single = selectedMonths.length === 1
  const source =
    response.filter === 'year' && response.monthly_series?.length && !single
      ? response.monthly_series
      : response.series
  const filtered = source.filter((point) =>
    allowed.has(point.period.slice(0, 7)),
  )
  const points =
    single || filtered.some((point) => /^\d{4}-\d{2}$/.test(point.period))
      ? filtered
      : (() => {
          const buckets = new Map<string, ProductionMixPoint>()
          for (const point of filtered) {
            const period = point.period.slice(0, 7)
            const bucket = buckets.get(period) ?? {
              period,
              solar_mwh: 0,
              wind_mwh: 0,
              other_mwh: 0,
              total_mwh: 0,
            }
            bucket.solar_mwh += point.solar_mwh || 0
            bucket.wind_mwh += point.wind_mwh || 0
            bucket.other_mwh += point.other_mwh || 0
            buckets.set(period, bucket)
          }
          return [...buckets.values()].sort((a, b) =>
            a.period.localeCompare(b.period),
          )
        })()
  return points.map((point) => ({
    ...point,
    label: /^\d{4}-\d{2}$/.test(point.period)
      ? months[Number(point.period.slice(5, 7)) - 1]
      : point.label || point.period,
  }))
}

export function ProductionMixPlot({
  data,
}: {
  data: ReturnType<typeof productionMixRows>
}) {
  const [hidden, setHidden] = useState<string[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const visible = series.filter((item) => !hidden.includes(item.key))
  const rows = data.map((point) => ({
    ...point,
    visibleTotal: Math.round(
      visible.reduce(
        (sum, item) =>
          sum + ((point[item.key as keyof ProductionMixPoint] as number) || 0),
        0,
      ),
    ),
  }))
  return (
    <>
      <div dir="ltr" className="h-[320px] min-w-0 md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="6 6" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              width={92}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => v.toLocaleString()}
              label={{
                value: '[MWh]',
                angle: -90,
                position: 'insideLeft',
                dx: 5,
              }}
            />
            <Tooltip
              isAnimationActive={false}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div
                    dir="rtl"
                    className="min-w-[140px] rounded-lg border border-[#DEDEDE] bg-white p-4 text-sm shadow-xl"
                  >
                    <p className="mb-2 text-xs text-gray-500">{label}</p>
                    <p className="mb-3 border-b border-[#707585] font-medium">
                      {Number(payload[0].payload.visibleTotal).toLocaleString()}{' '}
                      MWh
                    </p>
                    {[...payload].reverse().map((entry) => (
                      <p
                        key={String(entry.dataKey)}
                        className="mb-1 flex items-center gap-2"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ background: entry.color }}
                        />
                        {
                          series.find((item) => item.key === entry.dataKey)
                            ?.label
                        }
                        : {Number(entry.value).toLocaleString()} MWh
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            {visible.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                barSize={28}
                opacity={hovered && hovered !== item.key ? 0.3 : 1}
                radius={index === visible.length - 1 ? [4, 4, 0, 0] : undefined}
              >
                {index === visible.length - 1 && (
                  <LabelList
                    dataKey="visibleTotal"
                    position="top"
                    formatter={(value) => Number(value).toLocaleString()}
                    style={{ fill: '#707585', fontWeight: 500, fontSize: 14 }}
                  />
                )}
              </Bar>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 p-4">
        {[...series].reverse().map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={!hidden.includes(item.key)}
            onClick={() =>
              setHidden((current) =>
                current.includes(item.key)
                  ? current.filter((key) => key !== item.key)
                  : [...current, item.key],
              )
            }
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(item.key)}
            onBlur={() => setHovered(null)}
            className="flex items-center gap-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{
              opacity: hidden.includes(item.key)
                ? 0.4
                : hovered && hovered !== item.key
                  ? 0.3
                  : 1,
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}

function toggleMonthRange(
  selected: string[],
  month: string,
  options: string[],
) {
  const current = selected.length ? selected : options
  const min = Math.min(...current.map(Number))
  const max = Math.max(...current.map(Number))
  const clicked = Number(month)
  let lo = min
  let hi = max
  if (clicked < min || clicked > max) {
    lo = Math.min(min, clicked)
    hi = Math.max(max, clicked)
  } else if (min === max || (clicked > min && clicked < max)) return [month]
  else if (clicked === min) lo++
  else hi--
  return options.filter((value) => Number(value) >= lo && Number(value) <= hi)
}

export default function ProductionMixChart() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const [year, setYear] = useState(String(currentYear))
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() =>
    Array.from({ length: currentMonth }, (_, index) => String(index + 1)),
  )
  const availableMonths = Array.from(
    { length: Number(year) === currentYear ? currentMonth : 12 },
    (_, index) => String(index + 1),
  )
  const validMonths = selectedMonths.length
    ? selectedMonths.filter((month) => availableMonths.includes(month))
    : availableMonths
  const effectiveMonths = validMonths.length
    ? validMonths
    : [availableMonths[availableMonths.length - 1]]
  const range = {
    start_date: format(
      new Date(Number(year), Math.min(...effectiveMonths.map(Number)) - 1, 1),
      'yyyy-MM-dd',
    ),
    end_date: format(
      endOfMonth(
        new Date(Number(year), Math.max(...effectiveMonths.map(Number)) - 1, 1),
      ),
      'yyyy-MM-dd',
    ),
  }
  const query = useProductionMix(range)
  const data = query.data
    ? productionMixRows(query.data, year, effectiveMonths)
    : []
  const all = effectiveMonths.length === availableMonths.length
  const summary = all
    ? 'כל החודשים'
    : effectiveMonths.length === 1
      ? months[Number(effectiveMonths[0]) - 1]
      : `${effectiveMonths.length} חודשים`
  return (
    <ChartCard
      title="תמהיל ייצור אנרגיה מתחדשת"
      apiHash="renewables-production-mix"
      notes={<SourceNotes />}
      onExport={() => exportRenewableData('production-mix', range)}
      filters={
        <div className="flex flex-wrap items-end gap-5">
          <span className="pb-1 text-sm text-slate-600">סינון לפי:</span>
          <FilterSelect
            label="שנה"
            value={year}
            onChange={setYear}
            options={Array.from(
              { length: Math.max(0, currentYear - 2020) },
              (_, index) => ({
                value: String(currentYear - index),
                label: String(currentYear - index),
              }),
            )}
          />
          <MultiSelect
            label="חודש"
            values={effectiveMonths}
            onChange={setSelectedMonths}
            options={availableMonths.map((value) => ({
              value,
              label: months[Number(value) - 1],
            }))}
            summary={summary}
            onToggle={(month) =>
              setSelectedMonths(
                toggleMonthRange(effectiveMonths, month, availableMonths),
              )
            }
            onToggleAll={() =>
              setSelectedMonths(
                all ? [availableMonths[availableMonths.length - 1]] : [],
              )
            }
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
          <ProductionMixPlot data={data} />
        ) : (
          !query.isError && <EmptyChart />
        )}
      </QueryContent>
    </ChartCard>
  )
}
