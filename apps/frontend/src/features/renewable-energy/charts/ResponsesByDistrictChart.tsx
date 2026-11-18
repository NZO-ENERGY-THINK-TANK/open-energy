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
  useResponsesByDistrict,
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
import { districtNames } from './chartOptions'
import { useChartLegend } from './useChartLegend'
import { responseSeries, responseStat } from './responseBreakdown'
import type { ChartMetric, ResponsesByDistrictResponse } from '../types'

const yearOptions = ['2026', '2025', '2024', '2023', '2022', '2021']
const series = [...responseSeries].reverse()
function responseDistrictRows(
  response: ResponsesByDistrictResponse,
  mode: ChartMetric,
) {
  return response.series.map((point) => {
    const breakdown =
      point.response_breakdown ??
      response.district_response_breakdown?.[point.district] ??
      {}
    return {
      district:
        point.district === 'Judea & Samaria'
          ? 'יו״ש'
          : (districtNames[point.district] ?? point.district),
      ...Object.fromEntries(
        series.map((item) => [
          item.key,
          responseStat(breakdown[item.apiKey], mode),
        ]),
      ),
    }
  })
}

export function ResponsesByDistrictPlot({
  data,
  mode,
}: {
  data: ReturnType<typeof responseDistrictRows>
  mode: ChartMetric
}) {
  const legend = useChartLegend()
  const visible = series.filter((item) => !legend.hidden.includes(item.key))
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
            <XAxis dataKey="district" tick={{ fontSize: 12 }} />
            <YAxis
              width={92}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => value.toLocaleString()}
              label={{
                value: mode === 'capacity' ? 'הספק [MW]' : 'מספר מתקנים',
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
                  series={series}
                />
              )}
            />
            {visible.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                barSize={80}
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

export default function ResponsesByDistrictChart() {
  const [years, setYears] = useState<string[]>(yearOptions)
  const [mode, setMode] = useState<ChartMetric>('capacity')
  // Multiple selected years intentionally do not restrict this endpoint in production.
  const filters = { year: years.length === 1 ? Number(years[0]) : undefined }
  const query = useResponsesByDistrict(filters)
  const data = query.data ? responseDistrictRows(query.data, mode) : []
  return (
    <ChartCard
      title="תשובות מחלק לפי מחוז"
      apiHash="response-capacity-by-district"
      notes={<SourceNotes facilities />}
      onExport={() =>
        exportRenewableData(
          'response-capacity/by-district',
          filters,
          yearRangeSuffix(years),
        )
      }
      filters={
        <div className="flex flex-wrap items-end gap-5">
          <span className="pb-1 text-sm text-slate-600">מיון לפי:</span>
          <MultiSelect
            label="שנה"
            values={years}
            onChange={setYears}
            options={yearOptions.map((value) => ({ value, label: value }))}
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
          <ResponsesByDistrictPlot data={data} mode={mode} />
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
