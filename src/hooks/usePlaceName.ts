import { useQuery } from '@tanstack/react-query'
import { HttpError } from '../api/errors'
import { reverseGeocode } from '../api/geocoding'

/** 현재 위치 좌표의 지명을 찾는다. enabled가 false면 요청하지 않는다. */
export function usePlaceName(lat: number, lon: number, enabled: boolean) {
  return useQuery({
    // 소수 셋째 자리(약 100m)까지만 키에 넣어, 거의 같은 위치는 캐시를 다시 쓴다.
    queryKey: ['place', lat.toFixed(3), lon.toFixed(3)],
    queryFn: ({ signal }) => reverseGeocode(lat, lon, signal),
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 지명은 거의 바뀌지 않는다
    // 도시 검색과 같은 공용 서버라, 서버가 거절하면 다시 보내지 않는다.
    retry: (failureCount, error) => !(error instanceof HttpError) && failureCount < 1,
  })
}
