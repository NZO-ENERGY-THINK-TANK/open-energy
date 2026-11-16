import { createFileRoute } from '@tanstack/react-router'
// import PredictionsPage from '@/legacy/app/predictions/page'

// TODO: port PredictionsPage
export const Route = createFileRoute('/predictions')({
  component: () => { },
  head: () => ({ meta: [{ title: 'תחזיות והשוואות - NZO' }] }),
})
