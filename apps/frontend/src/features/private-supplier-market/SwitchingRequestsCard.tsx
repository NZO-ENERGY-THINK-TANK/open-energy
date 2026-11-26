import { useState } from 'react'
import { exportSwitchingRequests, useSwitchingRequests } from './api'
import SwitchingRequestsChart from './charts/SwitchingRequestsChart'
import MarketCard from './MarketCard'
import {
  CustomerFilter,
  MultiSelectFilter,
  SupplierFilter,
} from './MarketFilters'
import QueryContent from '../../components/data/QueryContent'
import type { CustomerType, SupplierType } from './types'

export default function SwitchingRequestsCard({
  availableYears,
}: {
  availableYears: number[]
}) {
  const [customerType, setCustomerType] = useState<CustomerType>()
  const [supplierType, setSupplierType] = useState<SupplierType>('all')
  const [years, setYears] = useState<number[]>([])
  const query = useSwitchingRequests(customerType, years)
  const yearOptions = [...availableYears]
    .sort((a, b) => b - a)
    .map((year) => ({ value: year, label: String(year) }))

  return (
    <MarketCard
      title="סטטוס בקשות ניוד"
      apiHash="switching-requests"
      sourceNotes={
        <>
          <p>
            מוצגים סטטוסי הבקשות הכוללים ומספר הבקשות לאורך זמן, עבור השנים וסוג
            הלקוח וסוג המספק שנבחרו.
          </p>
          <p>
            הסינון לפי סוג מספק נעשה בתרשימים בלבד. אין בתשובת השרת פילוח
            סטטוסים לאורך זמן. לא מוצגים ערכים מחושבים לפי יחס משוער.
          </p>
        </>
      }
      onExport={() => exportSwitchingRequests(customerType, years)}
      exportDisabled={!query.data || query.isPending}
      exportNote="קובץ ה-Excel מסונן לפי השנים וסוג הלקוח שנבחרו, וכולל את כל סוגי המספקים."
    >
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <MultiSelectFilter
          label="שנה"
          options={yearOptions}
          values={years}
          onChange={setYears}
        />
        <SupplierFilter value={supplierType} onChange={setSupplierType} />
        <CustomerFilter value={customerType} onChange={setCustomerType} />
      </div>

      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={!!query.data}
        note={query.data?.note}
        onRetry={() => {
          void query.refetch()
        }}
      >
        {query.data && (
          <SwitchingRequestsChart
            data={query.data}
            supplierType={supplierType}
            years={years}
          />
        )}
      </QueryContent>
    </MarketCard>
  )
}
