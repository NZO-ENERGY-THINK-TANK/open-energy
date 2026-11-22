import {
  endOfMonth,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'
import type { DateRange } from './types'

export const datePresets = [
  { id: 'today', label: 'היום' },
  { id: 'last7Days', label: '7 ימים אחרונים' },
  { id: 'thisMonth', label: 'חודש זה' },
  { id: 'thisYear', label: 'שנה זו' },
  { id: 'last12Months', label: '12 חודשים אחרונים' },
  { id: 'last10Years', label: 'עשור זה' },
] as const

export function presetRange(
  preset: (typeof datePresets)[number]['id'],
): DateRange {
  const today = new Date()
  let start = today
  let end = today
  switch (preset) {
    case 'last7Days':
      start = subDays(today, 6)
      break
    case 'thisMonth':
      start = startOfMonth(today)
      end = endOfMonth(today)
      break
    case 'thisYear':
      start = startOfYear(today)
      end = endOfYear(today)
      break
    case 'last12Months':
      start = startOfMonth(subMonths(today, 11))
      end = endOfMonth(today)
      break
    case 'last10Years':
      start = startOfYear(subYears(today, 9))
      end = endOfYear(today)
      break
  }
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
}

export function isValidRange(range: DateRange): boolean {
  return (
    [range.start, range.end].every((value) => {
      const date = parseISO(value)
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        isValid(date) &&
        format(date, 'yyyy-MM-dd') === value
      )
    }) && range.start <= range.end
  )
}

export function formatRange(range: DateRange): string {
  return `${format(parseISO(range.start), 'dd/MM/yyyy')} – ${format(parseISO(range.end), 'dd/MM/yyyy')}`
}
