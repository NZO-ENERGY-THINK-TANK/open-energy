import { useEffect, useRef, type ReactNode } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { SupplierType } from '../types'

export function ChartNotice({ children }: { children: ReactNode }) {
  return <p role="note" className="text-sm text-slate-600">{children}</p>
}

export function SupplierNotice({ supplierType }: { supplierType: SupplierType }) {
  return supplierType !== 'all' ? (
    <ChartNotice>אין בנתונים פילוח משולב לפי סוג ספק. מוצגים נתונים לכל סוגי הספקים, ללא סינון לפי הספק שנבחר.</ChartNotice>
  ) : null
}

export function ChartPanel({ option, empty, title }: { option: EChartsOption; empty: boolean; title: string }) {
  const container = useRef<HTMLDivElement>(null)
  const chart = useRef<ReactECharts>(null)
  useEffect(() => {
    if (!container.current || empty) return
    const observer = new ResizeObserver(() => chart.current?.getEchartsInstance().resize())
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [empty])
  return (
    <figure className="min-w-0 w-full" dir="rtl">
      <figcaption className="mb-2 text-sm text-slate-600">{title}</figcaption>
      <div ref={container} className="h-[320px] w-full min-w-0 md:h-[500px]">
        {empty ? <div role="status" className="flex h-full items-center justify-center text-slate-600">אין נתונים להצגה</div> : (
          <ReactECharts ref={chart} option={option} notMerge style={{ height: '100%', width: '100%' }} />
        )}
      </div>
    </figure>
  )
}
