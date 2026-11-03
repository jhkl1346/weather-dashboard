import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { forecastResponse, mockFetch } from './test/fixtures'

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('불러오는 동안 로딩 문구를 보여준다', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    renderApp()

    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중')
  })

  it('성공하면 서울의 현재 날씨를 보여준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => forecastResponse }),
    )
    renderApp()

    expect(await screen.findByText('12°C')).toBeInTheDocument()
    const current = screen.getByRole('region', { name: '현재 날씨' })
    expect(within(current).getByText('서울')).toBeInTheDocument()
    expect(within(current).getByText('구름 조금')).toBeInTheDocument()
  })

  it('성공하면 일별 예보를 보여준다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderApp()

    const section = await screen.findByRole('region', { name: '2일 예보' })
    const items = within(section).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('오늘')
    expect(items[0]).toHaveTextContent('강수 확률 10%')
    expect(items[1]).toHaveTextContent('비')
    expect(items[1]).toHaveTextContent('최고 13°')
    expect(items[1]).toHaveTextContent('최저 8°')
  })

  it('검색에서 도시를 고르면 그 도시의 날씨를 조회한다', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    renderApp()
    const user = userEvent.setup()

    await screen.findByText('12°C')
    await user.type(screen.getByLabelText('도시 검색'), '광주')
    await user.click((await screen.findAllByRole('option'))[1])

    expect(await screen.findByText('경기도, 대한민국')).toBeInTheDocument()
    const lastUrl = String(fetchMock.mock.calls.at(-1)?.[0])
    expect(lastUrl).toContain('latitude=37.41')
    expect(lastUrl).toContain('longitude=127.26')
  })

  it('실패하면 에러 메시지와 다시 시도 버튼을 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent('503')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })
})

describe('App 마일스톤 3 기능', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'geolocation')
  })

  function mockGeolocation(result: { lat: number; lon: number } | { code: number }) {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          success: (p: { coords: { latitude: number; longitude: number } }) => void,
          failure: (e: { code: number }) => void,
        ) => {
          if ('code' in result) failure(result)
          else success({ coords: { latitude: result.lat, longitude: result.lon } })
        },
      },
    })
  }

  it('°F를 고르면 화씨로 보여주고, 다시 열어도 설정이 유지된다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const user = userEvent.setup()
    const { unmount } = renderApp()

    await screen.findByText('12°C')
    await user.click(screen.getByRole('button', { name: '°F' }))

    expect(screen.getByText('54°F')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')

    unmount()
    renderApp()
    expect(await screen.findByText('54°F')).toBeInTheDocument()
  })

  it('즐겨찾기에 추가한 도시를 누르면 그 도시를 바로 조회한다', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderApp()

    const star = await screen.findByRole('button', { name: '서울 즐겨찾기' })
    await user.click(star)
    expect(star).toHaveAttribute('aria-pressed', 'true')

    // 다른 도시로 옮겨 갔다가, 즐겨찾기 목록에서 서울을 누른다.
    await user.type(screen.getByLabelText('도시 검색'), '광주')
    await user.click((await screen.findAllByRole('option'))[1])
    await screen.findByText('경기도, 대한민국')

    const favorites = screen.getByRole('region', { name: '즐겨찾기' })
    await user.click(within(favorites).getByRole('button', { name: '서울 서울특별시' }))

    expect(await screen.findByText('서울특별시, 대한민국')).toBeInTheDocument()
    // 서울 예보는 처음에 받아 둔 캐시를 다시 쓰므로 한 번만 요청한다.
    const seoulRequests = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('latitude=37.5665'),
    )
    expect(seoulRequests).toHaveLength(1)

    await user.click(within(favorites).getByRole('button', { name: '서울 즐겨찾기에서 삭제' }))
    expect(
      within(favorites).queryByRole('button', { name: '서울 서울특별시' }),
    ).not.toBeInTheDocument()
  })

  it('마지막으로 본 도시를 기억했다가 다시 열면 보여준다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const user = userEvent.setup()
    const { unmount } = renderApp()

    await screen.findByText('12°C')
    await user.type(screen.getByLabelText('도시 검색'), '광주')
    await user.click((await screen.findAllByRole('option'))[1])
    await screen.findByText('경기도, 대한민국')

    unmount()
    renderApp()
    expect(await screen.findByText('경기도, 대한민국')).toBeInTheDocument()
  })

  it('현재 위치 버튼을 누르면 그 좌표의 날씨를 보여준다', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    mockGeolocation({ lat: 36.12, lon: 128.34 })
    const user = userEvent.setup()
    renderApp()

    await screen.findByText('12°C')
    await user.click(screen.getByRole('button', { name: '현재 위치' }))

    const current = await screen.findByRole('region', { name: '현재 날씨' })
    expect(await within(current).findByText('위도 36.12, 경도 128.34')).toBeInTheDocument()
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('latitude=36.12')
    // 현재 위치는 이름이 없어서 즐겨찾기 버튼을 보여주지 않는다.
    expect(within(current).queryByRole('button', { name: /즐겨찾기/ })).not.toBeInTheDocument()
  })

  it('위치 권한을 거부하면 안내 메시지를 보여주고, 보던 도시는 그대로 둔다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    mockGeolocation({ code: 1 })
    const user = userEvent.setup()
    renderApp()

    await screen.findByText('12°C')
    await user.click(screen.getByRole('button', { name: '현재 위치' }))

    expect(screen.getByRole('alert')).toHaveTextContent('위치 권한이 거부됐어요')
    expect(screen.getByText('서울특별시, 대한민국')).toBeInTheDocument()
  })

  it('테마 버튼으로 다크 모드를 켜고 끈다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const user = userEvent.setup()
    renderApp()

    expect(document.documentElement).not.toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: '다크' }))
    expect(document.documentElement).toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: '라이트' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('주간 기온 차트에 텍스트 요약을 함께 보여준다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    renderApp()

    const chart = await screen.findByRole('region', { name: '주간 기온' })
    expect(within(chart).getByText(/가장 더운 날은 오늘\(최고 15°C\)/)).toBeInTheDocument()
  })
})
