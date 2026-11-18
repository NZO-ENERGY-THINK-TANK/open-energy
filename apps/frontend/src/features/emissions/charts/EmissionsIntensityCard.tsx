import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DataChartCard from '@/components/data/DataChartCard'
import QueryContent from '@/components/data/QueryContent'
import { presetRange } from '../../smp/dates'
import EmissionsDateRangeFilter from '../EmissionsDateRangeFilter'
import { exportEmissions, useEmissionsIntensity } from '../api'
import { formatNumber, formatPeriod, getIntensityPoints } from '../chartData'

const SERIES = [
  {
    key: 'total',
    label: 'סך פליטות CO₂',
    color: '#1E8025',
    unit: 'טונות CO₂',
    decimals: 2,
  },
  {
    key: 'ratio',
    label: 'יחס פליטות CO₂',
    color: '#F4D150',
    unit: 'טונות CO₂/MWh',
    decimals: 4,
  },
] as const

export default function EmissionsIntensityCard() {
  const [range, setRange] = useState(() => presetRange('last7Days'))
  const [hidden, setHidden] = useState({ total: false, ratio: false })
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const highlighted = hovered ?? focused
  const query = useEmissionsIntensity(range)
  const points = getIntensityPoints(query.data)
  const hasData = points.some(
    (point) => point.total !== null || point.ratio !== null,
  )

  return (
    <DataChartCard
      title="שיעור פליטות CO2 ממקורות פוסיליים"
      apiHash="co2-total-vs-ratio"
      onExport={() => exportEmissions('intensity', range)}
      exportDisabled={!hasData}
      exportFormat="CSV"
      sourceNotes={
        <>
          <p>
            הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה. הנתונים מתעדכנים
            מעת לעת.
          </p>
          <p>
            סך הפליטות מוצג בטונות CO₂; היחס מוצג ביחידות המוצהרות של המקור,
            טונות CO₂/MWh.
          </p>
          <p>
            מגבלה ידועה: המקור מחלק את יחס סכומי הפליטות והביקוש ב־12, בניגוד
            לחישוב ביחס בין פליטות וייצור משולבים בנקודות קצה אחרות. לכן היחס
            עשוי להיות קטן פי 12 ואינו מדד עצימות מאומת ובר־השוואה. מוצגים
            הערכים שסופקו, ללא תיקון בחזית.
          </p>
          <p>
            החישוב במקור מניח נתוני קצב במרווחי חמש דקות; משמעות הערכים במקור
            החלופי השעתי טרם אומתה.
          </p>
          <p>
            צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. סך פליטות CO₂
            מול עצימות פליטות CO₂.
          </p>
        </>
      }
    >
      <EmissionsDateRangeFilter value={range} onChange={setRange} />
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={Boolean(query.data)}
        onRetry={() => void query.refetch()}
      >
        {query.isFetching && query.data && (
          <p role="status" className="mt-3 text-sm text-slate-600">
            מעדכן נתונים…
          </p>
        )}
        {hasData ? (
          <>
            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
              <span>סך הפליטות: טונות CO₂</span>
              <span>
                יחס: <bdi>טונות CO₂/MWh</bdi>
              </span>
            </div>
            <div
              dir="ltr"
              className="h-[320px] w-full min-w-0 md:h-[420px]"
              aria-label="סך פליטות ויחס פליטות, בשני צירים נפרדים"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  margin={{ top: 16, right: 0, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatPeriod}
                    minTickGap={28}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="total"
                    width={48}
                    tickFormatter={(value: number) =>
                      Intl.NumberFormat('en', { notation: 'compact' }).format(
                        value,
                      )
                    }
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="ratio"
                    orientation="right"
                    width={58}
                    tickFormatter={(value: number) => formatNumber(value, 4)}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatPeriod(String(label))}
                    formatter={(value, _name, item) => {
                      const series =
                        item.dataKey === 'ratio' ? SERIES[1] : SERIES[0]
                      return `${formatNumber(Number(value), series.decimals)} ${series.unit}`
                    }}
                    contentStyle={{
                      direction: 'rtl',
                      textAlign: 'right',
                      maxWidth: 'min(280px, 80vw)',
                    }}
                  />
                  {SERIES.map((item) => (
                    <Line
                      key={item.key}
                      yAxisId={item.key}
                      dataKey={item.key}
                      name={item.label}
                      hide={hidden[item.key]}
                      stroke={item.color}
                      strokeWidth={2}
                      dot={points.length === 1}
                      connectNulls={false}
                      isAnimationActive={false}
                      opacity={
                        highlighted && highlighted !== item.key ? 0.25 : 1
                      }
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <details className="mt-2 text-xs text-slate-600">
              <summary className="cursor-pointer">
                נתוני הגרף בטקסט ({points.length} תקופות)
              </summary>
              <div className="max-h-48 overflow-auto">
                {points.map((point, index) => (
                  <p key={`${point.period}-${index}`} className="mt-2">
                    <bdi>{point.period}</bdi>:{' '}
                    {SERIES.map((item) => {
                      const value = point[item.key]
                      return `${item.label}: ${value == null ? 'לא זמין' : formatNumber(value, item.decimals) + ' ' + item.unit}`
                    }).join('; ')}
                  </p>
                ))}
              </div>
            </details>
          </>
        ) : query.data ? (
          <p
            role="status"
            className="flex min-h-64 items-center justify-center text-slate-600"
          >
            אין נתונים זמינים
          </p>
        ) : null}
      </QueryContent>
      <div className="mt-4 flex flex-wrap gap-5">
        {SERIES.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={!hidden[item.key]}
            onClick={() =>
              setHidden((previous) => ({
                ...previous,
                [item.key]: !previous[item.key],
              }))
            }
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused(item.key)}
            onBlur={() => setFocused(null)}
            className="flex items-center gap-2 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#276E4E]"
            style={{ opacity: hidden[item.key] ? 0.5 : 1 }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className={hidden[item.key] ? 'line-through' : ''}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </DataChartCard>
  )
}
