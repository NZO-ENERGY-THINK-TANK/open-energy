import type { EChartsOption, BarSeriesOption } from 'echarts'
import type { SwitchingRequestsResponse } from '../types'

export type ChartSeries = { key: string; name: string; color: string }
export type ChartPoint = { period: string; values: Record<string, number> }
const formatCount = (value: number) => value.toLocaleString('he-IL')

export function responsePeriod(data: SwitchingRequestsResponse) {
  const years =
    data.filter.years !== 'all'
      ? data.filter.years
      : data.filter.year !== 'all'
        ? [data.filter.year]
        : []
  return years.length ? `שנים: ${years.join(', ')}` : 'כל השנים בתשובת השרת'
}

// Only aggregate observed rows; missing months are not manufactured as zeroes.
export function groupPeriods<T extends { month: string }>(
  rows: T[],
  years: number[],
  series: ChartSeries[],
  values: (row: T, key: string) => number,
): ChartPoint[] {
  const selectedYears = new Set(years)
  const monthly = selectedYears.size === 1
  const groups = new Map<string, ChartPoint>()
  for (const row of rows) {
    if (selectedYears.size && !selectedYears.has(Number(row.month.slice(0, 4))))
      continue
    const period = monthly ? row.month : row.month.slice(0, 4)
    const point = groups.get(period) ?? { period, values: {} }
    for (const item of series)
      point.values[item.key] =
        (point.values[item.key] ?? 0) + values(row, item.key)
    groups.set(period, point)
  }
  return [...groups.values()].sort((a, b) => a.period.localeCompare(b.period))
}

export function barsOption(
  points: ChartPoint[],
  series: ChartSeries[],
  axisName: string,
): EChartsOption {
  const bars: BarSeriesOption[] = series.map((item) => ({
    name: item.name,
    type: 'bar',
    stack: 'counts',
    barMaxWidth: 48,
    itemStyle: { color: item.color },
    emphasis: { focus: 'series' },
    data: points.map((point) => point.values[item.key] ?? null),
  }))
  return {
    textStyle: { fontFamily: 'Heebo, sans-serif', color: '#59687D' },
    aria: { enabled: true },
    tooltip: {
      trigger: 'axis',
      renderMode: 'richText',
      valueFormatter: (value) => formatCount(Number(value)),
    },
    legend: { bottom: 0, type: 'scroll', icon: 'circle' },
    grid: { top: 48, right: 16, left: 16, bottom: 64, containLabel: true },
    xAxis: {
      type: 'category',
      data: points.map(({ period }) =>
        /^\d{4}-\d{2}$/.test(period)
          ? `${period.slice(5)}/${period.slice(0, 4)}`
          : period,
      ),
      axisLabel: { hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      name: axisName,
      minInterval: 1,
      axisLabel: { formatter: formatCount },
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
    },
    series: bars,
  }
}

export function donutOption(
  items: Array<{ name: string; value: number; color: string }>,
  label: string,
): EChartsOption {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return {
    textStyle: { fontFamily: 'Heebo, sans-serif', color: '#59687D' },
    aria: { enabled: true },
    tooltip: {
      trigger: 'item',
      renderMode: 'richText',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: { bottom: 0, type: 'scroll', icon: 'circle', selectedMode: false },
    title: {
      text: formatCount(total),
      subtext: label,
      left: 'center',
      top: '39%',
      textStyle: { fontSize: 22, color: '#59687D' },
    },
    series: [
      {
        type: 'pie',
        radius: ['46%', '72%'],
        center: ['50%', '45%'],
        label: { show: false },
        emphasis: { scale: true },
        data: items.map(({ color, ...item }) => ({
          ...item,
          itemStyle: { color },
        })),
      },
    ],
  }
}
