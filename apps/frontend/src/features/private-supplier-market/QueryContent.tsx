import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function QueryContent({ isPending, isError, hasData, note, onRetry, children }: {
  isPending: boolean
  isError: boolean
  hasData: boolean
  note?: string | null
  onRetry: () => void
  children: ReactNode
}) {
  if (isPending) {
    return <div role="status" className="flex min-h-64 items-center justify-center gap-2 text-[#59687D]"><Loader2 size={24} className="animate-spin" aria-hidden="true" />טוען נתונים…</div>
  }
  return (
    <>
      {isError && (
        <div role="alert" className="my-4 flex flex-wrap items-center justify-center gap-3 text-destructive">
          <p>{hasData ? 'עדכון הנתונים נכשל. מוצגים הנתונים האחרונים שנטענו.' : 'לא ניתן לטעון את הנתונים כרגע.'}</p>
          <Button type="button" variant="outline" onClick={onRetry}>ניסיון נוסף</Button>
        </div>
      )}
      {note && <p role="status" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{note}</p>}
      {children}
    </>
  )
}
