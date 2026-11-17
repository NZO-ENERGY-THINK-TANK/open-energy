import { useState } from 'react'
import { exportSwitchingRequests, useSwitchingRequests } from './api'
import RejectionReasonsChart from './charts/RejectionReasonsChart'
import MarketCard from './MarketCard'
import { CustomerFilter, MultiSelectFilter, SupplierFilter } from './MarketFilters'
import { rejectionReasons } from './constants'
import QueryContent from '../../components/data/QueryContent'
import type { CustomerType, RejectionReason } from './types'

export default function RejectionReasonsCard({ availableYears }: { availableYears: number[] }) {
  const [customerType, setCustomerType] = useState<CustomerType>()
  const [years, setYears] = useState<number[]>([])
  const [reasons, setReasons] = useState<RejectionReason[]>(rejectionReasons.map((reason) => reason.value))
  const query = useSwitchingRequests(customerType, years)
  const yearOptions = [...availableYears].sort((a, b) => b - a).map((year) => ({ value: year, label: String(year) }))

  return (
    <MarketCard
      title="סיבות לדחיית בקשות ניוד"
      apiHash="switching-requests"
      sourceNotes={<>
        <p>מוצגים מספרי הדחיות לפי הסיבות המדווחות: ייפוי כח חסר, בעיות במונה, בעיות במילוי הבקשה ואחר.</p>
        <p>הסינון לפי סיבות הדחייה נעשה בתרשימים בלבד. נתוני השרת אינם מאפשרים פילוח משולב לפי סוג מספק.</p>
      </>}
      onExport={() => exportSwitchingRequests(customerType, years)}
      exportDisabled={!query.data || query.isPending}
      exportNote="קובץ ה-Excel מסונן לפי השנים וסוג הלקוח, אך כולל את כל סיבות הדחייה וכל סוגי המספקים."
    >
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <MultiSelectFilter label="שנה" options={yearOptions} values={years} onChange={setYears} />
        <SupplierFilter />
        <CustomerFilter value={customerType} onChange={setCustomerType} />
        <MultiSelectFilter label="סיבת דחייה" options={rejectionReasons} values={reasons} onChange={setReasons} keepOne />
      </div>
      <p className="mb-4 text-sm text-[#59687D]">סינון לפי סוג מספק אינו זמין בנתוני הפילוח. מוצגים כלל המספקים.</p>
      <QueryContent isPending={query.isPending} isError={query.isError} hasData={!!query.data} note={query.data?.note} onRetry={() => { void query.refetch() }}>
        {query.data && <RejectionReasonsChart data={query.data} supplierType="all" years={years} reasons={reasons} />}
      </QueryContent>
    </MarketCard>
  )
}
