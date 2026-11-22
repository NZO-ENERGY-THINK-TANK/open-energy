import { createFileRoute } from '@tanstack/react-router'
import ApiPage from '@/features/api/ApiPage'

export const Route = createFileRoute('/api-docs')({
  component: ApiPage,
  head: () => ({ meta: [{ title: 'תיעוד API - NZO' }] }),
})
