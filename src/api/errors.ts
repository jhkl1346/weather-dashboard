/** 서버가 2xx가 아닌 응답을 돌려줬을 때 */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(`${message} (${status})`)
    this.name = 'HttpError'
    this.status = status
  }
}

export type ErrorKind = 'offline' | 'network' | 'server' | 'client' | 'unknown'

export function classifyError(error: unknown): ErrorKind {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline'
  if (error instanceof HttpError) return error.status >= 500 ? 'server' : 'client'
  // fetch는 요청 자체가 실패하면(DNS, CORS, 연결 끊김) TypeError를 던진다.
  if (error instanceof TypeError) return 'network'
  return 'unknown'
}

const MESSAGES: Record<ErrorKind, string> = {
  offline: '인터넷에 연결되어 있지 않아요. 연결을 확인한 뒤 다시 시도해 주세요.',
  network: '서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.',
  server: '날씨 서버에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.',
  client: '요청을 처리하지 못했어요.',
  unknown: '알 수 없는 오류가 발생했어요.',
}

/** 원인별로 사용자에게 보여줄 메시지를 만든다. */
export function getErrorMessage(error: unknown): string {
  const kind = classifyError(error)
  const base = MESSAGES[kind]
  return error instanceof HttpError ? `${base} (${error.status})` : base
}
