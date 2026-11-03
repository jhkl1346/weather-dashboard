import { useQuery } from '@tanstack/react-query'
import { fetchForecast } from '../api/forecast'

export function useWeather(lat: number, lon: number) {
  return useQuery({
    queryKey: ['forecast', lat, lon],
    queryFn: ({ signal }) => fetchForecast(lat, lon, signal),
    staleTime: 10 * 60 * 1000, // 10분 동안은 캐시를 신선하게 본다
  })
}
