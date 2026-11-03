import { useQuery } from '@tanstack/react-query'
import { searchCities } from '../api/geocoding'

export function useCitySearch(query: string) {
  const trimmed = query.trim()
  return useQuery({
    // 검색어가 키에 들어가므로, 늦게 도착한 이전 검색 결과가 현재 결과를 덮어쓰지 않는다.
    queryKey: ['cities', trimmed],
    queryFn: ({ signal }) => searchCities(trimmed, signal),
    enabled: trimmed.length > 0,
    staleTime: 60 * 60 * 1000, // 도시 좌표는 거의 바뀌지 않는다
  })
}
