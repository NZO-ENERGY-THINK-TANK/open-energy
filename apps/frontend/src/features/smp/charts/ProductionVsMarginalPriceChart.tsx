import { useMemo, useState } from 'react'

import type { ProductionVsMarginalPriceResponse } from '../types'
import ChartPanel from './ChartPanel'
import { getProductionComparisonView, getProductionCorrelationView, viewDescription } from './chartData'
import { scatterOption, timeOption } from './chartOptions'

export type ProductionVsMarginalPriceChartProps = { data: ProductionVsMarginalPriceResponse }

export default function ProductionVsMarginalPriceChart({ data }: ProductionVsMarginalPriceChartProps) {
  const [mode, setMode] = useState<'time' | 'scatter'>('time')
  const { rows, view, requested, generationUnit } = useMemo(() => mode === 'scatter'
      ? getProductionCorrelationView(data)
      : getProductionComparisonView(data), [data, mode])
  const description = `${viewDescription(view, requested)}. השדה net_demand מייצג סך ייצור חשמל, לא ביקוש נטו. ${view === 'half-hour' ? 'הייצור הוא הספק ממוצע בכל חצי שעה (MW), בשעה המקומית של המקור.' : 'הייצור הוא סך האנרגיה בתקופה (MWh); המחירים הם ממוצעים שהוחזרו מהשרת.'} המחיר השולי כולל אילוצים נמדד ב־₪/MWh. ביקוש משקי הוא תווית התצוגה של סדרת הייצור. ${mode === 'scatter' ? 'ציר אופקי: מחיר שולי; ציר אנכי: ביקוש משקי. כל נקודה מצמידה ייצור ומחיר מאותו זמן או מאותה תקופה בלבד; זוגות חסרים אינם מוצגים.' : 'ציר אופקי: זמן; ציר שמאלי: מחיר שולי; ציר ימני: סך ייצור החשמל. ערכים חסרים נשארים פערים, לא אפסים.'}`
  const option = useMemo(() => mode === 'time'
    ? timeOption(rows, view, description, generationUnit)
    : scatterOption(rows, generationUnit, description), [rows, view, description, generationUnit, mode])
  const empty = !rows.some((row) => mode === 'scatter'
    ? row.generation !== null && row.withConstraints !== null
    : row.generation !== null || row.withConstraints !== null)

  return (
    <section dir="rtl" className="w-full min-w-0 space-y-3" aria-label="השוואת ייצור חשמל ומחיר שולי">

      <ChartPanel
        title={mode === 'time' ? 'סך ייצור החשמל ומחיר שולי לאורך זמן' : 'סך ייצור החשמל מול מחיר שולי — תרשים פיזור'}
        description={description}
        option={option}
        empty={empty}

        emptyMessage={mode === 'scatter' ? 'אין זוגות של ייצור ומחיר מאותו זמן או מאותה תקופה להצגה' : undefined}
      />
      <div role="group" aria-label="אופן הצגת הנתונים" className="mt-5 mb-4 flex w-fit gap-1 rounded-full bg-[#F8F8F8] p-1 shadow-[inset_0px_4px_10px_0px_#0000001A] md:p-[6px]">
        {(['time', 'scatter'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={`rounded-full px-2 py-[2px] text-xs transition-colors hover:bg-[#59687D] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#59687D] md:px-5 md:py-[6px] md:text-base ${value === 'time' ? 'font-black' : ''} ${mode === value ? 'bg-[#59687D] text-white' : 'bg-transparent text-[#59687D]'}`}
          >
            {value === 'time' ? 'על פני זמן' : 'תצוגת מתאם'}
          </button>
        ))}
      </div>
    </section>
  )
}
