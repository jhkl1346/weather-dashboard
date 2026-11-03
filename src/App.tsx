import { lazy, Suspense } from 'react'
import CurrentWeather from './components/CurrentWeather'
import DailyForecast from './components/DailyForecast'
import FavoriteCities from './components/FavoriteCities'
import SearchBar from './components/SearchBar'
import SettingsBar from './components/SettingsBar'
import ChartSkeleton from './components/states/ChartSkeleton'
import ErrorMessage from './components/states/ErrorMessage'
import WeatherSkeleton from './components/states/WeatherSkeleton'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useWeather } from './hooks/useWeather'
import { isCity } from './lib/city'
import { formatCityRegion } from './lib/format'
import { isTempUnit, type TempUnit } from './lib/units'
import type { City } from './types/weather'

// 차트 라이브러리(Recharts)가 커서, 첫 화면을 빨리 띄우려고 따로 나눠서 불러온다.
const TemperatureChart = lazy(() => import('./components/TemperatureChart'))

// 처음 방문했거나 저장된 도시가 없을 때 보여줄 도시
const DEFAULT_CITY: City = {
  name: '서울',
  country: '대한민국',
  admin1: '서울특별시',
  lat: 37.5665,
  lon: 126.978,
}

function describeRegion(city: City): string {
  return city.isCurrentLocation
    ? `위도 ${city.lat.toFixed(2)}, 경도 ${city.lon.toFixed(2)}`
    : formatCityRegion(city)
}

export default function App() {
  // 마지막으로 본 도시를 기억해서, 다시 열면 그 도시부터 보여준다.
  const [city, setCity] = useLocalStorage<City>('lastCity', DEFAULT_CITY, isCity)
  const [unit, setUnit] = useLocalStorage<TempUnit>('unit', 'C', isTempUnit)
  const { theme, setTheme } = useTheme()
  const favorites = useFavorites()
  const geolocation = useGeolocation(({ lat, lon }) =>
    setCity({ name: '현재 위치', country: '', lat, lon, isCurrentLocation: true }),
  )
  const { data, isPending, isError, error, refetch } = useWeather(city.lat, city.lon)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Weather Dashboard</h1>
          <SettingsBar unit={unit} onUnitChange={setUnit} theme={theme} onThemeChange={setTheme} />
        </header>

        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar onSelect={setCity} />
          </div>
          <button
            type="button"
            onClick={geolocation.request}
            disabled={geolocation.status === 'loading'}
            className="shrink-0 rounded-xl bg-sky-700 px-3 py-3 text-white shadow-sm hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-60"
          >
            <span aria-hidden="true">📍</span>
            <span className="ml-1">
              {geolocation.status === 'loading' ? '찾는 중…' : '현재 위치'}
            </span>
          </button>
        </div>
        {geolocation.error && (
          <p
            role="alert"
            className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            <span aria-hidden="true">⚠️ </span>
            {geolocation.error}
          </p>
        )}

        <FavoriteCities
          favorites={favorites.favorites}
          onSelect={setCity}
          onRemove={favorites.remove}
        />

        {/* 도시가 바뀌어 새 날씨가 뜨면 스크린 리더에 알려 준다. 영역은 항상 있어야 변화가 읽힌다. */}
        <p aria-live="polite" className="sr-only">
          {data && !isPending && !isError ? `${city.name} 날씨를 보여주고 있어요.` : ''}
        </p>

        <div className="mt-6">
          {isPending ? (
            <WeatherSkeleton />
          ) : isError ? (
            <ErrorMessage error={error} onRetry={() => refetch()} />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CurrentWeather
                cityName={city.name}
                region={describeRegion(city)}
                weather={data.current}
                unit={unit}
                favorite={
                  city.isCurrentLocation
                    ? undefined
                    : { active: favorites.isFavorite(city), onToggle: () => favorites.toggle(city) }
                }
              />
              <DailyForecast days={data.daily} unit={unit} />
              <Suspense fallback={<ChartSkeleton />}>
                <TemperatureChart days={data.daily} unit={unit} />
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
