import { geocodingResponse } from '../test/fixtures'
import { searchCities, toCities, type PhotonResponse } from './geocoding'

const feature = (name: string, lon: number, lat: number, countrycode = 'KR', state?: string) => ({
  geometry: { coordinates: [lon, lat] as [number, number] },
  properties: { name, state, countrycode },
})

describe('toCities', () => {
  it('Photon 응답을 City 배열로 변환한다', () => {
    expect(
      toCities({ features: [feature('남원시', 127.39, 35.42, 'KR', '전북특별자치도')] }),
    ).toEqual([
      { name: '남원시', country: '대한민국', admin1: '전북특별자치도', lat: 35.42, lon: 127.39 },
    ])
  })

  it('북한 등 대한민국이 아닌 곳은 뺀다', () => {
    const cities = toCities(geocodingResponse)
    expect(cities.map((c) => c.admin1)).toEqual(['광주광역시', '경기도'])
  })

  it('이름이 같고 가까운 곳(경계선과 중심점)은 한 번만 남긴다', () => {
    const raw: PhotonResponse = {
      features: [feature('하동군', 127.755, 35.068), feature('하동군', 127.8, 35.105)],
    }
    expect(toCities(raw)).toHaveLength(1)
  })

  it('이름이 같아도 멀리 떨어진 곳은 둘 다 남긴다', () => {
    const raw: PhotonResponse = {
      features: [
        feature('고성군', 128.322, 34.973, 'KR', '경상남도'),
        feature('고성군', 128.468, 38.381, 'KR', '강원특별자치도'),
      ],
    }
    expect(toCities(raw).map((c) => c.admin1)).toEqual(['경상남도', '강원특별자치도'])
  })

  it('같은 좌표의 도시는 한 번만 남긴다', () => {
    const raw: PhotonResponse = {
      features: [feature('서울특별시', 126.978, 37.5665), feature('서울특별시', 126.9781, 37.5664)],
    }
    expect(toCities(raw)).toHaveLength(1)
  })

  it('이름이 없는 결과는 무시하고, 최대 5개까지만 돌려준다', () => {
    const raw: PhotonResponse = {
      features: [
        { geometry: { coordinates: [127, 37] }, properties: { countrycode: 'KR' } },
        ...Array.from({ length: 7 }, (_, i) => feature(`도시${i}`, 127, 34 + i)),
      ],
    }
    const cities = toCities(raw)
    expect(cities).toHaveLength(5)
    expect(cities[0].name).toBe('도시0')
  })
})

describe('searchCities', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('빈 검색어면 요청하지 않는다', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await searchCities('   ')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('대한민국 범위의 시·군만, 한글 이름으로 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [] }) })
    vi.stubGlobal('fetch', fetchMock)

    await searchCities(' 전주 ')

    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.searchParams.get('q')).toBe('전주')
    expect(url.searchParams.get('bbox')).toBe('124.5,33.0,132.0,38.7')
    expect(url.searchParams.get('lang')).toBe('default')
    expect(url.searchParams.getAll('osm_tag')).toEqual(['place:city', 'place:county'])
  })

  it('HTTP 오류면 상태 코드와 함께 예외를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))

    await expect(searchCities('수원')).rejects.toThrow('429')
  })
})
