export type UsageReason = 1 | 2 | 3 | 4 | 5

export async function submitUsageReason(reason: UsageReason): Promise<void> {
  const response = await fetch('/api/newsletter-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Usage survey submission failed (${response.status}).`)
  }
}
