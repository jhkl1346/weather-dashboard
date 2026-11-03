type Props = {
  message: string
}

export default function EmptyState({ message }: Props) {
  return (
    <p role="status" className="p-4 text-center text-slate-600 dark:text-slate-300">
      <span aria-hidden="true">🔍 </span>
      {message}
    </p>
  )
}
