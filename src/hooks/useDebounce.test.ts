import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('지연 시간 동안 입력이 멈춰야 값을 갱신한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '서' },
    })

    rerender({ value: '서울' })
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('서')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('서울')
  })

  it('연속 입력 중에는 마지막 값만 반영한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    })

    rerender({ value: '부' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: '부산' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('부산')
  })
})
