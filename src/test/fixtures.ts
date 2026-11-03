import type { ForecastResponse } from '../api/forecast'
import type { PhotonResponse, PhotonReverseResponse } from '../api/geocoding'

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

// 같은 이름의 도시가 여러 개인 경우와, 걸러야 하는 결과(북한)를 확인하기 위한 Photon 응답 샘플
export const geocodingResponse: PhotonResponse = {
  features: [
    {
      geometry: { coordinates: [126.85, 35.15] },
      properties: { name: '광주', state: '광주광역시', countrycode: 'KR' },
    },
    {
      geometry: { coordinates: [127.26, 37.41] },
      properties: { name: '광주시', state: '경기도', countrycode: 'KR' },
    },
    {
      geometry: { coordinates: [125.0, 37.9] },
      properties: { name: '광주', state: '황해남도', countrycode: 'KP' },
    },
  ],
}

// 구미시 좌표(36.12, 128.34)를 역지오코딩한 Photon 응답 샘플
export const reverseResponse: PhotonReverseResponse = {
  features: [
    {
      properties: {
        osm_key: 'highway',
        osm_value: 'living_street',
        name: '신시로24길',
        city: '구미시',
        state: '경상북도',
        country: '대한민국',
      },
    },
  ],
}

type MockOptions = {
  geocoding?: PhotonResponse | number
  reverse?: PhotonReverseResponse | number
  forecast?: ForecastResponse | number
}

/** URL에 따라 지오코딩/역지오코딩/예보 응답을 돌려주는 fetch 목. 숫자를 넘기면 그 상태 코드로 실패한다. */
export function mockFetch({
  geocoding = geocodingResponse,
  reverse = reverseResponse,
  forecast = forecastResponse,
}: MockOptions = {}) {
  return vi.fn(async (input: string | URL) => {
    const url = String(input)
    const body = url.includes('photon.komoot.io/reverse')
      ? reverse
      : url.includes('photon.komoot.io')
        ? geocoding
        : forecast
    return typeof body === 'number'
      ? { ok: false, status: body }
      : { ok: true, status: 200, json: async () => body }
  })
}
