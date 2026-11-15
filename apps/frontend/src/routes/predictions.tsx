import { createFileRoute } from '@tanstack/react-router'
import PredictionsPage from '@/legacy/app/predictions/page'

export const Route = createFileRoute('/predictions')({
  component: PredictionsPage,
  head: () => ({ meta: [{ title: 'תחזיות והשוואות - NZO' }] }),
})
