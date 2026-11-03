import { render, screen, within } from '@testing-library/react'
import type { DailyWeather } from '../types/weather'
import DailyForecast from './DailyForecast'

const days: DailyWeather[] = [
  { date: '2026-11-03', code: 0, tempMax: 15.1, tempMin: 6.2, precipProb: 10 },
  { date: '2026-11-04', code: 51, tempMax: 13.0, tempMin: 8.4, precipProb: 100 },
]

describe('DailyForecast', () => {
  it('첫날은 "오늘", 다음 날부터는 요일로 보여준다', () => {
    render(<DailyForecast days={days} unit="C" />)

    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).getByText('오늘')).toBeInTheDocument()
    expect(within(items[1]).getByText('수')).toBeInTheDocument()
    expect(within(items[1]).getByText('11/4')).toBeInTheDocument()
  })

  it('날씨 설명, 강수 확률, 최고/최저 기온을 읽을 수 있는 문장으로 보여준다', () => {
    render(<DailyForecast days={days} unit="C" />)

    const second = screen.getAllByRole('listitem')[1]
    expect(second).toHaveTextContent('약한 이슬비')
    expect(second).toHaveTextContent('강수 확률 100%')
    expect(second).toHaveTextContent('최고 13°')
    expect(second).toHaveTextContent('최저 8°')
  })

  it('화씨를 고르면 화씨로 바꿔 보여준다', () => {
    render(<DailyForecast days={days} unit="F" />)

    // 15.1°C → 59.18°F → 59°
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('최고 59°')
  })

  it('제목에 예보 일수를 보여준다', () => {
    render(<DailyForecast days={days} unit="C" />)

    expect(screen.getByRole('region', { name: '2일 예보' })).toBeInTheDocument()
  })
})
