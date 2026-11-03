/** 차트 코드를 불러오는 동안 같은 크기의 자리를 잡아 둬서 화면이 덜컹거리지 않게 한다. */
export default function ChartSkeleton() {
  return (
    <div role="status" className="rounded-2xl bg-white p-6 shadow lg:col-span-2 dark:bg-slate-800">
      <span className="sr-only">차트를 불러오는 중…</span>
      <div aria-hidden="true">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-60 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}
