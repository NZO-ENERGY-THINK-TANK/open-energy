import { createFileRoute } from '@tanstack/react-router'
import PredictionsPage from '@/features/predictions/PredictionsPage'
export const Route = createFileRoute('/predictions')({
  component: PredictionsPage,
  head: () => ({ meta: [{ title: 'תחזיות והשוואות - NZO' }] }),
})
