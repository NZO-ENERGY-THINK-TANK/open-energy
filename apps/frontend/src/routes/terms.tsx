import { createFileRoute } from '@tanstack/react-router'
import TermsPage from '@/legacy/app/terms/page'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({ meta: [{ title: 'תקנון ומדיניות פרטיות - NZO' }] }),
})
