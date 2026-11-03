import type { DailyWeather } from '../types/weather'
import { formatWeekday } from './format'
import { convertTemp, type TempUnit } from './units'

export type ChartPoint = { label: string; max: number; min: number }

function dayLabel(date: string, index: number): string {
  return index === 0 ? '오늘' : formatWeekday(date)
}

/** 차트에 넣을 데이터. 단위 변환까지 여기서 끝낸다. */
export function toChartData(days: DailyWeather[], unit: TempUnit): ChartPoint[] {
  return days.map((day, i) => ({
    label: dayLabel(day.date, i),
    max: convertTemp(day.tempMax, unit),
    min: convertTemp(day.tempMin, unit),
  }))
}

/** 차트를 볼 수 없는 사용자를 위한 한 줄 요약 */
export function summarizeTemperatures(days: DailyWeather[], unit: TempUnit): string {
  if (days.length === 0) return '예보 데이터가 없어요.'

  const points = toChartData(days, unit)
  const hottest = points.reduce((a, b) => (b.max > a.max ? b : a))
  const coldest = points.reduce((a, b) => (b.min < a.min ? b : a))
  const name = (label: string) => (label === '오늘' ? label : `${label}요일`)

  return (
    `${days.length}일 동안 가장 더운 날은 ${name(hottest.label)}(최고 ${hottest.max}°${unit}), ` +
    `가장 추운 날은 ${name(coldest.label)}(최저 ${coldest.min}°${unit})이에요.`
  )
}
