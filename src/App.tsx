import { useState } from 'react'
import CurrentWeather from './components/CurrentWeather'
import DailyForecast from './components/DailyForecast'
import SearchBar from './components/SearchBar'
import ErrorMessage from './components/states/ErrorMessage'
import WeatherSkeleton from './components/states/WeatherSkeleton'
import { useWeather } from './hooks/useWeather'
import { formatCityRegion } from './lib/format'
import type { City } from './types/weather'

// 마일스톤 3에서 "마지막으로 본 도시"를 기억하기 전까지는 서울로 시작
const DEFAULT_CITY: City = {
  name: '서울',
  country: '대한민국',
  admin1: '서울특별시',
  lat: 37.5665,
  lon: 126.978,
}

export default function App() {
  const [city, setCity] = useState<City>(DEFAULT_CITY)
  const { data, isPending, isError, error, refetch } = useWeather(city.lat, city.lon)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="mb-4 text-2xl font-bold">Weather Dashboard</h1>

        <SearchBar onSelect={setCity} />

        <div className="mt-6">
          {isPending ? (
            <WeatherSkeleton />
          ) : isError ? (
            <ErrorMessage error={error} onRetry={() => refetch()} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CurrentWeather
                cityName={city.name}
                region={formatCityRegion(city)}
                weather={data.current}
              />
              <DailyForecast days={data.daily} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
