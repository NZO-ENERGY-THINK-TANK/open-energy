import { Bar, CartesianGrid, ComposedChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import { format } from 'date-fns'
import QueryContent from '@/components/data/QueryContent'
import { exportRenewableData, useResponsesByPeriod, useResponsesBySize, yearRangeSuffix } from '../api'
import { ChartCard, EmptyChart, Legend, ModeSwitch, MultiSelect, SourceNotes, StackTooltip } from './ChartControls'
import { useChartLegend } from './useChartLegend'
import { accumulateFourSegments, pickBracketStat } from './sizeBracketMapping'
import type { ChartMetric, ResponsesByPeriodResponse, ResponsesBySizeResponse } from '../types'
const series = [
  { key: 'xlarge', label: 'גדול מאוד | +5001 KW', color: '#648AA3' },
  { key: 'large', label: 'גדול | 631-5000 KW', color: '#60A261' },
  { key: 'medium', label: 'בינוני | 201-630 KW', color: '#957669' },
  { key: 'small', label: 'קטן | 0-200 KW', color: '#A66565' },
]
function positiveResponseSizeRows(response: ResponsesBySizeResponse, years: string[], mode: ChartMetric) {
  return (response.yearly_series ?? []).filter((point) => !years.length || years.includes(String(point.year))).map((point) => {
    const brackets = point.size_brackets
    const pick = (label: string) => pickBracketStat(brackets[label], mode)
    const sizes = 'Up to 16 kW' in brackets ? {
      small: pick('Up to 16 kW') + pick('16–50 kW') + pick('50–200 kW'), medium: pick('200 kW–1 MW'), large: pick('1–5 MW'), xlarge: pick('5–50 MW') + pick('50+ MW'),
    } : accumulateFourSegments(brackets, (raw) => pickBracketStat(raw, mode))
    return { year: String(point.year), ...sizes }
  }).sort((a, b) => Number(a.year) - Number(b.year))
}
function currentMonthResponseRows(response: ResponsesByPeriodResponse, month: string, mode: ChartMetric) {
  const point = response.series.find((item) => item.period === month)
  // by-period has no size split; production places this all-response total in the largest bracket.
  return point ? [{ year: point.period, small: 0, medium: 0, large: 0, xlarge: mode === 'capacity' ? point.total_mw || 0 : point.request_count || 0 }] : []
}

export function PositiveResponsesBySizePlot({ data, mode }: { data: ReturnType<typeof positiveResponseSizeRows>; mode: ChartMetric }) {
  const legend = useChartLegend()
  const visible = series.filter((item) => !legend.hidden.includes(item.key))
  const rows = data.map((row) => ({ ...row, visibleTotal: Math.round(visible.reduce((sum, item) => sum + Number(row[item.key as keyof typeof row]), 0)) }))
  return <>
    <div dir="ltr" className="h-[300px] min-w-0 md:h-[500px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={rows} margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
      <CartesianGrid vertical={false} strokeDasharray="6 6"/><XAxis dataKey="year" tick={{ fontSize: 12 }}/><YAxis width={92} tick={{ fontSize: 12 }} tickFormatter={(value: number) => value.toLocaleString()} label={{ value: mode === 'capacity' ? 'הספק [MW]' : 'מספר מתקנים', angle: -90, position: 'insideLeft', dx: 5 }}/>
      <Tooltip isAnimationActive={false} content={(props) => <StackTooltip {...props} unit={mode === 'capacity' ? 'MW' : 'מתקנים'} series={series}/>}/>
      {visible.map((item, index) => <Bar key={item.key} dataKey={item.key} stackId="a" fill={item.color} barSize={80} opacity={legend.hovered && legend.hovered !== item.key ? .3 : 1}>{index === visible.length - 1 && <LabelList dataKey="visibleTotal" position="top" formatter={(value) => Math.round(Number(value)).toLocaleString()} style={{ fill: '#707585', fontWeight: 400, fontSize: 14 }}/>}</Bar>)}
    </ComposedChart></ResponsiveContainer></div>
    <Legend series={series} {...legend}/>
  </>
}

export default function PositiveResponsesBySizeChart() {
  const [years, setYears] = useState<string[]>([])
  const [mode, setMode] = useState<ChartMetric>('capacity')
  const [latestMonth, setLatestMonth] = useState(false)
  const now = new Date()
  const size = useResponsesBySize()
  const period = useResponsesByPeriod({ year: now.getFullYear() }, latestMonth)
  const query = latestMonth ? period : size
  const allYears = size.data ? positiveResponseSizeRows(size.data, [], mode) : []
  const data = latestMonth ? period.data ? currentMonthResponseRows(period.data, format(now, 'yyyy-MM'), mode) : [] : allYears.filter((point) => !years.length || years.includes(point.year))
  const availableYears = allYears.map((point) => point.year).sort((a, b) => Number(b) - Number(a))
  const filters = { year: years.length === 1 ? Number(years[0]) : undefined }
  return <ChartCard title="תשובות חיוביות לפי גודל" apiHash="response-capacity-by-size" notes={<SourceNotes facilities/>} onExport={() => exportRenewableData('response-capacity/by-size', filters, yearRangeSuffix(years.length ? years : availableYears))} filters={<div className="flex flex-wrap items-end gap-5"><span className="pb-1 text-sm text-slate-600">סינון לפי:</span><MultiSelect label="שנה" values={years} onChange={(values) => { setYears(values); if (values.length) setLatestMonth(false) }} options={availableYears.map((value) => ({ value, label: value }))} summary={latestMonth ? 'חודש אחרון' : undefined} extra={<label className="flex items-center gap-2 text-[#59687D]"><input type="checkbox" checked={latestMonth} onChange={() => { setLatestMonth((current) => !current); setYears([]) }}/>חודש אחרון</label>}/></div>}>
    <QueryContent isPending={query.isPending} isError={query.isError} hasData={data.length > 0} onRetry={() => void query.refetch()}>{data.length ? <PositiveResponsesBySizePlot data={data} mode={mode}/> : !query.isError && <EmptyChart/>}</QueryContent>
    <ModeSwitch value={mode} onChange={(value) => setMode(value as ChartMetric)} options={[{ value: 'capacity', label: 'הספק מתקנים' }, { value: 'count', label: 'מספר מתקנים' }]}/>
  </ChartCard>
}
