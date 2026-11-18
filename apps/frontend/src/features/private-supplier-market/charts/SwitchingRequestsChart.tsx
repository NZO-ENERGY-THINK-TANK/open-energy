import type { SupplierType, SwitchingRequestsResponse } from '../types'
import { ChartNotice, ChartPanel, SupplierNotice } from './chartHelpers'
import {
  barsOption,
  donutOption,
  groupPeriods,
  responsePeriod,
} from './chartOptions'

export interface SwitchingRequestsChartProps {
  data: SwitchingRequestsResponse
  supplierType: SupplierType
  years: number[]
}

const statuses: Record<string, { name: string; color: string }> = {
  approved: { name: 'הושלמו', color: '#3A7C2F' },
  rejected: { name: 'נדחו', color: '#8B0000' },
  pending: { name: 'ממתין', color: '#F4D150' },
}
const requestSeries = [{ key: 'requests', name: 'סך הבקשות', color: '#3A7C2F' }]

export default function SwitchingRequestsChart({
  data,
  supplierType,
  years,
}: SwitchingRequestsChartProps) {
  const items = data.charts.requests_by_status.data.map((item) => ({
    ...(statuses[item.label] ?? { name: item.label, color: '#7DB2CE' }),
    value: item.count,
  }))
  const points = groupPeriods(
    data.monthly_requests,
    years,
    requestSeries,
    (row) => row.requests,
  )

  return (
    <section
      dir="rtl"
      className="min-w-0 space-y-3"
      aria-label="בקשות מעבר לספקים פרטיים"
    >
      <SupplierNotice supplierType={supplierType} />
      <ChartNotice>
        התרשים המעגלי מציג את סטטוסי הבקשות בתקופה שנבחרה. העמודות מציגות את סך
        הבקשות המדווח; אין במקור הנתונים פילוח סטטוסים חודשי.
      </ChartNotice>
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ChartPanel
          title={`סטטוס בקשות — ${responsePeriod(data)}`}
          empty={!items.some((item) => item.value > 0)}
          option={donutOption(items, 'בקשות לפי סטטוס')}
        />
        <ChartPanel
          title={
            new Set(years).size === 1
              ? 'סך בקשות לפי חודש — בשנה שנבחרה'
              : 'סך בקשות לפי שנה — בשנים שנבחרו (ללא בחירה: כולן)'
          }
          empty={!points.length}
          option={barsOption(points, requestSeries, 'מספר בקשות')}
        />
      </div>
    </section>
  )
}
