import { useMemo, useState } from 'react'
import QueryContent from '@/components/data/QueryContent'
import { exportInternationalComparison, useInternationalComparison } from '../api'
import type { InternationalRegion } from '../types'
import { Link } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { LabelProps } from 'recharts'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const series = [
  { key: 'solarPct', color: '#f6cf65', label: 'שיעור אנרגיה סולארית בשנת 2024' },
  { key: 'renewableRemainderPct', color: '#92c854', label: 'כיום' },
  { key: 'target2030Pct', color: '#bdcb5d', label: 'יעדים ל-2030' },
  { key: 'target2050Pct', color: '#8abce4', label: 'יעדים ל-2050' },
] as const
const title = 'השוואה בין לאומית של יעדי מתחדשות וייצור אנרגיה סולארית'
type SeriesKey = typeof series[number]['key']
type ComparisonRow = Record<SeriesKey, number | null> & { country: string; cumulative: Record<SeriesKey, number | null> }
type LabelGeometry = LabelProps & { index?: number; width?: number | string; height?: number | string }

function toPercent(value: number | null | undefined, unit: string | undefined): number | null {
  return value == null ? null : unit === 'percent' || unit === '%' ? value : value * 100
}

function buildComparisonRows(regions: InternationalRegion[], unit: string | undefined, includeSolar: boolean, include2030: boolean, include2050: boolean): ComparisonRow[] {
  return regions.map(region => {
    const solar = includeSolar && region.solar_data_available !== false ? toPercent(region.solar_share_percent_2024, unit) : null
    const total = toPercent(region.renewable_share_percent_2024, unit)
    const remainder = total == null ? null : Math.max(0, total - (solar ?? 0))
    const baseline = (solar ?? 0) + (remainder ?? 0)
    const target2030 = toPercent(region.renewable_target_percent_2030, unit)
    const target2050 = include2050 ? toPercent(region.renewable_target_percent_2050, unit) : null
    return {
      country: region.region_he || region.region,
      solarPct: solar,
      renewableRemainderPct: remainder,
      target2030Pct: include2030 && target2030 != null ? Math.max(0, target2030 - baseline) : null,
      // The 2050 gap still uses the underlying 2030 target when its layer is hidden.
      target2050Pct: target2050 != null && target2030 != null ? Math.max(0, target2050 - target2030) : null,
      cumulative: {
        solarPct: solar,
        renewableRemainderPct: remainder == null ? null : baseline,
        target2030Pct: include2030 ? target2030 : null,
        target2050Pct: target2050,
      },
    }
  })
}

function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

function CumulativeLabel({ rows, seriesKey, ...props }: LabelGeometry & { rows: ComparisonRow[]; seriesKey: SeriesKey }) {
  const row = props.index === undefined ? undefined : rows[props.index]
  const box = props.viewBox && 'width' in props.viewBox ? props.viewBox : undefined
  const width = Number(props.width ?? box?.width ?? 0)
  const height = Number(props.height ?? box?.height ?? 0)
  const value = Number(props.value)
  const cumulative = row?.cumulative[seriesKey]
  if (!row || value < 1 || !Number.isFinite(value) || width < 16 || cumulative == null) return null
  return <text x={Number(props.x ?? box?.x ?? 0) + width - 6} y={Number(props.y ?? box?.y ?? 0) + height / 2} dominantBaseline="middle" textAnchor="end" style={{ fill: '#fff', fontSize: 13, fontWeight: 600, textShadow: seriesKey === 'solarPct' ? '0 1px 3px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.55)' }}>{formatPercent(cumulative)}</text>
}

function CountryLabel(props: LabelGeometry) {
  const box = props.viewBox && 'width' in props.viewBox ? props.viewBox : undefined
  return <text x={Number(props.x ?? box?.x ?? 0) + Number(props.width ?? box?.width ?? 0)} y={Number(props.y ?? box?.y ?? 0) - 14} dominantBaseline="hanging" textAnchor="end" style={{ direction: 'ltr' }} fill="#484C56" fontSize={14}>{props.value}</text>
}

function ComparisonTooltip({ active, payload, include2050 }: { active?: boolean; payload?: ReadonlyArray<{ payload?: ComparisonRow }>; include2050: boolean }) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  const visible = series.filter(item => (row[item.key] ?? 0) > 0)
  if (!visible.length) return null
  return (
    <div dir="rtl" className="max-w-[min(90vw,280px)] rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 border-b border-gray-100 pb-1.5 font-semibold text-[#484C56]">{row.country}</p>
      <ul className="space-y-1.5">
        {visible.map(item => <li key={item.key} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2 text-[#59687D]"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="shrink-0 font-medium text-[#484C56]">{(row.cumulative[item.key] ?? 0).toFixed(1)}%</span></li>)}
      </ul>
      <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-[#59687D]">{[
        row.cumulative.target2030Pct != null ? `מצטבר עד יעד 2030: ${formatPercent(row.cumulative.target2030Pct)}` : null,
        include2050 && row.cumulative.target2050Pct != null ? `מצטבר עד יעד 2050: ${formatPercent(row.cumulative.target2050Pct)}` : null,
      ].filter(Boolean).join(' · ')}</p>
    </div>
  )
}

function InternationalComparisonPlot({ rows, keys, hovered, include2050 }: { rows: ComparisonRow[]; keys: SeriesKey[]; hovered: SeriesKey | null; include2050: boolean }) {
  const maximum = Math.ceil(Math.max(100, ...rows.map(row => series.reduce((sum, item) => sum + (row[item.key] ?? 0), 0))) / 10) * 10
  const ticks = [...new Set([0, Math.round(maximum / 2), maximum])]
  return (
    <div dir="ltr" className="h-[320px] min-w-0 md:h-[500px]">
      <ResponsiveContainer width="70%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 32, right: 20, left: 8, bottom: 32 }}>
          <XAxis type="number" domain={[0, maximum]} ticks={ticks} axisLine={{ stroke: '#D6D6D6' }} tickLine={false} tick={{ fill: '#59687D', fontSize: 12 }} tickFormatter={value => `${value}%`} />
          <YAxis type="category" dataKey="country" width={0} interval={0} axisLine={false} tickLine={false} tick={false} />
          <Tooltip cursor={{ fill: 'rgba(89,104,125,0.07)' }} content={<ComparisonTooltip include2050={include2050} />} />
          {keys.map((key, index) => {
            const item = series.find(item => item.key === key)!
            return <Bar key={key} dataKey={key} name={item.label} stackId="a" fill={item.color} stroke="#fff" strokeWidth={1} barSize={30} radius={0} opacity={!hovered || !keys.includes(hovered) || hovered === key ? 1 : 0.35}>
              {index === keys.length - 1 && <LabelList dataKey="country" content={props => <CountryLabel {...props} />} />}
              <LabelList dataKey={key} content={props => <CumulativeLabel {...props} rows={rows} seriesKey={key} />} />
            </Bar>
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function InternationalComparisonChart() {
  const [includeSolar, setIncludeSolar] = useState(true)
  const [include2030, setInclude2030] = useState(true)
  const [include2050, setInclude2050] = useState(true)
  const [hovered, setHovered] = useState<SeriesKey | null>(null)
  const filters = { include_2050_targets: include2050, include_solar_share: includeSolar }
    const query = useInternationalComparison(filters)
    const rows = useMemo(() => buildComparisonRows(query.data?.regions ?? [], query.data?.value_unit, includeSolar, include2030, include2050), [query.data?.regions, query.data?.value_unit, includeSolar, include2030, include2050])
    const hasCurrentShare = (query.data?.regions ?? []).some(region => (region.renewable_share_percent_2024 ?? 0) > 0)
    const keys = series.filter(item => item.key === 'solarPct' ? includeSolar : item.key === 'target2030Pct' ? include2030 : item.key === 'target2050Pct' ? include2050 : hasCurrentShare).map(item => item.key)
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState(false)
    async function download() {
      if (exporting) return
      setExporting(true)
      setExportError(false)
      try { await exportInternationalComparison(filters) } catch { setExportError(true) } finally { setExporting(false) }
    }

  return (
    <div className="w-full bg-white">
      <header className="mb-4 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 items-start gap-2">
          <h3 className="text-lg leading-snug font-bold text-[#484C56] md:text-xl">{title}</h3>
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label={`מקור והערות: ${title}`} className="shrink-0"><Info size={21} className="text-[#A1A1A1]" /></Button></PopoverTrigger>
            <PopoverContent dir="rtl" className="max-h-[70vh] w-[min(90vw,388px)] space-y-3 overflow-y-auto text-sm">
              <p>הנתונים נלקחים מסוכנות האנרגיה הבין-לאומית (IEA), תכניות אנרגיה ואקלים לאומיות (NECP) של ספרד ויוון לשנים 2021-2030, נציבות האנרגיה של קליפורניה (CEC), דו&quot;חות מצב משק החשמל השנתיים, החלטת ממשלה 465, והתרחיש הצהוב במתווה לאיפוס פליטות גזי חממה עד לשנת 2050.</p>
              <p>הנתונים מתעדכנים מעת לעת.</p>
              <p>צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. השוואה בין לאומית של יעדי מתחדשות וייצור אנרגיה סולארית.</p>
              {query.data?.source?.source_notes?.map(note => <p key={note}>{note}</p>)}
                            {query.data?.validation?.map((note, index) => <p key={index}>{[note.region, note.detail ?? note.code].filter(Boolean).join(': ')}</p>)}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 md:justify-start">
          <button type="button" onClick={() => void download()} disabled={exporting} aria-label={exporting ? 'מוריד נתונים' : `ייצוא לאקסל: ${title}`} className="rounded disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4"><img src="/legacy/images/download_2.png" width={28} height={28} alt="" /></button>
          <Link to="/api" hash="renewables-delivery-4-international-renewable-comparison" aria-label={`תיעוד API: ${title}`} className="rounded focus-visible:outline-2 focus-visible:outline-offset-4"><img src="/legacy/images/API.png" width={28} height={28} alt="" /></Link>
        </div>
      </header>
      <nav aria-label="מקרא השוואה בינלאומית" className="mb-6 flex flex-wrap items-center justify-start gap-6 text-right">
        {series.filter(item => item.key !== 'renewableRemainderPct' || hasCurrentShare).map(item => {
                  if (item.key === 'renewableRemainderPct') return <span key={item.key} className="flex items-center gap-2.5 text-sm font-medium text-[#484C56]" onMouseEnter={() => setHovered(item.key)} onMouseLeave={() => setHovered(null)}><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
          const enabled = item.key === 'solarPct' ? includeSolar : item.key === 'target2030Pct' ? include2030 : include2050
          return <button key={item.key} type="button" aria-pressed={enabled} className="flex items-center gap-2.5 rounded text-sm leading-tight font-medium text-[#484C56] transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4" style={{ opacity: enabled ? 1 : 0.45 }} onClick={() => { if (item.key === 'solarPct') setIncludeSolar(value => !value); else if (item.key === 'target2030Pct') setInclude2030(value => !value); else setInclude2050(value => !value) }} onMouseEnter={() => setHovered(enabled ? item.key : null)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(enabled ? item.key : null)} onBlur={() => setHovered(null)}>
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.label}
          </button>
        })}
      </nav>
      {exportError && <p role="alert" className="mb-3 text-sm text-destructive">הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.</p>}
            <QueryContent isPending={query.isPending} isError={query.isError} hasData={rows.length > 0} onRetry={() => void query.refetch()}>
              {rows.length ? <InternationalComparisonPlot rows={rows} keys={keys} hovered={hovered} include2050={include2050} /> : !query.isError && <p role="status" className="py-8 text-center text-sm text-[#59687D]">אין נתונים להצגה.</p>}
              {includeSolar && (query.data?.regions_without_solar_data?.length ?? 0) > 0 && <aside className="mt-4 rounded-[10px] border border-dashed border-[#BDBDBD] bg-[#F8F8F8] p-3 text-sm text-[#484C56] md:absolute md:start-[100px] md:bottom-[30px] md:w-[280px] md:-translate-y-full"><h4 className="mb-1 font-bold">* נתוני אנרגיה סולארית חסרים עבור:</h4><ul>{query.data?.regions_without_solar_data?.map(name => <li key={name}>{name}</li>)}</ul></aside>}
            </QueryContent>
    </div>
  )
}
