import { useId } from 'react'
import { ConfigProvider, DatePicker } from 'antd'
import heILocale from 'antd/locale/he_IL'
import dayjs from 'dayjs'
import 'dayjs/locale/he'
import { ChevronDown } from 'lucide-react'
import { datePresets, presetRange } from '../smp/dates'
import { emissionsRangeSchema } from './types'
import type { EmissionsRange } from './types'

const PRESETS = datePresets.map((preset) => ({
  label: preset.label,
  value: (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const range = presetRange(preset.id)
    return [dayjs(range.start).locale('he'), dayjs(range.end).locale('he')]
  },
}))

export default function EmissionsDateRangeFilter({
  value,
  onChange,
}: {
  value: EmissionsRange
  onChange: (range: EmissionsRange) => void
}) {
  const id = useId()
  const startId = `${id}-start-date`
  const endId = `${id}-end-date`

  return (
    <div className="flex max-w-full flex-wrap items-center gap-3 text-sm text-slate-600">
      <span>סינון לפי:</span>
      <label htmlFor={startId} className="sr-only">
        תאריך התחלה
      </label>
      <label htmlFor={endId} className="sr-only">
        תאריך סיום
      </label>
      <ConfigProvider
        locale={heILocale}
        direction="rtl"
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
            const range = emissionsRangeSchema.safeParse({
              start: dates[0].format('YYYY-MM-DD'),
              end: dates[1].format('YYYY-MM-DD'),
            })
            if (range.success) onChange(range.data)
          }}
          presets={PRESETS}
          format="DD/MM/YYYY"
          placeholder={['תאריך התחלה', 'תאריך סיום']}
          id={{ start: startId, end: endId }}
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
