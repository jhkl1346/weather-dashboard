import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockFetch } from '../test/fixtures'
import SearchBar from './SearchBar'

function renderSearchBar() {
  const onSelect = vi.fn()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <SearchBar onSelect={onSelect} />
    </QueryClientProvider>,
  )
  return { onSelect, user: userEvent.setup() }
}

describe('SearchBar', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('입력하면 지역과 함께 검색 결과를 보여준다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const { user } = renderSearchBar()

    await user.type(screen.getByLabelText('도시 검색'), '광주')

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('광주광역시, 대한민국')
    expect(options[1]).toHaveTextContent('경기도, 대한민국')
    // 스크린 리더가 이름과 지역을 띄어 읽도록 접근성 이름에 공백이 있어야 한다.
    expect(options[1]).toHaveAccessibleName('광주시 경기도, 대한민국')
  })

  it('입력이 멈춘 뒤 한 번만 요청한다', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    const { user } = renderSearchBar()

    await user.type(screen.getByLabelText('도시 검색'), 'Gwangju')
    await screen.findAllByRole('option')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('결과를 클릭하면 선택한 도시로 콜백을 호출한다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const { user, onSelect } = renderSearchBar()

    await user.type(screen.getByLabelText('도시 검색'), '광주')
    await user.click((await screen.findAllByRole('option'))[1])

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ admin1: '경기도' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByLabelText('도시 검색')).toHaveValue('')
  })

  it('방향키와 Enter로 결과를 고를 수 있다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const { user, onSelect } = renderSearchBar()

    const input = screen.getByRole('combobox')
    await user.type(input, '광주')
    await screen.findAllByRole('option')

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1].id)

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ admin1: '경기도' }))
  })

  it('Escape를 누르면 목록을 닫는다', async () => {
    vi.stubGlobal('fetch', mockFetch())
    const { user } = renderSearchBar()

    await user.type(screen.getByRole('combobox'), '광주')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('결과가 없으면 안내 문구를 보여준다', async () => {
    vi.stubGlobal('fetch', mockFetch({ geocoding: { features: [] } }))
    const { user } = renderSearchBar()

    await user.type(screen.getByLabelText('도시 검색'), 'zzzz')

    expect(await screen.findByText(/검색 결과가 없어요/)).toBeInTheDocument()
  })

  it('검색에 실패하면 에러와 재시도 버튼을 보여준다', async () => {
    const fetchMock = mockFetch({ geocoding: 500 })
    vi.stubGlobal('fetch', fetchMock)
    const { user } = renderSearchBar()

    await user.type(screen.getByLabelText('도시 검색'), 'Gwangju')
    expect(await screen.findByRole('alert')).toHaveTextContent('500')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
