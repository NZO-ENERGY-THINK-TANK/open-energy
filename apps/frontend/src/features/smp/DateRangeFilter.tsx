import { ConfigProvider, DatePicker } from 'antd'
import heILocale from 'antd/locale/he_IL'
import dayjs from 'dayjs'
import 'dayjs/locale/he'
import { ChevronDown } from 'lucide-react'
import { datePresets, presetRange } from './dates'
import type { DateRange } from './types'
import './dateRangeFilter.css'

export default function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span>מיון לפי:</span>
      <ConfigProvider locale={heILocale} theme={{ token: { fontFamily: 'Heebo, sans-serif', borderRadius: 32 } }}>
        <DatePicker.RangePicker
          className="smp-date-range"
          value={[dayjs(value.start).locale('he'), dayjs(value.end).locale('he')]}
          onChange={(dates) => {
            if (dates?.[0] && dates[1]) onChange({ start: dates[0].format('YYYY-MM-DD'), end: dates[1].format('YYYY-MM-DD') })
          }}
          presets={datePresets.map((preset) => {
            const range = presetRange(preset.id)
            return { label: preset.label, value: [dayjs(range.start).locale('he'), dayjs(range.end).locale('he')] }
          })}
          format="DD/MM/YYYY"
          placeholder={['תאריך התחלה', 'תאריך סיום']}
          separator=" - "
          suffixIcon={<ChevronDown className="size-4 stroke-[#59687D]" />}
          allowClear={false}
          showNow={false}
        />
      </ConfigProvider>
    </div>
  )
}
