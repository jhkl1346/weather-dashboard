/** 도시 검색 결과 */
export type City = {
  name: string
  country: string
  admin1?: string
  lat: number
  lon: number
  /** 브라우저 위치로 조회한 경우 (좌표로 찾은 지명을 보여주고, 못 찾으면 '현재 위치'로 표시) */
  isCurrentLocation?: boolean
}

/** 현재 날씨 */
export type CurrentWeather = {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  code: number
}

/** 하루치 예보 */
export type DailyWeather = {
  date: string
  code: number
  tempMax: number
  tempMin: number
  precipProb: number
}

export type Forecast = {
  current: CurrentWeather
  daily: DailyWeather[]
}
