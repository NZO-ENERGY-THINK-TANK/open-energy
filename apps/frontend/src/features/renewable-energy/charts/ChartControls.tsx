import { useId, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Info, Loader2 } from 'lucide-react'
import apiIcon from '@/assets/icons/api.png'
import downloadIcon from '@/assets/icons/download.png'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ChartCard({
  title,
  apiHash,
  onExport,
  notes,
  filters,
  children,
}: {
  title: string
  apiHash: string
  onExport: () => Promise<void>
  notes: ReactNode
  filters?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  async function download() {
    if (exporting) return
    setExporting(true)
    setExportError(false)
    try {
      await onExport()
    } catch {
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section
      aria-labelledby={id}
      className="min-w-0 rounded-[20px] border border-[#E9C863] bg-white p-6 md:rounded-[40px]"
    >
      <header className="flex flex-col items-start justify-between gap-3 md:flex-row">
        <div className="mb-3 flex min-w-0 flex-col gap-2">
          <div className="mb-4 flex items-center gap-2">
            <h3 id={id} className="text-lg font-bold text-gray-700">
              {title}
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`מקור והערות: ${title}`}
                  className="shrink-0 rounded-full text-[#A1A1A1] focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Info size={21} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                dir="rtl"
                className="z-50 max-h-[70vh] max-w-[calc(100vw-40px)] space-y-2 overflow-y-auto text-sm"
                align="start"
              >
                {notes}
                <p>הנתונים מתעדכנים מעת לעת.</p>
                <p>
                  צטטו אותנו: מרכז השילוב לקיימות, NZO. אתר הדאטה של NZO.{' '}
                  {title}.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          {filters}
        </div>
        <div className="flex shrink-0 items-start gap-2 md:gap-4">
          <Link
            to="/api-docs"
            hash={apiHash}
            aria-label={`תיעוד API: ${title}`}
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <img src={apiIcon} width={32} height={32} alt="API" />
          </Link>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void download()}
            aria-label={`הורדת Excel: ${title}`}
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <img src={downloadIcon} width={32} height={32} alt="" />
            )}
          </button>
        </div>
      </header>
      {exportError && (
        <p role="alert" className="my-3 text-sm text-destructive">
          הורדת הנתונים נכשלה. אפשר לנסות שוב באמצעות כפתור ההורדה.
        </p>
      )}
      {children}
    </section>
  )
}

export function SourceNotes({ facilities = false }: { facilities?: boolean }) {
  const source = facilities
    ? 'https://www.gov.il/he/pages/bipua2024'
    : 'https://www.noga-iso.co.il/systemoperationunit/piechartspage/'
  return (
    <>
      <p>
        הנתונים נלקחים מ
        {facilities ? 'אתר רשות החשמל.' : 'אתר חברת ניהול מערכת החשמל – נוגה.'}{' '}
        <a
          className="break-all underline"
          href={source}
          target="_blank"
          rel="noopener noreferrer"
        >
          {source}
        </a>
      </p>
      {facilities && (
        <>
          <p className="pt-1 font-semibold text-[#484C56]">הערות כלליות:</p>
          <p>
            מידע זה הינו אינפורמטיבי בלבד ואין להסיק ממנו לגבי תשובה פרטנית.
            המידע המחייב הוא המידע המתקבל מהמחלק באופן פרטני אצל כל מבקש חיבור.
          </p>
          <p>
            נתוני הספק המתקנים המחוברים והמבוקשים הם ביחידות של MW ומוצגים
            במונחי DC (מחושב).
          </p>
          <p>
            ככל שדווחו על ידי המחלק נתוני הספק פאנלים בפועל (הספק DC), הם מוצגים
            בדו״ח. במידה שלא קיימים נתונים אלו ועבור נתונים חריגים על מנת להמיר
            את ההספק מ-AC ל-DC, נעשה שימוש בטבלת המרה הבאה: טבלת המרת DC/AC (PV)
            – יש להכפיל ב:
          </p>
          <ul className="list-inside list-disc space-y-1 pr-1">
            <li>דו שימוש: 1.2</li>
            <li>קרקעי: 1.3</li>
            <li>משולב אגירה: 2.3</li>
          </ul>
          <p>הנתונים מבוססים על מידע שמועבר מחברת החשמל ונוגה לרשות החשמל.</p>
        </>
      )}
    </>
  )
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-[120px] flex-col gap-1 text-sm text-slate-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 max-w-full rounded-full border bg-white px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  summary,
  onToggle,
  onToggleAll,
  extra,
}: {
  label: string
  values: string[]
  options: { value: string; label: string }[]
  onChange: (values: string[]) => void
  summary?: string
  onToggle?: (value: string) => void
  onToggleAll?: () => void
  extra?: ReactNode
}) {
  const id = useId()
  const all =
    values.length === 0 ||
    options.every((option) => values.includes(option.value))

  function toggle(value: string) {
    if (onToggle) return onToggle(value)
    const current = all ? options.map((item) => item.value) : values
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onChange(next)
  }

  return (
    <div className="flex min-w-[140px] flex-col gap-1 text-sm text-slate-600">
      <span id={id}>{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-labelledby={id}
            className="flex h-8 items-center justify-between gap-3 rounded-full border bg-white px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span>
              {summary ?? (all ? 'בחירה מרובה' : `${values.length} שנים`)}
            </span>
            <ChevronDown size={14} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          dir="rtl"
          align="start"
          className="w-[179px] rounded-2xl border-[#A1A1A1] bg-[#FAFAFC] p-3 shadow-[0px_3px_30px_rgba(153,191,65,0.16)]"
        >
          <div className="flex max-h-[228px] flex-col gap-2 overflow-y-auto">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={all}
                onChange={() => (onToggleAll ? onToggleAll() : onChange([]))}
              />
              הכל
            </label>
            {extra}
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-[#59687D]"
              >
                <input
                  type="checkbox"
                  checked={all || values.includes(option.value)}
                  onChange={() => toggle(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function ModeSwitch({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="mt-4 mb-4 flex w-fit max-w-full gap-1 rounded-full bg-[#F8F8F8] p-1 shadow-[inset_0px_4px_10px_0px_#0000001A] md:-mt-10 md:p-[6px]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-2 py-[2px] text-xs font-black focus-visible:outline-2 focus-visible:outline-offset-2 md:px-5 md:py-[6px] md:text-base ${value === option.value ? 'bg-[#59687D] text-white' : 'text-[#59687D] hover:bg-[#59687D] hover:text-white'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyChart() {
  return (
    <div
      role="status"
      className="flex min-h-64 items-center justify-center text-slate-600"
    >
      אין נתונים זמינים
    </div>
  )
}

export function Legend({
  series,
  hidden,
  hovered,
  onToggle,
  onHover,
}: {
  series: { key: string; label: string; color: string }[]
  hidden: string[]
  hovered: string | null
  onToggle: (key: string) => void
  onHover: (key: string | null) => void
}) {
  return (
    <div className="mt-4 flex flex-row-reverse flex-wrap justify-end gap-4">
      {series.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={!hidden.includes(item.key)}
          onClick={() => onToggle(item.key)}
          onMouseEnter={() => onHover(item.key)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(item.key)}
          onBlur={() => onHover(null)}
          className="flex items-center gap-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{
            opacity: hidden.includes(item.key)
              ? 0.4
              : hovered && hovered !== item.key
                ? 0.3
                : 1,
          }}
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function StackTooltip({
  active,
  payload,
  label,
  unit,
  series,
  decimals = 0,
}: {
  active?: boolean
  payload?: readonly { dataKey?: unknown; value?: unknown; color?: string }[]
  label?: unknown
  unit: string
  series: { key: string; label: string; color: string }[]
  decimals?: number
}) {
  if (!active || !payload?.length) return null
  const format = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  return (
    <div
      dir="rtl"
      className="min-w-[160px] rounded-lg border border-[#DEDEDE] bg-white p-4 text-sm shadow-xl"
    >
      <p className="text-gray-500">{String(label ?? '')}</p>
      <p className="mb-3 border-b border-[#707585] font-medium">
        סה״כ{' '}
        {format(
          payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
        )}{' '}
        {unit}
      </p>
      {series.map((item) => {
        const entry = payload.find((point) => point.dataKey === item.key)
        return entry ? (
          <p key={item.key} className="mb-1 flex items-start gap-2">
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span>
              {item.label.split(' | ')[0]}
              <br />
              {format(Number(entry.value) || 0)} {unit}
            </span>
          </p>
        ) : null
      })}
    </div>
  )
}
