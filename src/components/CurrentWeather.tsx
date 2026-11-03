import { describeWeather } from '../lib/weatherCode'
import type { CurrentWeather as CurrentWeatherData } from '../types/weather'

type Props = {
  cityName: string
  region?: string
  weather: CurrentWeatherData
}

export default function CurrentWeather({ cityName, region, weather }: Props) {
  const { label, icon } = describeWeather(weather.code)

  return (
    <section aria-label="현재 날씨" className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-slate-600">{cityName}</h2>
      {region && <p className="text-sm text-slate-500">{region}</p>}
      <div className="mt-2 flex items-center gap-4">
        <span className="text-6xl" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="text-5xl font-bold">{Math.round(weather.temp)}°C</p>
          <p className="text-slate-600">{label}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600">
        <div>
          <dt>체감</dt>
          <dd className="font-medium text-slate-900">{Math.round(weather.feelsLike)}°C</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd className="font-medium text-slate-900">{weather.humidity}%</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd className="font-medium text-slate-900">{weather.windSpeed} km/h</dd>
        </div>
      </dl>
    </section>
  )
}
