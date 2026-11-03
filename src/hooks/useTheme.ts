import { useEffect, useSyncExternalStore } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'system' | 'light' | 'dark'

export function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

const DARK_QUERY = '(prefers-color-scheme: dark)'

// 운영체제의 라이트/다크 설정이 바뀌면 바로 다시 그리도록 구독한다.
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DARK_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSystemPrefersDark() {
  return window.matchMedia(DARK_QUERY).matches
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system', isTheme)
  const systemPrefersDark = useSyncExternalStore(subscribe, getSystemPrefersDark, () => false)
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  return { theme, setTheme, isDark }
}
