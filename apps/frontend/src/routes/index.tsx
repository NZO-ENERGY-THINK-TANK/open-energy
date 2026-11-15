import { createFileRoute } from '@tanstack/react-router'
import HomePage from '@/legacy/app/page'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({ meta: [{ title: 'נתוני משק החשמל - NZO' }] }),
})
