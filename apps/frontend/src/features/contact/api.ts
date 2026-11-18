import { apiFetch } from '@/lib/api'
import { contactSchema } from './types.ts'
import type { ContactPayload } from './types.ts'

export async function submitContact(payload: ContactPayload): Promise<void> {
  const body = JSON.stringify(contactSchema.parse(payload))
  const response = await apiFetch('/api/submit-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body,
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Contact submission failed (${response.status}).`)
  }

  const acknowledgment: unknown = await response.json()
  if (
    typeof acknowledgment !== 'object' ||
    acknowledgment === null ||
    !('ok' in acknowledgment) ||
    acknowledgment.ok !== true
  ) {
    throw new Error('Invalid contact submission acknowledgment.')
  }
}
