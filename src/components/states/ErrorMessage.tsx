import { getErrorMessage } from '../../api/errors'

type Props = {
  error: unknown
  onRetry: () => void
}

export default function ErrorMessage({ error, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200"
    >
      <p>
        <span aria-hidden="true">⚠️ </span>
        {getErrorMessage(error)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded bg-red-700 px-3 py-1 text-white hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
      >
        다시 시도
      </button>
    </div>
  )
}
