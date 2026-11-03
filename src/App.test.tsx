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
