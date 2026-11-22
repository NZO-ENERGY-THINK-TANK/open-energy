import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import DataChartCard from '@/components/data/DataChartCard'
import QueryContent from '@/components/data/QueryContent'
import { presetRange } from '../../smp/dates'
import EmissionsDateRangeFilter from '../EmissionsDateRangeFilter'
import { exportEmissions, useEmissionsMix } from '../api'
import { formatNumber, getMixSlices } from '../chartData'

export default function EmissionsMixCard() {
  const [range, setRange] = useState(() => presetRange('last7Days'))
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const query = useEmissionsMix(range)
  const data = query.data
  const slices = getMixSlices(data)
  const hasData = Boolean(data && data.time_series.length && slices)
  const avoided = data?.infographics?.emissions_avoided_through_renewables
  const rate = data?.infographics?.total_emissions_excluding_renewables
  const metrics = [
    {
      label: 'פליטות שנחסכו ביחס לפליטות ממקורות מאובנים',
      value: avoided?.percentage_of_actual_plus_savings,
      unit: '%',
    },
    {
      label: 'קצב פליטות ממוצע ממקורות מאובנים',
      value: rate?.value,
      unit: 'טונות CO₂ לשעה',
    },
    { label: 'ייצור חשמל', value: data?.total_generation_mwh, unit: 'MWh' },
  ]

  return (
    <DataChartCard
      title="תמהיל פליטות CO2"
      apiHash="co2-emissions-mix"
      onExport={() => exportEmissions('mix', range)}
      exportDisabled={!hasData}
      sourceNotes={
        <>
          <p>
            הנתונים נלקחים מאתר חברת ניהול מערכת החשמל- נגה. שיעור פליטות CO2
            ממקורות פוסיליים ופליטות CO2 שנחסכו עקב השימוש באנרגיה מתחדשת הם
            נתונים שמחושבים על ידי נגה. הנתונים מתעדכנים מעת לעת.
          </p>
          <p>
            התמהיל מציג טונות CO₂ לתקופה וכולל גם שמן הסקה ומתנול כאשר ערכם אינו
            אפס. ייצור החשמל מוצג ב־MWh; קצב הפליטות הממוצע אינו מדד עצימות
            פחמן.
          </p>
          <p>
            אחוז החיסכון מחושב כחיסכון מפליטות חלקי הפליטות ממקורות מאובנים, ולא
            חלקי סכום הפליטות והחיסכון. הוא עשוי לעלות על 100%.
          </p>
          <p>
            החישוב במקור מניח נתוני קצב במרווחי חמש דקות; משמעות הערכים במקור
            החלופי השעתי טרם אומתה.
          </p>
          <p>
            צטטו אותנו: מרכז השל לקיימות, NZO. אתר הדאטה של NZO. תמהיל פליטות
            CO2.
          </p>
        </>
      }
    >
      <EmissionsDateRangeFilter value={range} onChange={setRange} />
      <QueryContent
        isPending={query.isPending}
        isError={query.isError}
        hasData={Boolean(data)}
        onRetry={() => void query.refetch()}
      >
        {query.isFetching && data && (
          <p role="status" className="mt-3 text-sm text-slate-600">
            מעדכן נתונים…
          </p>
        )}
        {data &&
          (hasData && slices ? (
            <>
              <div
                className="relative mt-4 h-[260px] min-w-0 md:h-[320px]"
                aria-label="תמהיל פליטות לפי דלק, בטונות CO₂"
              >
                {data.total_emissions > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={slices}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={1}
                        isAnimationActive={false}
                        onMouseEnter={(_, index) =>
                          setHighlighted(slices[index].key)
                        }
                        onMouseLeave={() => setHighlighted(null)}
                      >
                        {slices.map((slice) => (
                          <Cell
                            key={slice.key}
                            fill={slice.color}
                            opacity={
                              highlighted && highlighted !== slice.key ? 0.3 : 1
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `${formatNumber(Number(value))} טונות CO₂`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-slate-600">סך הפליטות</span>
                  <bdi className="text-lg font-bold text-[#276E4E] md:text-2xl">
                    {formatNumber(data.total_emissions)}
                  </bdi>
                  <span className="text-xs">טונות CO₂</span>
                </div>
              </div>
              <ul className="flex flex-wrap justify-center gap-3 text-xs">
                {slices.map((slice) => (
                  <li key={slice.key}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlighted(slice.key)}
                      onMouseLeave={() => setHighlighted(null)}
                      onFocus={() => setHighlighted(slice.key)}
                      onBlur={() => setHighlighted(null)}
                      className="rounded-sm text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#276E4E]"
                    >
                      <span
                        className="me-1 inline-block size-2 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      {slice.label}: <bdi>{formatNumber(slice.value)}</bdi>{' '}
                      טונות CO₂ (<bdi>{formatNumber(slice.percent, 1)}%</bdi>)
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p
              role="status"
              className="flex min-h-64 items-center justify-center text-center text-slate-600"
            >
              אין נתוני תמהיל מלאים זמינים לטווח שנבחר.
            </p>
          ))}
        {data && (
          <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="min-w-0 text-center">
                <dt className="text-xs text-slate-600">{metric.label}</dt>
                <dd className="mt-2 text-sm font-bold text-[#276E4E]">
                  {metric.value == null ? (
                    'לא זמין'
                  ) : (
                    <>
                      <bdi>{formatNumber(metric.value)}</bdi>{' '}
                      <bdi>{metric.unit}</bdi>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </QueryContent>
    </DataChartCard>
  )
}
