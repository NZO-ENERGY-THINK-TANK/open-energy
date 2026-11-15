import { createFileRoute } from '@tanstack/react-router'
import ApiPage from '@/legacy/app/api/page'

export const Route = createFileRoute('/api')({
  component: ApiPage,
  head: () => ({ meta: [{ title: 'ממשק API - NZO' }] }),
})
