import { act, renderHook } from '@testing-library/react'
import { isTempUnit } from '../lib/units'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('저장된 값이 없으면 기본값을 쓴다', () => {
    const { result } = renderHook(() => useLocalStorage('unit', 'C'))
    expect(result.current[0]).toBe('C')
  })

  it('값을 바꾸면 localStorage에 저장하고, 다음에 다시 읽어 온다', () => {
    const first = renderHook(() => useLocalStorage('unit', 'C'))
    act(() => first.result.current[1]('F'))

    expect(localStorage.getItem('weather-dashboard:unit')).toBe('"F"')
    const second = renderHook(() => useLocalStorage('unit', 'C'))
    expect(second.result.current[0]).toBe('F')
  })

  it('저장된 값이 깨졌거나 형식이 틀리면 기본값을 쓴다', () => {
    localStorage.setItem('weather-dashboard:broken', '{not json')
    localStorage.setItem('weather-dashboard:unit', '"K"')

    expect(renderHook(() => useLocalStorage('broken', 1)).result.current[0]).toBe(1)
    expect(renderHook(() => useLocalStorage('unit', 'C', isTempUnit)).result.current[0]).toBe('C')
  })

  it('localStorage가 막혀 있어도 에러 없이 메모리 값으로 동작한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const { result } = renderHook(() => useLocalStorage('unit', 'C'))
    expect(result.current[0]).toBe('C')

    act(() => result.current[1]('F'))
    expect(result.current[0]).toBe('F')
  })
})
