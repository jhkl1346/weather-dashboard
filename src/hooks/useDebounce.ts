import { useEffect, useState } from 'react'

/** value가 delay(ms) 동안 바뀌지 않았을 때만 갱신된 값을 돌려준다. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
