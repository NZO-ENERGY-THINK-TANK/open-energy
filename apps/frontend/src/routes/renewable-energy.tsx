import { createFileRoute } from '@tanstack/react-router'
import RenewableEnergyPage from '@/legacy/app/renewable-energy/page'

export const Route = createFileRoute('/renewable-energy')({
  component: RenewableEnergyPage,
  head: () => ({ meta: [{ title: 'אנרגיות מתחדשות - NZO' }] }),
})
