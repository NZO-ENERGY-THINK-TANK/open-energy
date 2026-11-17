import type { EChartsOption, LineSeriesOption } from 'echarts'
import { periodLabel, type ChartRow, type ChartView } from './chartData'

const numberFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 })
const priceUnit = '₪/MWh'
const prices = [
  { key: 'withConstraints', name: 'מחיר שולי כולל אילוצים', color: '#166534' },
  { key: 'withoutConstraints', name: 'מחיר שולי ללא אילוצים', color: '#eab308' },
] as const
const splitLine = { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed' as const } }
const axisLine = { show: true, lineStyle: { color: '#666' } }
const axisName = { color: '#707585', fontSize: 14, fontWeight: 'normal' as const }
const tooltipStyle = {
  renderMode: 'richText' as const, confine: true,
  backgroundColor: '#fff', borderWidth: 0, borderRadius: 10,
  textStyle: { color: '#484C56', fontSize: 14 },
  shadowColor: '#99BF4129', shadowBlur: 30, shadowOffsetY: 2,
}

function formatted(value: unknown, unit: string) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${numberFormat.format(value)} ${unit}` : 'אין נתון'
}

function baseOption(description: string, comparison = false): EChartsOption {
  return {
    animation: false,
    textStyle: { fontFamily: 'Heebo, sans-serif', color: '#484C56' },
    aria: { enabled: true, label: { description } },
    legend: {
      bottom: 16, right: comparison ? 50 : 20,
      icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 24,
      selectedMode: comparison,
      textStyle: { fontSize: 14, fontWeight: 500, color: '#484C56' },
    },
    grid: { top: 50, left: 90, right: comparison ? 110 : 20, bottom: 100 },
    tooltip: tooltipStyle,
    media: [{
      query: { maxWidth: 600 },
      option: {
        grid: { left: 65, right: comparison ? 65 : 20 },
        legend: { right: 10, itemGap: 16, textStyle: { fontSize: 10 } },
      },
    }],
  }
}

function timeLabel(period: string, view: ChartView, multipleDays: boolean) {
  const [date, time] = period.split('T')
  const [year, month, day] = date.split('-')
  if (view === 'half-hour' && !multipleDays && time) return time.slice(0, 5)
  if (day) return `${day}/${month}`
  return month ? `${month}/${year.slice(-2)}` : year
}

export function timeOption(
  rows: ChartRow[], view: ChartView, description: string, generationUnit?: string,
): EChartsOption {
  const comparison = Boolean(generationUnit)
  const series: LineSeriesOption[] = (comparison ? prices.slice(0, 1) : prices).map((price) => ({
    name: price.name,
    type: 'line',
    data: rows.map((row) => row[price.key]),
    connectNulls: false,
    showSymbol: false,
    smooth: comparison ? 0.3 : false,
    itemStyle: { color: comparison ? '#10b981' : price.color },
    lineStyle: { width: 2, type: 'solid' },
    emphasis: { focus: 'series' },
    blur: { lineStyle: { opacity: 0.3 } },
    tooltip: { valueFormatter: (value) => formatted(value, priceUnit) },
  }))
  if (generationUnit) {
    series.push({
      name: 'ביקוש משקי',
      type: 'line',
      yAxisIndex: 1,
      data: rows.map((row) => row.generation),
      connectNulls: false,
      showSymbol: false,
      smooth: 0.3,
      itemStyle: { color: '#eab308' },
      lineStyle: { width: 2, type: 'solid' },
      emphasis: { focus: 'series' },
      blur: { lineStyle: { opacity: 0.3 } },
      tooltip: { valueFormatter: (value) => formatted(value, generationUnit) },
    })
  }
  const multipleDays = rows[0]?.period.slice(0, 10) !== rows.at(-1)?.period.slice(0, 10)
  return {
    ...baseOption(description, comparison),
    tooltip: { ...tooltipStyle, trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: rows.map((row) => row.period),
      axisLine,
      axisTick: { show: true },
      splitLine,
      axisLabel: {
        color: '#666', fontSize: 11, hideOverlap: true,
        formatter: (value: string) => timeLabel(value, view, multipleDays),
      },
      axisPointer: { label: { formatter: (params) => periodLabel(String(params.value)) } },
    },
    yAxis: [
      {
        type: 'value', name: 'מחיר שולי [MWh/₪]', scale: true,
        nameLocation: 'middle', nameGap: 60, nameTextStyle: axisName,
        position: 'left', axisLine, axisTick: { show: true }, splitLine,
        axisLabel: { color: '#666', fontSize: 12, margin: 10, formatter: (value: number) => numberFormat.format(value) },
      },
      ...(generationUnit ? [{
        type: 'value' as const, name: `[${generationUnit}]`,
        nameLocation: 'middle' as const, nameGap: 60, nameTextStyle: axisName,
        position: 'right' as const, scale: true, axisLine, axisTick: { show: true },
        splitLine: { show: false },
        axisLabel: { color: '#666', fontSize: 12, margin: 10, formatter: (value: number) => numberFormat.format(value) },
      }] : []),
    ],
    series,
  }
}

export function scatterOption(rows: ChartRow[], generationUnit: string, description: string): EChartsOption {
  return {
    ...baseOption(description, true),
    tooltip: {
      ...tooltipStyle, trigger: 'item',
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params
        if (!point || !Array.isArray(point.value)) return ''
        const [price, generation, period] = point.value
        return [
          periodLabel(String(period)),
          `מחיר שולי כולל אילוצים: ${formatted(price, priceUnit)}`,
          `ביקוש משקי: ${formatted(generation, generationUnit)}`,
        ].join('\n')
      },
    },
    xAxis: {
      type: 'value', name: '[₪]',
      nameLocation: 'middle', nameGap: 35, nameTextStyle: axisName, scale: true,
      axisLine, axisTick: { show: true }, splitLine,
      axisLabel: { color: '#666', fontSize: 12, formatter: (value: number) => numberFormat.format(value) },
    },
    yAxis: {
      type: 'value', name: `[${generationUnit}]`, scale: true,
      nameLocation: 'middle', nameGap: 60, nameTextStyle: axisName,
      axisLine, axisTick: { show: true }, splitLine,
      axisLabel: { color: '#666', fontSize: 12, formatter: (value: number) => numberFormat.format(value) },
    },
    series: [{
      name: 'מחיר שולי כולל אילוצים',
      type: 'scatter', symbol: 'circle', symbolSize: 8,
      itemStyle: { color: '#166534' },
      // Keep real price/demand pairs; legacy split these arbitrarily into two series.
      data: rows.flatMap((row) => row.generation !== null && row.withConstraints !== null
        ? [[row.withConstraints, row.generation, row.period]] : []),
      encode: { x: 0, y: 1 },
    }],
  }
}
