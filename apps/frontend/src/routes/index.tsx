import HomePage from '@/routes/(home)/-HomePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({ meta: [{ title: 'נתוני משק החשמל - NZO' }] }),
})
