import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpError } from '../../api/errors'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('원인별 메시지를 보여준다', () => {
    const { rerender } = render(
      <ErrorMessage error={new HttpError(503, '예보 요청 실패')} onRetry={() => {}} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/일시적인 문제가 있어요.*\(503\)/)

    rerender(<ErrorMessage error={new TypeError('Failed to fetch')} onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('네트워크 상태를 확인해 주세요')
  })

  it('오프라인이면 연결을 확인하라고 안내한다', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    render(<ErrorMessage error={new TypeError('Failed to fetch')} onRetry={() => {}} />)

    expect(screen.getByRole('alert')).toHaveTextContent('인터넷에 연결되어 있지 않아요')
  })

  it('다시 시도 버튼을 누르면 onRetry를 호출한다', async () => {
    const onRetry = vi.fn()
    render(<ErrorMessage error={new Error('?')} onRetry={onRetry} />)

    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
