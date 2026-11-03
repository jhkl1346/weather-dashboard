import { act, renderHook } from '@testing-library/react'
import { useTheme } from './useTheme'

/** 운영체제 다크 모드 설정을 흉내 낸다. setDark로 설정이 바뀐 상황을 만들 수 있다. */
function mockSystemTheme(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<() => void>()
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return dark
        },
        media: query,
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      }) as unknown as MediaQueryList,
  )
  return {
    setDark(value: boolean) {
      dark = value
      act(() => listeners.forEach((listener) => listener()))
    },
  }
}

describe('useTheme', () => {
  afterEach(() => vi.restoreAllMocks())

  it('처음에는 시스템 설정을 따른다', () => {
    mockSystemTheme(true)
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('system')
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('시스템 설정이 바뀌면 바로 따라 바뀐다', () => {
    const system = mockSystemTheme(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.isDark).toBe(false)

    system.setDark(true)

    expect(result.current.isDark).toBe(true)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('직접 고른 테마는 시스템 설정보다 우선하고, 다시 열어도 유지된다', () => {
    const system = mockSystemTheme(true)
    const first = renderHook(() => useTheme())

    act(() => first.result.current.setTheme('light'))
    expect(first.result.current.isDark).toBe(false)
    expect(document.documentElement).not.toHaveClass('dark')

    system.setDark(false)
    act(() => first.result.current.setTheme('dark'))
    expect(document.documentElement).toHaveClass('dark')

    first.unmount()
    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark')
  })

  it('저장된 값이 잘못되어 있으면 시스템 설정으로 돌아간다', () => {
    mockSystemTheme(false)
    localStorage.setItem('weather-dashboard:theme', JSON.stringify('blue'))

    expect(renderHook(() => useTheme()).result.current.theme).toBe('system')
  })
})
