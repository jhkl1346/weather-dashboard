import { mergeResults, searchCities, toCities } from './geocoding'

const place = (name: string, latitude: number, population?: number) => ({
  name,
  country: '대한민국',
  latitude,
  longitude: 127,
  population,
})

describe('toCities', () => {
  it('검색 결과를 City 배열로 변환한다', () => {
    const cities = toCities({
      results: [
        { name: '서울', country: '대한민국', admin1: '서울', latitude: 37.57, longitude: 126.98 },
      ],
    })

    expect(cities).toEqual([
      { name: '서울', country: '대한민국', admin1: '서울', lat: 37.57, lon: 126.98 },
    ])
  })

  it('results 필드가 없으면 빈 배열을 돌려준다', () => {
    expect(toCities({})).toEqual([])
  })
})

describe('mergeResults', () => {
  it('인구가 많은 곳부터 정렬하고, 인구 정보가 없는 곳은 뒤로 보낸다', () => {
    const merged = mergeResults([
      { results: [place('부산 (마을)', 37.04)] },
      { results: [place('부산광역시', 35.18, 3285147)] },
    ])

    expect(merged.results?.map((r) => r.name)).toEqual(['부산광역시', '부산 (마을)'])
  })

  it('같은 좌표는 한 번만 남긴다', () => {
    const seoul = place('서울특별시', 37.57, 10349312)
    expect(mergeResults([{ results: [seoul] }, { results: [seoul] }]).results).toHaveLength(1)
  })

  it('결과는 최대 5개까지만 돌려준다', () => {
    const many = Array.from({ length: 4 }, (_, i) => place(`마을${i}`, i))
    expect(
      mergeResults([
        { results: many },
        {},
        { results: many.map((p) => ({ ...p, latitude: p.latitude + 10 })) },
      ]).results,
    ).toHaveLength(5)
  })
})

describe('searchCities', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('약칭으로 검색하면 정식 이름으로도 요청하고, 큰 도시를 먼저 보여준다', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const name = new URL(String(input)).searchParams.get('name')
      const results = name === '서울특별시' ? [place('서울특별시', 37.57, 10349312)] : undefined
      return { ok: true, json: async () => ({ results }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const cities = await searchCities('서울')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(cities.map((c) => c.name)).toEqual(['서울특별시'])
  })

  it('요청 중 하나라도 실패하면 예외를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }))

    await expect(searchCities('수원')).rejects.toThrow('502')
  })

  it('빈 검색어면 요청하지 않는다', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await searchCities('   ')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
