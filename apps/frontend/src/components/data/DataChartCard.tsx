import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Download, Info, Loader2 } from 'lucide-react'
import apiIcon from '@/assets/icons/api.png'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DataChartCardProps = {
  title: string
  apiHash: string
  sourceNotes: ReactNode
  onExport: () => Promise<void>
  exportDisabled?: boolean
  exportFormat?: 'Excel' | 'CSV'
  exportNote?: string
  children: ReactNode
}

export default function DataChartCard({
  title,
  apiHash,
  sourceNotes,
  onExport,
  exportDisabled,
  exportFormat = 'Excel',
  exportNote,
  children,
}: DataChartCardProps) {
  const headingId = useId()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  const download = async () => {
    if (isExporting) return
    setIsExporting(true)
    setExportError(false)
    try {
      await onExport()
    } catch {
      setExportError(true)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl border border-[#E9C863] bg-white p-4 md:p-6"
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3
            id={headingId}
            className="text-base font-extrabold text-[#484C56] md:text-lg"
          >
            {title}
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`מקור והערות: ${title}`}
                className="size-8 shrink-0 text-[#59687D]"
              >
                <Info size={20} aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              dir="rtl"
              aria-label={`מקור והערות: ${title}`}
              className="space-y-3 text-sm"
              align="start"
            >
              <p className="font-bold">מקור הנתונים והערות</p>

              {sourceNotes}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-[#59687D]"
          >
            <Link to="/api" hash={apiHash} aria-label={`תיעוד API: ${title}`}>
              <img src={apiIcon} width={32} height={32} alt="" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#59687D]"
            disabled={exportDisabled || isExporting}
            onClick={() => void download()}
            aria-label={
              isExporting ? 'מוריד נתונים' : `הורדת ${exportFormat}: ${title}`
            }
          >
            {isExporting ? (
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={20} aria-hidden="true" />
            )}
          </Button>
        </div>
      </header>
      {exportNote && (
        <p className="mb-3 text-sm text-[#59687D]">{exportNote}</p>
      )}
      {exportError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.
        </p>
      )}
      {children}
    </section>
  )
}
