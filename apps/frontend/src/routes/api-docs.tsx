import { createFileRoute } from '@tanstack/react-router'
import ApiDocsPage from '@/legacy/app/api-docs/page'

export const Route = createFileRoute('/api-docs')({
  component: ApiDocsPage,
  head: () => ({ meta: [{ title: 'תיעוד API - NZO' }] }),
})
