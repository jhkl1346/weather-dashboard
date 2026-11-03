import { act, renderHook } from '@testing-library/react'
import { useFavorites } from './useFavorites'

const seoul = { name: '서울', country: '대한민국', lat: 37.5665, lon: 126.978 }
const busan = { name: '부산광역시', country: '대한민국', lat: 35.1796, lon: 129.0756 }

describe('useFavorites', () => {
  afterEach(() => vi.restoreAllMocks())

  it('도시를 추가하고 삭제한다', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => result.current.add(seoul))
    act(() => result.current.add(busan))
    expect(result.current.favorites.map((c) => c.name)).toEqual(['서울', '부산광역시'])
    expect(result.current.isFavorite(busan)).toBe(true)

    act(() => result.current.remove(seoul))
    expect(result.current.favorites).toEqual([busan])
  })

  it('같은 도시는 두 번 추가되지 않는다', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => result.current.add(seoul))
    act(() => result.current.add({ ...seoul, name: '서울특별시' }))

    expect(result.current.favorites).toHaveLength(1)
  })

  it('toggle은 없으면 추가하고, 있으면 삭제한다', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => result.current.toggle(seoul))
    expect(result.current.isFavorite(seoul)).toBe(true)
    act(() => result.current.toggle(seoul))
    expect(result.current.isFavorite(seoul)).toBe(false)
  })

  it('새로 열어도 저장된 즐겨찾기를 불러온다', () => {
    const first = renderHook(() => useFavorites())
    act(() => first.result.current.add(busan))

    expect(renderHook(() => useFavorites()).result.current.favorites).toEqual([busan])
  })

  it('localStorage가 막혀 있어도 추가·삭제는 동작한다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { result } = renderHook(() => useFavorites())

    act(() => result.current.add(seoul))
    expect(result.current.favorites).toEqual([seoul])
  })
})
