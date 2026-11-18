import { createFileRoute } from '@tanstack/react-router'
import TermsPage from '@/features/terms/TermsPage'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({ meta: [{ title: 'תקנון ומדיניות פרטיות - NZO' }] }),
})
