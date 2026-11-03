import { useState } from 'react'

export type Coords = { lat: number; lon: number }

type Status = 'idle' | 'loading' | 'error'

// GeolocationPositionError.code 값 (1: 권한 거부, 2: 위치를 알 수 없음, 3: 시간 초과)
const ERROR_MESSAGES: Record<number, string> = {
  1: '위치 권한이 거부됐어요. 브라우저 설정에서 위치 권한을 허용하거나, 도시를 검색해 주세요.',
  2: '현재 위치를 찾지 못했어요. 잠시 후 다시 시도하거나 도시를 검색해 주세요.',
  3: '위치를 찾는 데 시간이 너무 오래 걸려요. 다시 시도해 주세요.',
}

const UNSUPPORTED = '이 브라우저는 위치 기능을 지원하지 않아요. 도시를 검색해 주세요.'

/** 버튼을 눌렀을 때만 위치를 요청한다. (페이지를 열자마자 권한을 묻지 않는다) */
export function useGeolocation(onSuccess: (coords: Coords) => void) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  function request() {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setError(UNSUPPORTED)
      return
    }
    setStatus('loading')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('idle')
        onSuccess({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      (err) => {
        setStatus('error')
        setError(ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES[2])
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    )
  }

  return { status, error, request }
}
