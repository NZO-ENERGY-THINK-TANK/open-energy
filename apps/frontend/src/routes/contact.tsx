import { createFileRoute } from '@tanstack/react-router'
import ContactPage from '@/legacy/app/contact/page'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  head: () => ({ meta: [{ title: 'יצירת קשר - NZO' }] }),
})
