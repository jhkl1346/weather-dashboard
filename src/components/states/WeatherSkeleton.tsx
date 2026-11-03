function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function WeatherSkeleton() {
  return (
    <div role="status" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <span className="sr-only">날씨 정보를 불러오는 중…</span>
      <div aria-hidden="true" className="rounded-2xl bg-white p-6 shadow">
        <Bar className="h-5 w-24" />
        <div className="mt-4 flex items-center gap-4">
          <Bar className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Bar className="h-10 w-28" />
            <Bar className="h-4 w-20" />
          </div>
        </div>
        <Bar className="mt-6 h-10 w-full" />
      </div>
      <div aria-hidden="true" className="space-y-3 rounded-2xl bg-white p-6 shadow">
        <Bar className="h-5 w-24" />
        {Array.from({ length: 7 }, (_, i) => (
          <Bar key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}
