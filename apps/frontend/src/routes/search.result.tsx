import { createFileRoute } from '@tanstack/react-router'
import SearchPage from '@/legacy/app/search/result/page'

export const Route = createFileRoute('/search/result')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: SearchPage,
  head: () => ({ meta: [{ title: 'תוצאות חיפוש - NZO' }] }),
})
