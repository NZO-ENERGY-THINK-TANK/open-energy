import { useEffect, useId, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

type ChartPanelProps = {
  option: EChartsOption
  title: string
  description: string
  empty: boolean
  emptyMessage?: string
}

export default function ChartPanel({
  option, title, description, empty,
  emptyMessage = 'אין נתונים להצגה בטווח שנבחר',
}: ChartPanelProps) {
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const chart = useRef<ReactECharts>(null)

  useEffect(() => {
    if (empty || !container.current || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => chart.current?.getEchartsInstance().resize())
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [empty])

  return (
    <figure dir="rtl" className="w-full min-w-0" aria-label={title}>
      <p id={`${id}-description`} className="sr-only">{description}</p>
      <div ref={container} className="h-[300px] w-full min-w-0 md:h-[500px]" dir="ltr">
        {empty ? (
          <div role="status" dir="rtl" className="flex h-full items-center justify-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div role="img" aria-label={title} aria-describedby={`${id}-description`} className="h-full w-full">
            <ReactECharts
              ref={chart}
              option={option}
              notMerge
              autoResize
              opts={{ renderer: 'svg' }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        )}
      </div>
    </figure>
  )
}
