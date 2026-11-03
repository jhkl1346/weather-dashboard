import { forecastResponse } from '../test/fixtures'
import { fetchForecast, toForecast } from './forecast'

describe('toForecast', () => {
  it('API 응답을 앱 타입으로 변환한다', () => {
    const result = toForecast(forecastResponse)

    expect(result.current).toEqual({
      temp: 12.4,
      feelsLike: 10.8,
      humidity: 55,
      windSpeed: 7.2,
      code: 2,
    })
    expect(result.daily).toHaveLength(2)
    expect(result.daily[0]).toEqual({
      date: '2026-11-03',
      code: 2,
      tempMax: 15.1,
      tempMin: 6.2,
      precipProb: 10,
    })
  })

  it('강수 확률이 null이면 0으로 처리한다', () => {
    expect(toForecast(forecastResponse).daily[1].precipProb).toBe(0)
  })
})

describe('fetchForecast', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('좌표를 쿼리에 담아 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => forecastResponse })
    vi.stubGlobal('fetch', fetchMock)

    await fetchForecast(37.5, 127)

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('latitude=37.5')
    expect(url).toContain('longitude=127')
    expect(url).toContain('timezone=auto')
  })

  it('HTTP 오류면 예외를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(fetchForecast(0, 0)).rejects.toThrow('500')
  })
})
