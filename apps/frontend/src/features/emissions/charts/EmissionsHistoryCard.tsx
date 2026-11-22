import { useId, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { presetRange } from '../../smp/dates'
import EmissionsDateRangeFilter from '../EmissionsDateRangeFilter'
import { exportEmissions, useEmissionsHistory } from '../api'
import {
  FUELS,
  formatNumber,
  formatPeriod,
  getHistoryPoints,
} from '../chartData'

const SAVINGS = {
  key: 'savings',
  label: 'פליטות CO2 שנחסכו עקב השימוש באנרגיה מתחדשת',
  color: '#2F7A4F',
} as const
const FOSSIL = { key: 'fossil', label: 'פליטות CO₂', color: '#CEA073' } as const
const DETAIL = [FUELS[0], FUELS[2], FUELS[1], FUELS[3], FUELS[4]]

export default function EmissionsHistoryCard() {
  const [range, setRange] = useState(() => presetRange('last7Days'))
  const [detail, setDetail] = useState(false)
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const highlighted = hovered ?? focused
  const legendId = useId()
  const query = useEmissionsHistory(range)
  const points = getHistoryPoints(query.data)
  const series = detail ? [...DETAIL, SAVINGS] : [FOSSIL, SAVINGS]
  const hasData = points.some((point) =>
    [point.fossil, point.savings, ...FUELS.map((fuel) => point[fuel.key])].some(
      (value) => value !== null,
    ),
  )
  const groups = detail
    ? [
        { label: 'פליטות CO₂', series: DETAIL },
        { label: 'חיסכון בפליטות', series: [SAVINGS] },
      ]
    : [{ label: '', series: [FOSSIL, SAVINGS] }]

  return (
    <DataChartCard
      title="פליטות CO2 מייצור חשמל"
      apiHash="co2-emissions-over-time"
      onExport={() => exportEmissions('history', range)}
      exportDisabled={!hasData}
      sourceNotes={
        <>
          <p>
            הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה. פליטות CO2 שנחסכו
            עקב השימוש באנרגיה מתחדשת הוא נתון שנלקח מנגה. הנתונים מתעדכנים מעת
            לעת.
          </p>
          <p>
            הערכים מציגים טונות CO₂ בכל תקופת דיווח, ולא קצב פליטות לשעה. נתון
            חסר אינו מוצג כאפס.
          </p>
          <p>
            החישוב במקור מניח נתוני קצב במרווחי חמש דקות; משמעות הערכים במקור
            החלופי השעתי טרם אומתה.
          </p>
          <p>
            צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. פליטות CO2
            מייצור חשמל.
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
            <p className="mt-4 text-xs text-slate-600">טונות CO₂ לתקופה</p>
            <div
              dir="ltr"
              className="h-[300px] w-full min-w-0 md:h-[380px]"
              aria-label="פליטות וחיסכון בפליטות לפי תקופת דיווח"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  margin={{ top: 16, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatPeriod}
                    minTickGap={28}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    width={58}
                    tickFormatter={(value: number) =>
                      Intl.NumberFormat('en', { notation: 'compact' }).format(
                        value,
                      )
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatPeriod(String(label))}
                    formatter={(value) =>
                      `${formatNumber(Number(value))} טונות CO₂`
                    }
                    contentStyle={{
                      direction: 'rtl',
                      textAlign: 'right',
                      maxWidth: 'min(280px, 80vw)',
                      whiteSpace: 'normal',
                    }}
                  />
                  {series.map((item) => (
                    <Line
                      key={item.key}
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      hide={hidden[item.key] === true}
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
                    {series
                      .map((item) => {
                        const value = point[item.key]
                        return `${item.label}: ${value == null ? 'לא זמין' : formatNumber(value) + ' טונות CO₂'}`
                      })
                      .join('; ')}
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
      <Button
        type="button"
        variant="ghost"
        className="mt-4 text-[#276E4E]"
        aria-expanded={detail}
        aria-controls={legendId}
        onClick={() => setDetail((previous) => !previous)}
      >
        {detail ? 'הסתר פירוט' : 'הצג נתונים'}
      </Button>
      <div id={legendId} className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.label}>
            {group.label && (
              <p className="mb-2 text-xs font-bold text-slate-600">
                {group.label}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {group.series.map((item) => (
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
                  className="flex items-center gap-2 rounded-sm text-start text-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#276E4E]"
                  style={{ opacity: hidden[item.key] ? 0.5 : 1 }}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={hidden[item.key] ? 'line-through' : ''}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DataChartCard>
  )
}
