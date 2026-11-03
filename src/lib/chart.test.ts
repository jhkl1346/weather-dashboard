import type { DailyWeather } from '../types/weather'
import { summarizeTemperatures, toChartData } from './chart'

const day = (date: string, tempMax: number, tempMin: number): DailyWeather => ({
  date,
  code: 0,
  tempMax,
  tempMin,
  precipProb: 0,
})

// 2026-11-03은 화요일
const days = [day('2026-11-03', 15.1, 6.2), day('2026-11-04', 17.4, 9), day('2026-11-05', 12, -2.4)]

describe('toChartData', () => {
  it('첫날은 "오늘", 나머지는 요일로 표시하고 단위를 바꾼다', () => {
    expect(toChartData(days, 'C')).toEqual([
      { label: '오늘', max: 15, min: 6 },
      { label: '수', max: 17, min: 9 },
      { label: '목', max: 12, min: -2 },
    ])
    expect(toChartData(days, 'F')[0]).toEqual({ label: '오늘', max: 59, min: 43 })
  })
})

describe('summarizeTemperatures', () => {
  it('가장 더운 날과 가장 추운 날을 문장으로 요약한다', () => {
    expect(summarizeTemperatures(days, 'C')).toBe(
      '3일 동안 가장 더운 날은 수요일(최고 17°C), 가장 추운 날은 목요일(최저 -2°C)이에요.',
    )
  })

  it('데이터가 없으면 안내 문구를 돌려준다', () => {
    expect(summarizeTemperatures([], 'C')).toBe('예보 데이터가 없어요.')
  })
})
