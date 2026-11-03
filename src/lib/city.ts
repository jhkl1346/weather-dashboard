import type { City } from '../types/weather'

/** 좌표가 소수 둘째 자리(약 1km)까지 같으면 같은 도시로 본다. */
export function isSameCity(a: City, b: City): boolean {
  return a.lat.toFixed(2) === b.lat.toFixed(2) && a.lon.toFixed(2) === b.lon.toFixed(2)
}

/** localStorage에서 읽은 값이 City 모양인지 확인한다. */
export function isCity(value: unknown): value is City {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.country === 'string' &&
    typeof v.lat === 'number' &&
    typeof v.lon === 'number'
  )
}

export function isCityList(value: unknown): value is City[] {
  return Array.isArray(value) && value.every(isCity)
}
