import { useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Info, Loader2 } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import apiIcon from '@/assets/icons/api.png'
import downloadIcon from '@/assets/icons/download.png'
import { Button } from '@/components/ui/button'
import QueryContent from '@/components/data/QueryContent'
import ClimateDateRangeFilter from '../ClimateDateRangeFilter'
import { exportHeatLoadGeneration, getClimateView, useHeatLoadGeneration } from '../api'
import type { ClimatePoint, ClimateRange } from '../types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const SERIES = [
  { key: 'electricity_generation_mw', label: 'ייצור חשמל', color: '#F4D150' },
  { key: 'heat_load', label: 'עומס חום', color: '#1E8025' },
] as const

type SeriesKey = (typeof SERIES)[number]['key']
type Visibility = Record<SeriesKey, boolean>

function ClimateTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload.length) return null
  return (
    <div dir="rtl" className="w-56 rounded-lg border border-gray-200 bg-white p-3 text-right shadow-[0px_2px_30px_2px_#99BF4129]">
      <div className="mb-2 border-b-2 text-xs text-gray-500">{label}</div>
      {[SERIES[1], SERIES[0]].map(({ key, label: name, color }) => {
        const item = payload.find((entry) => entry.dataKey === key)
        if (typeof item?.value !== 'number') return null
        return (
          <div key={key} className="mb-2 flex items-center gap-3">
            <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
            <div>
              <div className="text-xs text-gray-500">{name}</div>
              <div className="text-sm font-medium" dir="ltr">{key === 'heat_load' ? `${item.value.toFixed(2)} [C°]` : `${item.value.toLocaleString()} [MWh]`}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HeatGenerationPlot({ points, visible, highlighted }: { points: ClimatePoint[]; visible: Visibility; highlighted: SeriesKey | null }) {
  const domains = useMemo(() => {
    let heatMin = Infinity
    let heatMax = -Infinity
    let generationMax = -Infinity
    for (const point of points) {
      heatMin = Math.min(heatMin, point.heat_load)
      heatMax = Math.max(heatMax, point.heat_load)
      if (point.electricity_generation_mw !== null) generationMax = Math.max(generationMax, point.electricity_generation_mw)
    }
    return {
      heat: Number.isFinite(heatMin) ? [Math.round(heatMin - 5), Math.round(heatMax + 5)] : [0, 1],
      generation: [0, Number.isFinite(generationMax) ? Math.ceil(generationMax / 1000) * 1000 + 1000 : 1000],
    }
  }, [points])

  return (
    <div dir="ltr" className="h-[320px] w-full min-w-0 md:h-[480px]" aria-label="גרף ייצור חשמל אל מול עומס החום">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E7EA" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval={Math.max(0, Math.ceil(points.length / 8) - 1)} minTickGap={32} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis yAxisId="heat" orientation="left" domain={domains.heat} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'עומס חום [THI]', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' } }} />
          <YAxis yAxisId="generation" orientation="right" domain={domains.generation} tickLine={false} axisLine={false} width={80} tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'ייצור חשמל [MWh]', angle: -90, position: 'insideRight', style: { textAnchor: 'middle', fontFamily: 'Heebo, sans-serif' } }} />
          <Tooltip content={ClimateTooltip} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
          {SERIES.map(({ key, label, color }) => visible[key] ? (
            <Line key={key} yAxisId={key === 'heat_load' ? 'heat' : 'generation'} dataKey={key} name={label} stroke={color}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false}
              opacity={highlighted && highlighted !== key ? 0.25 : 1} />
          ) : null)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function HeatLoadGenerationChart() {
  const [range, setRange] = useState<ClimateRange>(() => {
    const today = dayjs()
    return { start: today.subtract(6, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }
  })
  const [visible, setVisible] = useState<Visibility>({ electricity_generation_mw: true, heat_load: true })
  const [hovered, setHovered] = useState<SeriesKey | null>(null)
  const [focused, setFocused] = useState<SeriesKey | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(false)
  const exportLock = useRef(false)
  const highlighted = hovered ?? focused
  const view = getClimateView(range)
  const query = useHeatLoadGeneration(range, view)
  const response = query.data
  const normalizedRange = response && (response.start_date !== range.start || response.end_date !== range.end)

  const download = async () => {
    if (exportLock.current) return
    exportLock.current = true
    setIsExporting(true)
    setExportError(false)
    try {
      await exportHeatLoadGeneration(range, view)
    } catch {
      setExportError(true)
    } finally {
      exportLock.current = false
      setIsExporting(false)
    }
  }

  return (
    <section aria-labelledby="heat-generation-title" className="min-w-0 rounded-[18px] border border-[#E9C863] bg-white p-6 md:rounded-[40px]">
      <header className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row">
        <div className="min-w-0 max-w-full">
          <div className="mb-2 flex items-center gap-3">
            <h2 id="heat-generation-title" className="text-lg font-bold text-gray-700">ייצור חשמל אל מול עומס החום</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6 shrink-0 text-[#A1A1A1]" aria-label="מקור והערות: ייצור חשמל אל מול עומס החום"><Info size={21} aria-hidden="true" /></Button>
              </PopoverTrigger>
              <PopoverContent dir="rtl" align="start" className="space-y-3 text-sm">
                <p>הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה, ומהשירות המטאורולוגי.</p>
                <p>עומס חום מחושב בעזרת נתוני טמפרטורה ולחות בתל-אביב ובירושלים.</p>
                <p>הנתונים הומרו ליחידות MWh, והם מתעדכנים מעת לעת.</p>
                <p>צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. ייצור החשמל אל מול עומס החום.</p>
              </PopoverContent>
            </Popover>
          </div>
          <ClimateDateRangeFilter value={range} onChange={setRange} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/api" hash="heat-load-vs-generation" aria-label="תיעוד API: ייצור חשמל אל מול עומס החום"><img src={apiIcon} alt="" width={32} height={32} /></Link>
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={isExporting} onClick={() => void download()} aria-label={isExporting ? 'מוריד נתונים' : 'הורדת Excel: ייצור חשמל אל מול עומס החום'}>
            {isExporting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <img src={downloadIcon} alt="" width={32} height={32} />}
          </Button>
        </div>
      </header>
      {exportError && <p role="alert" className="mb-3 text-sm text-destructive">הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.</p>}
      <div className="grid min-h-[320px] items-center md:min-h-[480px]">
        <QueryContent isPending={query.isPending} isError={query.isError} hasData={Boolean(response)} note={response?.note} onRetry={() => void query.refetch()}>
          {normalizedRange && <p className="mb-3 text-sm text-slate-600">טווח הנתונים שהוחזר: <bdi>{dayjs(response.start_date).format('DD/MM/YYYY')} – {dayjs(response.end_date).format('DD/MM/YYYY')}</bdi>. הייצוא מבקש את אותו טווח שנבחר.</p>}
          {query.isFetching && response && <p role="status" className="mb-2 text-sm text-slate-600">מעדכן נתונים…</p>}
          {response ? response.series.length ? <HeatGenerationPlot points={response.series} visible={visible} highlighted={highlighted} /> : <div role="status" className="flex h-[320px] items-center justify-center text-slate-600 md:h-[480px]">אין נתונים זמינים</div> : null}
        </QueryContent>
      </div>
      <div className="mt-4 flex flex-wrap justify-start gap-6 pr-4">
        {SERIES.map(({ key, label, color }) => (
          <button key={key} type="button" aria-pressed={visible[key]} onClick={() => setVisible((previous) => ({ ...previous, [key]: !previous[key] }))}
            onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
            className="flex cursor-pointer items-center gap-2 rounded-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#276E4E]"
            style={{ opacity: highlighted && highlighted !== key ? 0.6 : 1 }}>
            <span className="size-2 rounded-full" style={{ backgroundColor: color, opacity: visible[key] ? 1 : 0.3 }} />
            <span className={`text-xs md:text-sm ${visible[key] ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
