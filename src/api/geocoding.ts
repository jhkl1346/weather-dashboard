import { HttpError } from './errors'
import { isSameCity } from '../lib/city'
import type { City } from '../types/weather'

/**
 * 도시 검색은 Photon(OpenStreetMap 데이터)을 쓴다.
 * Open-Meteo 지오코딩은 한국 시·군이 빠져 있거나(삼척, 보은 등) 같은 이름의 작은 마을·북한 지역이
 * 섞여 나와서, 대한민국 시·군만 정확히 찾을 수 있는 Photon으로 바꿨다.
 */
const BASE_URL = 'https://photon.komoot.io/api/'
const MAX_RESULTS = 5
// 대한민국을 감싸는 사각형(서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도). 독도까지 포함한다.
const KOREA_BBOX = '124.5,33.0,132.0,38.7'
// 시(city)와 군(county)만 받는다. 읍·면·동, 역, 건물 같은 장소는 제외한다.
const PLACE_TAGS = ['place:city', 'place:county']

type PhotonFeature = {
  geometry: { coordinates: [lon: number, lat: number] }
  properties: {
    name?: string
    state?: string
    countrycode?: string
  }
}

export type PhotonResponse = {
  features: PhotonFeature[]
}

/**
 * OpenStreetMap에는 같은 군이 경계선과 중심점으로 따로 들어 있어, 좌표가 몇 km 떨어진 채 두 번 나올 수 있다.
 * (예: 하동군 두 개가 약 6km 차이) 그래서 이름이 같고 약 20km 안이면 같은 곳으로 본다.
 * 강원도·경상남도의 고성군처럼 이름만 같고 멀리 떨어진 곳은 서로 다른 곳으로 남긴다.
 */
function isDuplicate(a: City, b: City): boolean {
  if (isSameCity(a, b)) return true
  return a.name === b.name && Math.abs(a.lat - b.lat) < 0.2 && Math.abs(a.lon - b.lon) < 0.2
}

export function toCities(raw: PhotonResponse): City[] {
  const cities: City[] = []
  for (const { geometry, properties } of raw.features) {
    // 사각형이 북한 남쪽 일부에 걸치므로, 국가 코드로 한 번 더 거른다.
    if (properties.countrycode !== 'KR' || !properties.name) continue
    const [lon, lat] = geometry.coordinates
    const city: City = {
      name: properties.name,
      country: '대한민국',
      admin1: properties.state,
      lat,
      lon,
    }
    if (!cities.some((c) => isDuplicate(c, city))) cities.push(city)
  }
  return cities.slice(0, MAX_RESULTS)
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const name = query.trim()
  if (!name) return []

  const params = new URLSearchParams({
    q: name,
    // 걸러질 결과를 감안해 조금 넉넉히 받는다.
    limit: String(MAX_RESULTS * 2),
    bbox: KOREA_BBOX,
    // 브라우저 언어가 영어여도 'Seoul'이 아니라 '서울특별시'처럼 현지 이름을 받는다.
    lang: 'default',
  })
  for (const tag of PLACE_TAGS) params.append('osm_tag', tag)

  const res = await fetch(`${BASE_URL}?${params}`, { signal })
  if (!res.ok) {
    throw new HttpError(res.status, '도시 검색에 실패했어요.')
  }
  return toCities((await res.json()) as PhotonResponse)
}
