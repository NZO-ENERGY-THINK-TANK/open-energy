import { useState } from 'react'
import SMPChartCard from './SMPChartCard'
import QueryContent from '@/components/data/QueryContent'
import { exportSMP, useSMP } from './api'
import SMPPriceChart from './charts/SMPPriceChart'
import DateRangeFilter from './DateRangeFilter'
import { presetRange } from './dates'
import SMPSourceNotes from './SMPSourceNotes'

export default function SMPPriceCard() {
  const [range, setRange] = useState(() => presetRange('last7Days'))
  const query = useSMP(range)
  const effectiveRange = query.data
    ? { start: query.data.start_date, end: query.data.end_date }
    : undefined

  return (
    <SMPChartCard
      title="(SMP) התפתחות מחיר השוק הסיטונאי"
      apiHash="energy-smp"
      sourceNotes={<SMPSourceNotes />}
      onExport={() => exportSMP(effectiveRange ?? range)}
      exportDisabled={!query.data || query.isPending}
    >
      <DateRangeFilter value={effectiveRange ?? range} onChange={setRange} />
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={!!query.data}
        onRetry={() => {
          void query.refetch()
        }}
      >
        {query.data && <SMPPriceChart data={query.data} />}
      </QueryContent>
    </SMPChartCard>
  )
}
