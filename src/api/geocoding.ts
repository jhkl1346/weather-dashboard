import { HttpError } from './errors'
import { buildSearchNames } from '../lib/cityAliases'
import type { City } from '../types/weather'

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const MAX_RESULTS = 5

type GeocodingResult = {
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
  // 작은 마을은 인구 정보가 없다.
  population?: number
}

export type GeocodingResponse = {
  // 검색 결과가 없으면 results 필드 자체가 없다.
  results?: GeocodingResult[]
}

export function toCities(raw: GeocodingResponse): City[] {
  return (raw.results ?? []).map((r) => ({
    name: r.name,
    country: r.country ?? '',
    admin1: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }))
}

/**
 * 여러 이름으로 검색한 응답을 하나로 합친다.
 * 같은 좌표는 한 번만 남기고, 인구가 많은 곳(큰 도시)이 먼저 오도록 정렬한다.
 */
export function mergeResults(responses: GeocodingResponse[]): GeocodingResponse {
  const byLocation = new Map<string, GeocodingResult>()
  for (const r of responses.flatMap((res) => res.results ?? [])) {
    const key = `${r.latitude},${r.longitude}`
    if (!byLocation.has(key)) byLocation.set(key, r)
  }
  const results = [...byLocation.values()]
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, MAX_RESULTS)
  return { results }
}

async function requestCities(name: string, signal?: AbortSignal): Promise<GeocodingResponse> {
  const params = new URLSearchParams({
    name,
    count: String(MAX_RESULTS),
    language: 'ko',
    format: 'json',
  })
  const res = await fetch(`${BASE_URL}?${params}`, { signal })
  if (!res.ok) {
    throw new HttpError(res.status, '도시 검색에 실패했어요.')
  }
  return (await res.json()) as GeocodingResponse
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const names = buildSearchNames(query)
  if (!names.length) return []
  const responses = await Promise.all(names.map((name) => requestCities(name, signal)))
  return toCities(mergeResults(responses))
}
