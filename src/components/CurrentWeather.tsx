import { formatTemp, type TempUnit } from '../lib/units'
import { describeWeather } from '../lib/weatherCode'
import type { CurrentWeather as CurrentWeatherData } from '../types/weather'

type Props = {
  cityName: string
  region?: string
  weather: CurrentWeatherData
  unit: TempUnit
  /** 넘기지 않으면 즐겨찾기 버튼을 숨긴다. (현재 위치 등) */
  favorite?: {
    active: boolean
    onToggle: () => void
  }
}

export default function CurrentWeather({ cityName, region, weather, unit, favorite }: Props) {
  const { label, icon } = describeWeather(weather.code)

  return (
    <section aria-label="현재 날씨" className="rounded-2xl bg-white p-6 shadow dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-300">{cityName}</h2>
          {region && <p className="text-sm text-slate-500 dark:text-slate-400">{region}</p>}
        </div>
        {favorite && (
          <button
            type="button"
            onClick={favorite.onToggle}
            aria-pressed={favorite.active}
            aria-label={`${cityName} 즐겨찾기`}
            title={favorite.active ? '즐겨찾기에서 삭제' : '즐겨찾기에 추가'}
            className={`rounded-full p-1 text-2xl leading-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              favorite.active
                ? 'text-amber-500'
                : 'text-slate-400 hover:text-amber-500 dark:text-slate-500'
            }`}
          >
            <span aria-hidden="true">{favorite.active ? '★' : '☆'}</span>
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-4">
        <span className="text-6xl" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="text-5xl font-bold">{formatTemp(weather.temp, unit)}</p>
          <p className="text-slate-600 dark:text-slate-300">{label}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <dt>체감</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">
            {formatTemp(weather.feelsLike, unit)}
          </dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{weather.humidity}%</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">
            {weather.windSpeed} km/h
          </dd>
        </div>
      </dl>
    </section>
  )
}
