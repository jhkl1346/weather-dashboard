import { useQuery } from '@tanstack/react-query'
import { HttpError } from '../api/errors'
import { searchCities } from '../api/geocoding'

export function useCitySearch(query: string) {
  const trimmed = query.trim()
  return useQuery({
    // 검색어가 키에 들어가므로, 늦게 도착한 이전 검색 결과가 현재 결과를 덮어쓰지 않는다.
    queryKey: ['cities', trimmed],
    queryFn: ({ signal }) => searchCities(trimmed, signal),
    enabled: trimmed.length > 0,
    staleTime: 60 * 60 * 1000, // 도시 좌표는 거의 바뀌지 않는다
    // 검색 서버(Photon)는 무료 공용 서버라, 요청이 많다고(429) 거절하거나 서버 오류가 나면
    // 자동으로 다시 보내지 않는다. 연결이 잠깐 끊긴 경우(네트워크 오류)만 한 번 더 시도한다.
    retry: (failureCount, error) => !(error instanceof HttpError) && failureCount < 1,
  })
}
