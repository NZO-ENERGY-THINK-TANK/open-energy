import { useMemo } from 'react'
import type { SMPResponse } from '../types'
import ChartPanel from './ChartPanel'
import { getSMPPriceView, viewDescription } from './chartData'
import { timeOption } from './chartOptions'

export type SMPPriceChartProps = { data: SMPResponse }

export default function SMPPriceChart({ data }: SMPPriceChartProps) {
  const selected = useMemo(() => getSMPPriceView(data), [data])
  const { rows, view, requested } = selected
  const description = `${viewDescription(view, requested)}. מחיר שולי עם אילוצים וללא אילוצים בש״ח למגה־ואט שעה (₪/MWh). ${view === 'half-hour' ? 'מוצגים מחירים חצי־שעתיים בשעה המקומית של המקור.' : 'מוצגים ממוצעי המחיר שהוחזרו מהשרת לכל תקופה.'} ערכים חסרים נשארים פערים בקווים, לא אפסים.`
  const option = useMemo(() => timeOption(rows, view, description), [rows, view, description])
  const empty = !rows.some((row) => row.withConstraints !== null || row.withoutConstraints !== null)

  return <ChartPanel title="מחיר שולי של חשמל" description={description} option={option} empty={empty} />
}
