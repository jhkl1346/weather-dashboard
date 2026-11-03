import { HttpError } from './errors'
import type { Forecast } from '../types/weather'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

/** Open-Meteo 응답 중 앱에서 쓰는 부분 */
export type ForecastResponse = {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: (number | null)[]
  }
}

/** API 응답을 앱에서 쓰기 좋은 모양으로 바꾼다. */
export function toForecast(raw: ForecastResponse): Forecast {
  const { current, daily } = raw
  return {
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      code: current.weather_code,
    },
    daily: daily.time.map((date, i) => ({
      date,
      code: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      precipProb: daily.precipitation_probability_max[i] ?? 0,
    })),
  }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
  })
  const res = await fetch(`${BASE_URL}?${params}`, { signal })
  if (!res.ok) {
    throw new HttpError(res.status, '날씨 정보를 불러오지 못했어요.')
  }
  return toForecast((await res.json()) as ForecastResponse)
}
