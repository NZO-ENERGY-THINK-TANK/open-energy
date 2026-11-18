import { ConfigProvider, DatePicker } from 'antd'
import heILocale from 'antd/locale/he_IL'
import dayjs from 'dayjs'
import 'dayjs/locale/he'
import { ChevronDown } from 'lucide-react'
import { climateRangeSchema } from './types'
import type { ClimateRange } from './types'

const PRESETS = [
  {
    label: 'היום',
    value: () =>
      [dayjs().locale('he'), dayjs().locale('he')] as [
        dayjs.Dayjs,
        dayjs.Dayjs,
      ],
  },
  {
    label: '7 ימים אחרונים',
    value: () =>
      [dayjs().subtract(6, 'day').locale('he'), dayjs().locale('he')] as [
        dayjs.Dayjs,
        dayjs.Dayjs,
      ],
  },
  {
    label: 'חודש זה',
    value: () =>
      [
        dayjs().startOf('month').locale('he'),
        dayjs().endOf('month').locale('he'),
      ] as [dayjs.Dayjs, dayjs.Dayjs],
  },
  {
    label: 'שנה זו',
    value: () =>
      [
        dayjs().startOf('year').locale('he'),
        dayjs().endOf('year').locale('he'),
      ] as [dayjs.Dayjs, dayjs.Dayjs],
  },
  {
    label: '12 חודשים אחרונים',
    value: () =>
      [
        dayjs().subtract(11, 'month').startOf('month').locale('he'),
        dayjs().endOf('month').locale('he'),
      ] as [dayjs.Dayjs, dayjs.Dayjs],
  },
  {
    label: 'עשור זה',
    value: () =>
      [
        dayjs().subtract(9, 'year').startOf('year').locale('he'),
        dayjs().endOf('year').locale('he'),
      ] as [dayjs.Dayjs, dayjs.Dayjs],
  },
]

export default function ClimateDateRangeFilter({
  value,
  onChange,
}: {
  value: ClimateRange
  onChange: (range: ClimateRange) => void
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center gap-3 text-sm text-slate-600">
      <span>סינון לפי:</span>
      <label htmlFor="climate-start-date" className="sr-only">
        תאריך התחלה
      </label>
      <label htmlFor="climate-end-date" className="sr-only">
        תאריך סיום
      </label>
      <ConfigProvider
        locale={heILocale}
        theme={{ token: { fontFamily: 'Heebo, sans-serif', borderRadius: 32 } }}
      >
        <DatePicker.RangePicker
          className="max-w-full rounded-[32px] [&_input]:text-xs [&_input]:font-medium md:[&_input]:text-sm"
          classNames={{
            popup: {
              root: 'max-md:max-w-[calc(100vw-16px)] max-md:[&_.ant-picker-panel-layout]:flex-col max-md:[&_.ant-picker-panels]:flex-col max-md:[&_.ant-picker-presets]:max-w-full max-md:[&_.ant-picker-presets_ul]:flex max-md:[&_.ant-picker-presets_ul]:flex-wrap max-md:[&_.ant-picker-panel-container]:max-h-[70vh] max-md:[&_.ant-picker-panel-container]:overflow-auto',
            },
          }}
          value={[
            dayjs(value.start).locale('he'),
            dayjs(value.end).locale('he'),
          ]}
          onChange={(dates) => {
            if (
              !dates?.[0]?.isValid() ||
              !dates[1]?.isValid() ||
              dates[0].isAfter(dates[1], 'day')
            )
              return
            const range = climateRangeSchema.safeParse({
              start: dates[0].format('YYYY-MM-DD'),
              end: dates[1].format('YYYY-MM-DD'),
            })
            if (range.success) onChange(range.data)
          }}
          presets={PRESETS}
          format="DD/MM/YYYY"
          placeholder={['תאריך התחלה', 'תאריך סיום']}
          id={{ start: 'climate-start-date', end: 'climate-end-date' }}
          separator=" - "
          suffix={
            <ChevronDown
              className="size-4 stroke-[#59687D]"
              aria-hidden="true"
            />
          }
          allowClear={false}
          order={false}
          showNow={false}
        />
      </ConfigProvider>
    </div>
  )
}
