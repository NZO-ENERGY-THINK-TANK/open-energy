import { createFileRoute } from '@tanstack/react-router'
import ClimatePage from '@/legacy/app/climate/page'

export const Route = createFileRoute('/climate')({
  component: ClimatePage,
  head: () => ({ meta: [{ title: 'אקלים - NZO' }] }),
})
