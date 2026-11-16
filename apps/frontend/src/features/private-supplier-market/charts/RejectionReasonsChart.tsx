import type { RejectionReason, SupplierType, SwitchingRequestsResponse } from '../types'
import { ChartNotice, ChartPanel, SupplierNotice } from './chartHelpers'
import { barsOption, donutOption, groupPeriods, responsePeriod } from './chartOptions'

export interface RejectionReasonsChartProps {
  data: SwitchingRequestsResponse
  supplierType: SupplierType
  years: number[]
  reasons: RejectionReason[]
}

const reasonSeries = [
  { key: 'missing_power_of_attorney', name: 'ייפוי כח חסר', color: '#8B0000' },
  { key: 'meter_issues', name: 'בעיות במונה', color: '#DC143C' },
  { key: 'request_form_issues', name: 'בעיות במילוי הבקשה', color: '#FF6347' },
  { key: 'other', name: 'אחר', color: '#FFB6C1' },
] satisfies Array<{ key: RejectionReason; name: string; color: string }>

export default function RejectionReasonsChart({ data, supplierType, years, reasons }: RejectionReasonsChartProps) {
  // An empty reason selection means all reasons, matching the legacy filters.
  const series = reasonSeries.filter((item) => !reasons.length || reasons.includes(item.key))
  const points = groupPeriods(data.monthly_rejections_by_reason, years, series,
    (row, key) => row[key as RejectionReason])
  const hasMonthlyData = data.monthly_rejections_by_reason.length > 0
  // When monthly rows exist, both panels use exactly the same selected period.
  const items = hasMonthlyData
    ? series.map((item) => ({ ...item, value: points.reduce((sum, point) => sum + (point.values[item.key] ?? 0), 0) }))
    : data.charts.requests_by_rejection_reason.data.flatMap((row) => {
      const item = series.find((entry) => entry.key === row.label)
      return item ? [{ ...item, value: row.count }] : []
    })

  return (
    <section dir="rtl" className="min-w-0 space-y-3" aria-label="סיבות לדחיית בקשות מעבר">
      <SupplierNotice supplierType={supplierType} />
      {!hasMonthlyData && <ChartNotice>אין פילוח חודשי זמין. התרשים המעגלי מציג את סיכומי השרת לתקופת התשובה ללא סינון מקומי לפי שנים; תרשים העמודות אינו זמין.</ChartNotice>}
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ChartPanel title={`סיבות דחייה — ${hasMonthlyData ? (years.length ? `שנים: ${[...new Set(years)].join(', ')}` : 'כל התקופה הזמינה בתשובה') : responsePeriod(data)}`} empty={!items.some((item) => item.value > 0)} option={donutOption(items, 'דחיות בסיבות המוצגות')} />
        <ChartPanel title={new Set(years).size === 1 ? 'דחיות לפי חודש וסיבה' : 'דחיות לפי שנה וסיבה'} empty={!points.length} option={barsOption(points, series, 'מספר דחיות')} />
      </div>
    </section>
  )
}
