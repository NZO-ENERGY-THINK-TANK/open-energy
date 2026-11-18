import { useMemo, useState } from 'react'
import apiIcon from '@/assets/icons/api.png'
import downloadIcon from '@/assets/icons/download.png'
import QueryContent from '@/components/data/QueryContent'
import { exportIsraelForecast, useIsraelForecast } from '../api'
import type { IsraelForecastPoint } from '../types'
import { Link } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const predictions = [
  { key: 'ministry', label: 'יעד ממשלתי', color: '#957669' },
  { key: 'nzo', label: 'יעד NZO', color: '#8BBFE1' },
] as const

type ForecastRow = {
  year: number
  historicalActualPct: number
  actualLinePct: number
  actualBar: number | null
  ministryPct: number
  nzoPct: number
}
type Selection = Record<'ministry' | 'nzo', boolean>

function buildForecastRows(points: IsraelForecastPoint[]): ForecastRow[] {
  const cutoff = points.reduce((last, point) => point.renewable_share_percent > 0 ? Math.max(last, point.year) : last, 0)
  return points.map(point => ({
    year: point.year,
    historicalActualPct: point.renewable_share_percent,
    actualBar: cutoff > 0 && point.year <= cutoff ? point.renewable_share_percent : null,
    actualLinePct: point.renewable_share_percent > 0 ? point.renewable_share_percent : point.realistic_forecast_percent,
    ministryPct: point.ministry_target_percent,
    nzoPct: point.nzo_target_percent,
  }))
}

function ForecastTooltip({ active, payload, selection }: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: ForecastRow }>
  selection: Selection
}) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  const items = [
    ...(selection.nzo ? [{ label: 'יעד NZO', value: row.nzoPct }] : []),
    ...(selection.ministry ? [{ label: 'יעד ממשלתי', value: row.ministryPct }] : []),
    { label: row.historicalActualPct > 0 ? 'ייצור בפועל' : 'צפי ריאלי', value: row.actualLinePct },
  ]
  return (
    <div dir="rtl" className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-medium">שנה {row.year}</p>
      {items.map(item => <p key={item.label} className="mt-1.5 text-[#59687D]">{item.label}<br /><span className="font-medium text-[#484C56]">{item.value.toFixed(1)}%</span></p>)}
    </div>
  )
}

function IsraelForecastPlot({ rows, selection, hovered }: { rows: ForecastRow[]; selection: Selection; hovered: string | null }) {
  const opacity = (key: string) => !hovered || hovered === key ? 1 : 0.3
  return (
    <div dir="ltr" className="relative h-[300px] md:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 10, right: 20, left: 20, bottom: 18 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={value => `${value}%`} label={{ value: 'שיעור אנרגיה מתחדשת', angle: -90, position: 'insideLeft', dx: 5, style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif', fontSize: 12 } }} />
          <Tooltip content={<ForecastTooltip selection={selection} />} wrapperStyle={{ zIndex: 50 }} />
          <Bar dataKey="actualBar" fill="#1E8025" barSize={28} name="ייצור בפועל" opacity={opacity('actual')}>
            <LabelList dataKey="actualBar" position="insideTop" offset={10} formatter={value => typeof value === 'number' && value > 0 ? value.toFixed(0) : ''} style={{ fill: '#ffffff90', fontSize: 14, fontWeight: 400 }} />
          </Bar>
          <Line type="monotone" dataKey="actualLinePct" stroke="#1E8025" strokeWidth={2} dot={false} name="צפי ריאלי" opacity={opacity('actual')} />
          <Line type="monotone" dataKey="ministryPct" stroke="#957669" strokeWidth={2} dot={false} name="יעד ממשלתי" opacity={selection.ministry ? opacity('ministry') : 0} />
          <Line type="monotone" dataKey="nzoPct" stroke="#8BBFE1" strokeWidth={2} dot={false} name="יעד NZO" opacity={selection.nzo ? opacity('nzo') : 0} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function IsraelForecastChart() {
  const [selection, setSelection] = useState<Selection>({ ministry: true, nzo: true })
  const [hovered, setHovered] = useState<string | null>(null)
  const query = useIsraelForecast()
    const rows = useMemo(() => buildForecastRows(query.data?.data ?? []), [query.data?.data])
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState(false)
    async function download() {
      if (exporting) return
      setExporting(true)
      setExportError(false)
      try { await exportIsraelForecast() } catch { setExportError(true) } finally { setExporting(false) }
    }

  return (
    <div className="w-full">
      <header className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-700">יעדים מול ייצור בפועל</h3>
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label="מקור והערות: יעדים מול ייצור בפועל"><Info size={21} className="text-[#59687D]/50" /></Button></PopoverTrigger>
            <PopoverContent dir="rtl" className="max-h-[70vh] w-[min(90vw,388px)] space-y-3 overflow-y-auto text-sm">
              <p>שיעור המתחדשות לקוח מתוך דו&quot;ח מצב משק החשמל השנתי.</p>
                            {query.data?.source?.source_notes?.map(note => <p key={note}>{note}</p>)}
              <p>היעד הממשלתי מסתמך על היעד ל-20% מתחדשות בשנת 2025, ו-30% בשנת 2030, והערכה לינארית של המשמעויות לשנים האחרות המוצגות בגרף.</p>
              <p>היעד של פרויקט NZO מסתמך על היעד ל-50% מתחדשות בשנת 2030, ו-95% בשנת 2050, והערכה לינארית של המשמעויות לשנים האחרות המוצגות בגרף.</p>
              <p>צפי ריאלי מסתמך על גידול ממוצע בשיעור המתחדשות בשלושת השנים האחרונות.</p>
              <p>הנתונים מתעדכנים מעת לעת.</p>
              <p>צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. יעדים מול ייצור בפועל.</p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/api" hash="renewables-delivery-4-renewable-forecast-israel" aria-label="תיעוד API: יעדים מול ייצור בפועל" className="rounded focus-visible:outline-2 focus-visible:outline-offset-4"><img src={apiIcon} width={32} height={32} alt="" /></Link>
          <button type="button" onClick={() => void download()} disabled={exporting} aria-label={exporting ? 'מוריד נתונים' : 'ייצוא לאקסל: יעדים מול ייצור בפועל'} className="rounded disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4"><img src={downloadIcon} width={32} height={32} alt="" /></button>
        </div>
      </header>
      <nav aria-label="מקרא יעדים בישראל" className="mt-3 mb-4 flex flex-col gap-6 md:flex-row">
        <span className="flex items-center gap-2 text-xs text-gray-800 md:text-sm" onMouseEnter={() => setHovered('actual')} onMouseLeave={() => setHovered(null)}><span className="size-2 rounded-full bg-[#1E8025]" />ייצור בפועל</span>
        {predictions.map(item => (
          <button key={item.key} type="button" aria-pressed={selection[item.key]} className="flex items-center gap-2 rounded text-xs text-gray-800 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 md:text-sm" style={{ opacity: selection[item.key] ? 1 : 0.5 }} onClick={() => setSelection(previous => ({ ...previous, [item.key]: !previous[item.key] }))} onMouseEnter={() => setHovered(item.key)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(item.key)} onBlur={() => setHovered(null)}>
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}
          </button>
        ))}
      </nav>
      {exportError && <p role="alert" className="mb-3 text-sm text-destructive">הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.</p>}
            <QueryContent isPending={query.isPending} isError={query.isError} hasData={rows.length > 0} onRetry={() => void query.refetch()}>
              {rows.length ? <IsraelForecastPlot rows={rows} selection={selection} hovered={hovered} /> : !query.isError && <p role="status" className="py-8 text-center text-sm text-[#59687D]">אין נתונים להצגה.</p>}
            </QueryContent>
    </div>
  )
}
