import { createFileRoute } from '@tanstack/react-router'
import RenewableEnergy from './-RenewableEnergy'

export const Route = createFileRoute('/renewable-energy/')({
  component: RenewableEnergy,
  head: () => ({ meta: [{ title: 'אנרגיה מתחדשת - NZO' }] }),
})
