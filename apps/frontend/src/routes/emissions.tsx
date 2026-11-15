import { createFileRoute } from '@tanstack/react-router'
import EmissionsPage from '@/legacy/app/emissions/page'

export const Route = createFileRoute('/emissions')({
  component: EmissionsPage,
  head: () => ({ meta: [{ title: 'פליטות CO2 - NZO' }] }),
})
