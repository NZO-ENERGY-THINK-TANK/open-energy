import { Bar, CartesianGrid, ComposedChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import QueryContent from '@/components/data/QueryContent'
import { exportRenewableData, useFacilitySize, yearRangeSuffix } from '../api'
import { ChartCard, EmptyChart, FilterSelect, Legend, MultiSelect, SourceNotes, StackTooltip } from './ChartControls'
import { useChartLegend } from './useChartLegend'
import { accumulateFourSegments, pickBracketStat } from './sizeBracketMapping'

import type { ChartMetric, FacilitySizeResponse } from '../types'
const series = [
  { key: 'xlarge', label: 'גדול מאוד | +5001 KW', color: '#648AA3' },
  { key: 'large', label: 'גדול | 631-5000 KW', color: '#60A261' },
  { key: 'medium', label: 'בינוני | 201-630 KW', color: '#C4C95C' },
  { key: 'small', label: 'קטן | 0-200 KW', color: '#D8EB4D' },
]

function facilitySizeRows(response: FacilitySizeResponse, mode: 'capacity' | 'count', years: string[]) {
  return response.series.filter((point) => !years.length || years.includes(String(point.year))).map((point) => ({ year: point.year, ...accumulateFourSegments(point.size_brackets, (raw) => pickBracketStat(raw, mode)) }))
}

export function FacilitySizePlot({ data, mode }: { data: ReturnType<typeof facilitySizeRows>; mode: 'capacity' | 'count' }) {
  const legend = useChartLegend()
  const visible = series.filter((item) => !legend.hidden.includes(item.key))
  const rows = data.map((row) => ({ ...row, visibleTotal: Math.round(visible.reduce((sum, item) => sum + row[item.key as keyof typeof row], 0)) }))
  return <>
    <div dir="ltr" className="h-[300px] min-w-0 md:h-[500px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={rows} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
      <CartesianGrid vertical={false} strokeDasharray="6 6"/><XAxis dataKey="year" tick={{ fontSize: 12 }}/><YAxis width={92} tick={{ fontSize: 12 }} tickFormatter={(value: number) => value.toLocaleString()} label={{ value: mode === 'count' ? 'מספר מתקנים' : 'הספק מותקן [MW]', angle: -90, position: 'insideLeft', dx: 5 }}/>
      <Tooltip isAnimationActive={false} content={(props) => <StackTooltip {...props} unit={mode === 'count' ? 'מתקנים' : 'MW'} series={series}/>}/>
      {visible.map((item, index) => <Bar key={item.key} dataKey={item.key} stackId="a" fill={item.color} barSize={28} opacity={legend.hovered && legend.hovered !== item.key ? .3 : 1}>{index === visible.length - 1 && <LabelList dataKey="visibleTotal" position="top" formatter={(value) => Math.round(Number(value)).toLocaleString()} style={{ fill: '#707585', fontWeight: 400, fontSize: 14 }}/>}</Bar>)}
    </ComposedChart></ResponsiveContainer></div>
    <Legend series={series} {...legend}/>
  </>
}

export default function FacilitySizeChart() {
  const [years, setYears] = useState<string[]>([])
  const [mode, setMode] = useState<ChartMetric>('capacity')
  const filters = { year: years.length === 1 ? Number(years[0]) : undefined }
  const query = useFacilitySize(filters)
  const data = query.data ? facilitySizeRows(query.data, mode, years) : []
  const availableYears = [...new Set(query.data?.series.map((point) => String(point.year)) ?? [])].sort((a, b) => Number(b) - Number(a))
  return <ChartCard title="מתקני ייצור אנרגיה מתחדשת מחוברים לרשת לפי גודל" apiHash="installed-capacity-by-facility-size" notes={<SourceNotes facilities/>} onExport={() => exportRenewableData('installed-capacity/by-facility-size', filters, yearRangeSuffix(years.length ? years : availableYears))} filters={<div className="flex flex-wrap items-end gap-5"><span className="pb-1 text-sm text-slate-600">סינון לפי:</span><MultiSelect label="שנה" values={years} onChange={setYears} onToggle={(year) => setYears((current) => current.includes(year) ? current.filter((value) => value !== year) : [...current, year])} options={availableYears.map((value) => ({ value, label: value }))}/><FilterSelect label="תצוגה" value={mode} onChange={(value) => setMode(value as ChartMetric)} options={[{ value: 'capacity', label: 'הספק מותקן' }, { value: 'count', label: 'מספר מתקנים' }]}/></div>}>
    <QueryContent isPending={query.isPending} isError={query.isError} hasData={data.length > 0} onRetry={() => void query.refetch()}>{data.length ? <FacilitySizePlot data={data} mode={mode}/> : !query.isError && <EmptyChart/>}</QueryContent>
  </ChartCard>
}
