import type { ComponentProps } from 'react'
import DataChartCard from '@/components/data/DataChartCard'

export default function MarketCard({
  sourceNotes,
  ...props
}: ComponentProps<typeof DataChartCard>) {
  return (
    <DataChartCard
      {...props}
      sourceNotes={
        <>
          <p>הנתונים נלקחים מרשות החשמל ומתעדכנים מעת לעת.</p>
          <a
            href="https://www.gov.il/he/pages/bi_olam_haspaka"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary underline"
          >
            לנתוני רשות החשמל (נפתח בחלון חדש)
          </a>
          {sourceNotes}
        </>
      }
    />
  )
}
