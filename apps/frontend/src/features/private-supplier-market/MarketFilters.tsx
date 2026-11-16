import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { CustomerType } from './types'

const selectClassName = 'h-9 rounded-full border border-[#DEDEDE] bg-white px-3 text-sm text-[#484C56] disabled:cursor-not-allowed disabled:opacity-60'

export function CustomerFilter({ value, onChange, disabled = false, label = 'סוג לקוח' }: {
  value?: CustomerType
  onChange?: (value: CustomerType | undefined) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <label className="flex min-w-32 flex-col gap-1 text-sm text-[#59687D]">
      {label}
      <select className={selectClassName} value={value ?? 'all'} disabled={disabled} onChange={(event) => onChange?.(event.target.value === 'all' ? undefined : event.target.value as CustomerType)}>
        <option value="all">הכל</option>
        <option value="residential">ביתי</option>
        <option value="non_residential">לא ביתי</option>
      </select>
    </label>
  )
}

export function SupplierFilter() {
  return (
    <label className="flex min-w-32 flex-col gap-1 text-sm text-[#59687D]">
      סוג מספק
      <select className={selectClassName} value="all" disabled>
        <option value="all">הכל — פילוח לא זמין</option>
      </select>
    </label>
  )
}

export function MultiSelectFilter<T extends string | number>({ label, options, values, onChange, keepOne = false }: {
  label: string
  options: Array<{ value: T; label: string }>
  values: T[]
  onChange: (values: T[]) => void
  keepOne?: boolean
}) {
  const id = useId()
  const allSelected = values.length === 0 || options.every((option) => values.includes(option.value))
  const summary = allSelected ? 'הכל' : values.length === 1 ? options.find((option) => option.value === values[0])?.label : `${values.length} נבחרו`

  return (
    <div className="flex min-w-32 flex-col gap-1 text-sm text-[#59687D]">
      <span id={id}>{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" aria-labelledby={`${id} ${id}-value`} disabled={!options.length} className="h-9 justify-between border-[#DEDEDE] bg-white font-normal">
            <span id={`${id}-value`}>{options.length ? summary : 'אין אפשרויות זמינות'}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent dir="rtl" align="start" aria-label={label} className="w-60">
          <fieldset className="max-h-64 space-y-3 overflow-y-auto">
            <legend className="mb-3 font-bold">{label}</legend>
            {!keepOne && (
              <Button type="button" variant="ghost" size="sm" disabled={allSelected} onClick={() => onChange([])}>
                בחירת כל השנים
              </Button>
            )}
            {options.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected || values.includes(option.value)}
                  disabled={allSelected ? options.length === 1 : values.length === 1 && values.includes(option.value)}
                  onChange={() => {
                    const current = allSelected ? options.map((entry) => entry.value) : values
                    const next = current.includes(option.value) ? current.filter((value) => value !== option.value) : [...current, option.value]
                    if (next.length > 0) onChange(next)
                  }}
                  className="size-4 accent-[#1E8025]"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </PopoverContent>
      </Popover>
    </div>
  )
}
