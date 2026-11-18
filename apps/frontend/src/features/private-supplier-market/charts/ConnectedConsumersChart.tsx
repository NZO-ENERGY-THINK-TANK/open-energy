import type { ConnectedConsumersResponse, CustomerType } from '../types'
import { ChartNotice, ChartPanel } from './chartHelpers'
import { barsOption, type ChartSeries, type ChartPoint } from './chartOptions'

export interface ConnectedConsumersChartProps {
  data: ConnectedConsumersResponse
  customerType?: CustomerType
}

export default function ConnectedConsumersChart({
  data,
  customerType,
}: ConnectedConsumersChartProps) {
  const month = data.segments.district
    .map((row) => row.month)
    .sort()
    .at(-1)
  const rows = data.segments.district.filter((row) => row.month === month)
  const metersFor = (district: string) =>
    data.district_meter_breakdown[district] ??
    data.district_meter_breakdown[district.replaceAll('_', ' ')] ??
    data.district_meter_breakdown[district.replaceAll(' ', '_')]

  // The backend sums district_meter_breakdown across the requested date range.
  // It is a snapshot only for a single month, with a complete matching split.
  const singleMonth =
    data.start_date.slice(0, 7) === month && data.end_date.slice(0, 7) === month
  const canStack =
    singleMonth &&
    rows.length > 0 &&
    rows.every((row) => {
      const meters = metersFor(row.district)
      return (
        meters?.basic !== undefined &&
        meters.smart !== undefined &&
        meters.basic + meters.smart === row.total_consumers
      )
    })
  const series: ChartSeries[] = canStack
    ? [
        { key: 'basic', name: 'מונה בסיסי', color: '#F4D150' },
        { key: 'smart', name: 'מונה חכם', color: '#3A7C2F' },
      ]
    : [{ key: 'total', name: 'סך הצרכנים', color: '#3A7C2F' }]
  const points: ChartPoint[] = [...rows]
    .sort((a, b) => b.total_consumers - a.total_consumers)
    .map<ChartPoint>((row) => ({
      period: row.district.replaceAll('_', ' '),
      values: canStack
        ? ({
            basic: metersFor(row.district)!.basic!,
            smart: metersFor(row.district)!.smart!,
          } as Record<string, number>)
        : ({ total: row.total_consumers } as Record<string, number>),
    }))

  return (
    <section
      dir="rtl"
      className="min-w-0 space-y-3"
      aria-label="צרכנים מחוברים לספקים פרטיים"
    >
      {customerType && (
        <ChartNotice>
          אין בנתונים פילוח מחוזות לפי סוג לקוח. מוצגים כלל הצרכנים, ללא סינון
          לפי סוג הלקוח שנבחר.
        </ChartNotice>
      )}
      {!canStack && (
        <ChartNotice>
          מוצגים סיכומי המחוזות לחודש האחרון הזמין. פילוח המונים בתשובת השרת
          מסוכם על פני טווח התאריכים ואינו בהכרח תמונת מצב חודשית מלאה, ולכן
          אינו מוצג.
        </ChartNotice>
      )}
      <ChartPanel
        title={`מספר צרכנים לפי מחוז${month ? ` — ${month}` : ''}`}
        empty={!points.length}
        option={barsOption(points, series, 'מספר צרכנים')}
      />
    </section>
  )
}
