import type { ForecastResponse } from '../api/forecast'
import type { GeocodingResponse } from '../api/geocoding'

export const forecastResponse: ForecastResponse = {
  current: {
    temperature_2m: 12.4,
    apparent_temperature: 10.8,
    relative_humidity_2m: 55,
    weather_code: 2,
    wind_speed_10m: 7.2,
  },
  daily: {
    time: ['2026-11-03', '2026-11-04'],
    weather_code: [2, 63],
    temperature_2m_max: [15.1, 13.0],
    temperature_2m_min: [6.2, 8.4],
    precipitation_probability_max: [10, null],
  },
}

// 같은 이름의 도시가 여러 개인 경우를 확인하기 위한 샘플
export const geocodingResponse: GeocodingResponse = {
  results: [
    {
      name: '광주',
      country: '대한민국',
      admin1: '광주광역시',
      latitude: 35.15,
      longitude: 126.85,
      population: 1401235,
    },
    {
      name: '광주',
      country: '대한민국',
      admin1: '경기도',
      latitude: 37.41,
      longitude: 127.26,
      population: 81780,
    },
  ],
}

type MockOptions = {
  geocoding?: GeocodingResponse | number
  forecast?: ForecastResponse | number
}

/** URL에 따라 지오코딩/예보 응답을 돌려주는 fetch 목. 숫자를 넘기면 그 상태 코드로 실패한다. */
export function mockFetch({
  geocoding = geocodingResponse,
  forecast = forecastResponse,
}: MockOptions = {}) {
  return vi.fn(async (input: string | URL) => {
    const body = String(input).includes('geocoding-api') ? geocoding : forecast
    return typeof body === 'number'
      ? { ok: false, status: body }
      : { ok: true, status: 200, json: async () => body }
  })
}
