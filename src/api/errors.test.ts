import { classifyError, getErrorMessage, HttpError } from './errors'

describe('classifyError', () => {
  afterEach(() => vi.restoreAllMocks())

  it('5xx는 서버 오류, 4xx는 요청 오류로 분류한다', () => {
    expect(classifyError(new HttpError(503, '실패'))).toBe('server')
    expect(classifyError(new HttpError(400, '실패'))).toBe('client')
  })

  it('fetch가 던진 TypeError는 네트워크 오류로 분류한다', () => {
    expect(classifyError(new TypeError('Failed to fetch'))).toBe('network')
  })

  it('오프라인이면 원인과 상관없이 오프라인으로 분류한다', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    expect(classifyError(new HttpError(503, '실패'))).toBe('offline')
  })
})

describe('getErrorMessage', () => {
  it('HTTP 오류에는 상태 코드를 붙인다', () => {
    expect(getErrorMessage(new HttpError(500, '실패'))).toMatch(/서버.*\(500\)/)
  })

  it('알 수 없는 값도 메시지를 돌려준다', () => {
    expect(getErrorMessage('oops')).toBe('알 수 없는 오류가 발생했어요.')
  })
})
