import type { RejectionReason } from './types'

export const rejectionReasons: Array<{
  value: RejectionReason
  label: string
}> = [
  { value: 'missing_power_of_attorney', label: 'ייפוי כח חסר' },
  { value: 'meter_issues', label: 'בעיות במונה' },
  { value: 'request_form_issues', label: 'בעיות במילוי הבקשה' },
  { value: 'other', label: 'אחר' },
]
