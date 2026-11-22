import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Info, Loader2 } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import apiIcon from '@/assets/icons/api.png'
import downloadIcon from '@/assets/icons/download.png'

export default function SMPChartCard({
  title,
  apiHash,
  sourceNotes,
  onExport,
  exportDisabled,
  children,
}: {
  title: string
  apiHash: string
  sourceNotes: ReactNode
  onExport: () => Promise<void>
  exportDisabled?: boolean
  children: ReactNode
}) {
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
      className="min-w-0 rounded-2xl border border-[#E9C863] bg-white p-6 shadow-sm"
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3
            id={headingId}
            className="text-base leading-none font-extrabold tracking-tight text-[#484C56] md:text-lg"
          >
            {title}
          </h3>
          <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label={`מקור והערות: ${title}`}
                  className="shrink-0 cursor-help text-[#A1A1A1]/50"
                >
                  <Info size={21} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  dir="rtl"
                  sideOffset={8}
                  className="z-50 max-w-80 space-y-3 rounded-xl bg-white p-4 text-sm text-[#484C56] shadow-lg"
                >
                  {sourceNotes}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <div className="flex shrink-0 items-start gap-2 md:gap-4">
          <Link
            to="/api-docs"
            hash={apiHash}
            aria-label={`תיעוד API: ${title}`}
            className="hover:opacity-80"
          >
            <img src={apiIcon} alt="API" className="size-8" />
          </Link>
          <button
            type="button"
            disabled={exportDisabled || isExporting}
            onClick={() => void download()}
            aria-label={isExporting ? 'מוריד נתונים' : `הורדת Excel: ${title}`}
            className="cursor-pointer hover:opacity-80 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <img src={downloadIcon} alt="Download" className="size-8" />
            )}
          </button>
        </div>
      </header>
      {exportError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.
        </p>
      )}
      {children}
    </section>
  )
}
