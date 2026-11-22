import { exportConnectedConsumers, useConnectedConsumers } from './api'
import ConnectedConsumersChart from './charts/ConnectedConsumersChart'
import MarketCard from './MarketCard'
import { CustomerFilter } from './MarketFilters'
import QueryContent from '../../components/data/QueryContent'

export default function ConnectedConsumersCard() {
  const query = useConnectedConsumers()

  return (
    <MarketCard
      title="צרכנים המחוברים למספקי חשמל פרטיים"
      apiHash="private-supplier-connected-consumers"
      sourceNotes={
        <>
          <p>
            הנתונים מתייחסים למספר המונים ולא בהכרח למספר צרכנים ייחודיים.
            סיווגי המגזרים נקבעו על ידי רשות החשמל.
          </p>
          <p>
            הפילוח לפי מחוז מוצג לחודש האחרון הזמין; אין בתשובת השרת פילוח
            מחוזות לפי סוג לקוח.
          </p>
        </>
      }
      onExport={exportConnectedConsumers}
      exportDisabled={!query.data || query.isPending}
      exportNote="קובץ ה-Excel כולל את נתוני הטווח הזמין וכל המגזרים."
    >
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <CustomerFilter label="מגזר — פילוח מחוזי לא זמין" disabled />
        {query.data && (
          <p className="text-sm text-[#59687D]">
            טווח נתונים:{' '}
            <bdi>
              {query.data.start_date} – {query.data.end_date}
            </bdi>
          </p>
        )}
      </div>
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={!!query.data}
        onRetry={() => {
          void query.refetch()
        }}
      >
        {query.data && <ConnectedConsumersChart data={query.data} />}
      </QueryContent>
    </MarketCard>
  )
}
