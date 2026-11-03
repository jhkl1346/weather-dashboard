import { useEffect, useState } from 'react'

const PREFIX = 'weather-dashboard:'

/**
 * localStorage에서 값을 읽는다.
 * 사파리 개인 정보 보호 모드처럼 저장소가 막혀 있거나, 값이 깨져 있으면 기본값을 쓴다.
 */
function read<T>(key: string, initialValue: T, isValid?: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return initialValue
    const parsed: unknown = JSON.parse(raw)
    if (isValid && !isValid(parsed)) return initialValue
    return parsed as T
  } catch {
    return initialValue
  }
}

/** useState처럼 쓰되, 값이 바뀔 때마다 localStorage에 저장한다. */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => read(key, initialValue, isValid))

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // 저장에 실패해도 앱은 메모리에 있는 값으로 계속 동작한다.
    }
  }, [key, value])

  return [value, setValue] as const
}
