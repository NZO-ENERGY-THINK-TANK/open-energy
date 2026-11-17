import { useState } from 'react'
import SMPChartCard from './SMPChartCard'
import QueryContent from '@/components/data/QueryContent'
import { exportProductionVsMarginalPrice, useProductionVsMarginalPrice } from './api'
import ProductionVsMarginalPriceChart from './charts/ProductionVsMarginalPriceChart'
import DateRangeFilter from './DateRangeFilter'
import { presetRange } from './dates'
import SMPSourceNotes from './SMPSourceNotes'

export default function ProductionVsMarginalPriceCard() {
  const [range, setRange] = useState(() => presetRange('last7Days'))
  const query = useProductionVsMarginalPrice(range)
  const effectiveRange = query.data ? { start: query.data.start_date, end: query.data.end_date } : undefined

  return (
    <SMPChartCard
      title="מחיר השוק הסיטונאי (SMP) מול הביקוש לחשמל"
      apiHash="energy-smp-production-vs-marginal-price"
      sourceNotes={<SMPSourceNotes />}
      onExport={() => exportProductionVsMarginalPrice(effectiveRange ?? range)}
      exportDisabled={!query.data || query.isPending}

    >
      <DateRangeFilter value={effectiveRange ?? range} onChange={setRange} />
      <QueryContent isPending={query.isPending} isError={query.isError} hasData={!!query.data} onRetry={() => { void query.refetch() }}>
        {query.data && <ProductionVsMarginalPriceChart data={query.data} />}
      </QueryContent>
    </SMPChartCard>
  )
}
