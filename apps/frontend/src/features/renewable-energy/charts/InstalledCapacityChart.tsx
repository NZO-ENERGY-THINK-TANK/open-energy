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
  ChartCard,
  EmptyChart,
  FilterSelect,
  Legend,
  ModeSwitch,
  SourceNotes,
  StackTooltip,
} from './ChartControls'
import { districtOptions, technologyOptions } from './chartOptions'
import { useChartLegend } from './useChartLegend'
import {
  exportRenewableData,
  useCapacityGrowth,
  useCumulativeCapacity,
  yearRangeSuffix,
} from '../api'
import type {
  CumulativeCapacityResponse,
  CapacityGrowthResponse,
} from '../types'
const series = [
  { key: 'other', label: 'אחר', color: '#2A6D94', apiKey: 'Other' },
  {
    key: 'thermal',
    label: 'תרמו סולארי',
    color: '#60A261',
    apiKey: 'Solar Thermal',
  },
  {
    key: 'solar',
    label: 'פוטו וולטאי',
    color: '#C4C95C',
    apiKey: 'Photovoltaic',
  },
  { key: 'wind', label: 'רוח', color: '#98C74E', apiKey: 'Wind' },
]

function installedCapacityRows(
  cumulative: CumulativeCapacityResponse | undefined,
  growth: CapacityGrowthResponse | undefined,
  mode: 'cumulative' | 'annual',
) {
  const years = new Map<number, number>()
  if (mode === 'cumulative') {
    for (const point of cumulative?.series ?? []) {
      const year = Number(point.period.slice(0, 4))
      years.set(year, Math.max(years.get(year) ?? 0, point.cumulative_mw))
    }
  } else {
    for (const point of growth?.series ?? [])
      years.set(point.year, point.added_mw)
  }
  // Legacy stacks allocate the whole-dataset technology proportions, not historical breakdowns.
  const breakdown = Object.fromEntries(
    series.map((item) => [
      item.apiKey,
      (mode === 'annual' ? growth?.technology_breakdown?.[item.apiKey] : 0) ||
        cumulative?.technology_breakdown?.[item.apiKey] ||
        0,
    ]),
  )
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  return [...years]
    .sort(([a], [b]) => a - b)
    .map(([year, capacity]) => {
      const row: Record<string, number> = { year }
      for (const item of series)
        row[item.key] =
          total > 0 ? (breakdown[item.apiKey] * capacity) / total : 0
      return row
    })
}

export function InstalledCapacityPlot({
  data,
}: {
  data: ReturnType<typeof installedCapacityRows>
}) {
  const legend = useChartLegend()
  const visible = series.filter((item) => !legend.hidden.includes(item.key))
  const rows = data.map((row) => ({
    ...row,
    visibleTotal: visible.reduce((sum, item) => sum + row[item.key], 0),
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
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              width={92}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => value.toLocaleString()}
              label={{
                value: 'הספק מותקן [MW]',
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
                  unit="MW"
                  series={series}
                  decimals={2}
                />
              )}
            />
            {visible.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                barSize={28}
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
      <Legend series={series} {...legend} />
    </>
  )
}

export default function InstalledCapacityChart() {
  const [mode, setMode] = useState<'cumulative' | 'annual'>('cumulative')
  const [district, setDistrict] = useState('')
  const [technology, setTechnology] = useState('')
  const filters = {
    district: district || undefined,
    technology: technology || undefined,
  }
  const cumulative = useCumulativeCapacity(filters)
  const growth = useCapacityGrowth(filters)
  const query = mode === 'cumulative' ? cumulative : growth
  const data = installedCapacityRows(cumulative.data, growth.data, mode)
  const years =
    cumulative.data?.series.map((point) => point.period.slice(0, 4)) ??
    growth.data?.series.map((point) => String(point.year)) ??
    []
  // Annual stacks also need the cumulative response's technology proportions.
  const pending = query.isPending || (mode === 'annual' && cumulative.isPending)
  const error = query.isError || (mode === 'annual' && cumulative.isError)
  return (
    <ChartCard
      title={
        mode === 'cumulative'
          ? 'הספק מותקן (מצטבר) של מתקנים לייצור אנרגיות מתחדשות'
          : 'הספק מותקן שנתי של מתקנים לייצור אנרגיות מתחדשות'
      }
      apiHash={
        mode === 'cumulative'
          ? 'installed-capacity-cumulative'
          : 'installed-capacity-growth'
      }
      notes={<SourceNotes facilities />}
      onExport={() =>
        exportRenewableData(
          mode === 'cumulative'
            ? 'installed-capacity/cumulative'
            : 'installed-capacity/growth',
          filters,
          mode === 'cumulative' ? yearRangeSuffix(years) : undefined,
        )
      }
      filters={
        <div className="flex flex-wrap items-end gap-5">
          <span className="pb-1 text-sm text-slate-600">סינון לפי:</span>
          <FilterSelect
            label="מחוז"
            value={district}
            onChange={setDistrict}
            options={districtOptions}
          />
          <FilterSelect
            label="טכנולוגיה"
            value={technology}
            onChange={setTechnology}
            options={technologyOptions}
          />
        </div>
      }
    >
      <QueryContent
        isPending={pending}
        isError={error}
        hasData={data.length > 0}
        onRetry={() => {
          void query.refetch()
          if (mode === 'annual') void cumulative.refetch()
        }}
      >
        {data.length && (!error || cumulative.data) ? (
          <InstalledCapacityPlot data={data} />
        ) : (
          !error && <EmptyChart />
        )}
      </QueryContent>
      <ModeSwitch
        value={mode}
        onChange={(value) => setMode(value as typeof mode)}
        options={[
          { value: 'cumulative', label: 'הספק מצטבר' },
          { value: 'annual', label: 'הספק מותקן שנתי' },
        ]}
      />
    </ChartCard>
  )
}
