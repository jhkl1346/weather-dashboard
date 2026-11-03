import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { HttpError } from '../api/errors'
import { mockFetch } from '../test/fixtures'
import { useCitySearch } from './useCitySearch'

function renderCitySearch(query: string) {
  // 재시도 간격을 0으로 줄여서 테스트가 기다리지 않게 한다. (재시도 횟수는 훅이 정한다)
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useCitySearch(query), { wrapper })
}

describe('useCitySearch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('검색어가 비어 있으면 요청하지 않는다', () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderCitySearch('   ')

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('앞뒤 공백을 지운 검색어로 요청해서 대한민국 도시만 돌려준다', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderCitySearch('  광주 ')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((city) => city.admin1)).toEqual(['광주광역시', '경기도'])
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get('q')).toBe('광주')
  })

  it('서버가 거절하면(429) 다시 요청하지 않는다', async () => {
    const fetchMock = mockFetch({ geocoding: 429 })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderCitySearch('광주')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(HttpError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('네트워크 오류는 한 번만 더 시도한다', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderCitySearch('광주')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
