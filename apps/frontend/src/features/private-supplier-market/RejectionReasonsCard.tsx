import { useState } from 'react'
import { exportSwitchingRequests, useSwitchingRequests } from './api'
import RejectionReasonsChart from './charts/RejectionReasonsChart'
import MarketCard from './MarketCard'
import {
  CustomerFilter,
  MultiSelectFilter,
  SupplierFilter,
} from './MarketFilters'
import { rejectionReasons } from './constants'
import QueryContent from '../../components/data/QueryContent'
import type { CustomerType, RejectionReason, SupplierType } from './types'

export default function RejectionReasonsCard({
  availableYears,
}: {
  availableYears: number[]
}) {
  const [customerType, setCustomerType] = useState<CustomerType>()
  const [supplierType, setSupplierType] = useState<SupplierType>('all')
  const [years, setYears] = useState<number[]>([])
  const [reasons, setReasons] = useState<RejectionReason[]>(
    rejectionReasons.map((reason) => reason.value),
  )
  const query = useSwitchingRequests(customerType, years)
  const yearOptions = [...availableYears]
    .sort((a, b) => b - a)
    .map((year) => ({ value: year, label: String(year) }))

  return (
    <MarketCard
      title="סיבות לדחיית בקשות ניוד"
      apiHash="switching-requests"
      sourceNotes={
        <>
          <p>
            מוצגים מספרי הדחיות לפי הסיבות המדווחות: ייפוי כח חסר, בעיות במונה,
            בעיות במילוי הבקשה ואחר.
          </p>
          <p>
            הסינון לפי סוג מספק וסיבות הדחייה נעשה בתרשימים בלבד, על בסיס נתוני
            הפילוח המדווחים.
          </p>
        </>
      }
      onExport={() => exportSwitchingRequests(customerType, years)}
      exportDisabled={!query.data || query.isPending}
      exportNote="קובץ ה-Excel מסונן לפי השנים וסוג הלקוח, אך כולל את כל סיבות הדחייה וכל סוגי המספקים."
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
        <MultiSelectFilter
          label="סיבת דחייה"
          options={rejectionReasons}
          values={reasons}
          onChange={setReasons}
          keepOne
        />
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
          <RejectionReasonsChart
            data={query.data}
            supplierType={supplierType}
            years={years}
            reasons={reasons}
          />
        )}
      </QueryContent>
    </MarketCard>
  )
}
