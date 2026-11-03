import { act, renderHook } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

type Success = (position: { coords: { latitude: number; longitude: number } }) => void
type Failure = (error: { code: number }) => void

/** getCurrentPosition을 흉내 낸다. 테스트에서 성공/실패 콜백을 직접 호출할 수 있게 잡아 둔다. */
function mockGeolocation() {
  const callbacks: { success?: Success; failure?: Failure } = {}
  const getCurrentPosition = vi.fn((success: Success, failure: Failure) => {
    callbacks.success = success
    callbacks.failure = failure
  })
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  })
  return callbacks
}

describe('useGeolocation', () => {
  afterEach(() => {
    // jsdom 기본 상태(geolocation 없음)로 되돌린다.
    Reflect.deleteProperty(navigator, 'geolocation')
  })

  it('위치를 찾는 동안 loading이고, 성공하면 좌표를 넘긴다', () => {
    const geo = mockGeolocation()
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useGeolocation(onSuccess))

    act(() => result.current.request())
    expect(result.current.status).toBe('loading')

    act(() => geo.success?.({ coords: { latitude: 37.5, longitude: 127 } }))
    expect(result.current.status).toBe('idle')
    expect(onSuccess).toHaveBeenCalledWith({ lat: 37.5, lon: 127 })
  })

  it('권한을 거부하면 안내 메시지를 보여준다', () => {
    const geo = mockGeolocation()
    const { result } = renderHook(() => useGeolocation(vi.fn()))

    act(() => result.current.request())
    act(() => geo.failure?.({ code: 1 }))

    expect(result.current.status).toBe('error')
    expect(result.current.error).toMatch('위치 권한이 거부됐어요')
  })

  it('시간이 초과되면 다시 시도하라고 안내한다', () => {
    const geo = mockGeolocation()
    const { result } = renderHook(() => useGeolocation(vi.fn()))

    act(() => result.current.request())
    act(() => geo.failure?.({ code: 3 }))

    expect(result.current.error).toMatch('다시 시도')
  })

  it('브라우저가 위치 기능을 지원하지 않으면 바로 안내한다', () => {
    const { result } = renderHook(() => useGeolocation(vi.fn()))

    act(() => result.current.request())

    expect(result.current.status).toBe('error')
    expect(result.current.error).toMatch('지원하지 않아요')
  })
})
