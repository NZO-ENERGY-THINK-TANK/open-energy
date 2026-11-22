import { useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { format } from 'date-fns'
import QueryContent from '@/components/data/QueryContent'
import { exportRenewableData, useRenewableShare } from '../api'
import type { RenewableShareResponse } from '../types'
import { ChartCard, EmptyChart, ModeSwitch, SourceNotes } from './ChartControls'
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
const colors: Record<string, string> = {
  '2021': '#8BBFE1',
  '2022': '#3A7C2F',
  '2023': '#A7BF56',
  '2024': '#DACF61',
  '2025': '#8BBFE1',
  '2026': '#3A7C2F',
}

function renewableShareRows(
  response: RenewableShareResponse,
  mode: 'share' | 'production',
) {
  const buckets = new Map<
    string,
    { renewable: number; technology: number; total: number }
  >()
  for (const point of response.series) {
    const date = point.date ?? point.period ?? point.month
    if (!date || !/^\d{4}-\d{2}/.test(date)) continue
    const key = date.slice(0, 7)
    const bucket = buckets.get(key) ?? { renewable: 0, technology: 0, total: 0 }
    const technology =
      (point.solar_mwh || 0) + (point.wind_mwh || 0) + (point.other_mwh || 0)
    bucket.renewable += point.renewable_mwh ?? technology
    bucket.technology += technology
    bucket.total += point.total_mwh || 0
    buckets.set(key, bucket)
  }
  const years = [
    ...new Set([...buckets.keys()].map((key) => key.slice(0, 4))),
  ].sort()
  const data = months
    .map((month, index) => {
      const row: Record<string, string | number> = { month }
      for (const year of years) {
        const bucket = buckets.get(
          `${year}-${String(index + 1).padStart(2, '0')}`,
        )
        if (!bucket) continue
        const value =
          mode === 'share'
            ? bucket.total > 0
              ? (bucket.renewable / bucket.total) * 100
              : 0
            : bucket.technology
        if (value > 0)
          row[year] =
            mode === 'share' ? Number(value.toFixed(2)) : Math.round(value)
      }
      return row
    })
    .filter((row) => years.some((year) => typeof row[year] === 'number'))
  return { years, data }
}

export function RenewableSharePlot({
  data,
  years,
  mode,
}: ReturnType<typeof renewableShareRows> & { mode: 'share' | 'production' }) {
  const [hidden, setHidden] = useState<string[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <>
      <div dir="ltr" className="h-[300px] min-w-0 md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            barGap={6}
            barCategoryGap="30%"
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="6 6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              width={92}
              tick={{ fontSize: 12 }}
              domain={[0, (max: number) => Math.max(5, Math.ceil(max * 1.15))]}
              tickFormatter={(value: number) =>
                mode === 'share' ? String(value) : value.toLocaleString()
              }
              label={{
                value: mode === 'share' ? 'שיעור מתוך הייצור [%]' : '[MWh]',
                angle: -90,
                position: 'insideLeft',
                dx: 5,
              }}
            />
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div
                    dir="rtl"
                    className="min-w-[140px] rounded-lg border border-[#DEDEDE] bg-white p-3 text-sm shadow-xl"
                  >
                    <p className="mb-1 text-[#707585]">{label}</p>
                    {payload.map((entry) => (
                      <p
                        key={String(entry.dataKey)}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: entry.color }}
                          />
                          {String(entry.dataKey)}
                        </span>
                        <span>
                          {mode === 'share'
                            ? `${Number(entry.value).toFixed(0)}%`
                            : `${Math.round(Number(entry.value)).toLocaleString()} MWh`}
                        </span>
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            {years
              .filter((year) => !hidden.includes(year))
              .map((year) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={colors[year] ?? '#999999'}
                  barSize={10}
                  radius={[2, 2, 0, 0]}
                  opacity={hovered && hovered !== year ? 0.3 : 1}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-row-reverse flex-wrap justify-end gap-6">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            aria-pressed={!hidden.includes(year)}
            onClick={() =>
              setHidden((current) =>
                current.includes(year)
                  ? current.filter((value) => value !== year)
                  : [...current, year],
              )
            }
            onMouseEnter={() => setHovered(year)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(year)}
            onBlur={() => setHovered(null)}
            className="flex flex-row-reverse items-center gap-2 text-base focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{
              opacity: hidden.includes(year)
                ? 0.4
                : hovered && hovered !== year
                  ? 0.3
                  : 1,
            }}
          >
            {year}
            <span
              className="size-2 rounded-full"
              style={{ background: colors[year] ?? '#999999' }}
            />
          </button>
        ))}
      </div>
    </>
  )
}

export default function RenewableShareChart() {
  const [mode, setMode] = useState<'share' | 'production'>('share')
  const [range] = useState(() => ({
    start_date: '2021-01-01',
    end_date: format(new Date(), 'yyyy-MM-dd'),
  }))
  const query = useRenewableShare(range)
  const chart = query.data ? renewableShareRows(query.data, mode) : undefined
  return (
    <ChartCard
      title="שיעור הייצור ממקורות מתחדשים"
      apiHash="renewables-transition"
      notes={<SourceNotes />}
      onExport={() =>
        exportRenewableData(
          'potential-by-industry',
          range,
          `${range.start_date}-${range.end_date}`,
        )
      }
    >
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={Boolean(chart?.data.length)}
        onRetry={() => void query.refetch()}
      >
        {chart?.data.length ? (
          <RenewableSharePlot key={mode} {...chart} mode={mode} />
        ) : (
          !query.isError && <EmptyChart />
        )}
      </QueryContent>
      <ModeSwitch
        value={mode}
        onChange={(value) => setMode(value as typeof mode)}
        options={[
          { value: 'share', label: 'שיעור מהייצור' },
          { value: 'production', label: 'ייצור בפועל' },
        ]}
      />
    </ChartCard>
  )
}
