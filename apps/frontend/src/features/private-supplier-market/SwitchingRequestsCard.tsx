import { useState } from 'react'
import { exportSwitchingRequests, useSwitchingRequests } from './api'
import SwitchingRequestsChart from './charts/SwitchingRequestsChart'
import MarketCard from './MarketCard'
import { CustomerFilter, MultiSelectFilter, SupplierFilter } from './MarketFilters'
import QueryContent from './QueryContent'
import type { CustomerType } from './types'

export default function SwitchingRequestsCard({ availableYears }: { availableYears: number[] }) {
  const [customerType, setCustomerType] = useState<CustomerType>()
  const [years, setYears] = useState<number[]>([])
  const query = useSwitchingRequests(customerType, years)
  const yearOptions = [...availableYears].sort((a, b) => b - a).map((year) => ({ value: year, label: String(year) }))

  return (
    <MarketCard
      title="סטטוס בקשות ניוד"
      apiHash="switching-requests"
      sourceNotes={<>
        <p>מוצגים סטטוסי הבקשות הכוללים ומספר הבקשות לאורך זמן, עבור השנים וסוג הלקוח שנבחרו.</p>
        <p>אין בתשובת השרת פילוח סטטוסים לאורך זמן או פילוח משולב לפי סוג מספק. לא מוצגים ערכים מחושבים לפי יחס משוער.</p>
      </>}
      onExport={() => exportSwitchingRequests(customerType, years)}
      exportDisabled={!query.data || query.isPending}
      exportNote="קובץ ה-Excel מסונן לפי השנים וסוג הלקוח שנבחרו, וכולל את כל סוגי המספקים."
    >
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <MultiSelectFilter label="שנה" options={yearOptions} values={years} onChange={setYears} />
        <SupplierFilter />
        <CustomerFilter value={customerType} onChange={setCustomerType} />
      </div>
      <p className="mb-4 text-sm text-[#59687D]">סינון לפי סוג מספק אינו זמין בנתוני הפילוח. מוצגים כלל המספקים.</p>
      <QueryContent isPending={query.isPending} isError={query.isError} hasData={!!query.data} note={query.data?.note} onRetry={() => { void query.refetch() }}>
        {query.data && <SwitchingRequestsChart data={query.data} supplierType="all" years={years} />}
      </QueryContent>
    </MarketCard>
  )
}
