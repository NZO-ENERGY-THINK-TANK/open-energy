import { createFileRoute } from '@tanstack/react-router'
import ApiPage from '@/features/api/ApiPage'

export const Route = createFileRoute('/api')({
  component: ApiPage,
  head: () => ({ meta: [{ title: 'ממשק API - NZO' }] }),
})
