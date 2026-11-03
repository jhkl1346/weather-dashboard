import { formatMonthDay, formatWeekday } from '../lib/format'
import { formatTemp, type TempUnit } from '../lib/units'
import { describeWeather } from '../lib/weatherCode'
import type { DailyWeather } from '../types/weather'

type Props = {
  days: DailyWeather[]
  unit: TempUnit
}

export default function DailyForecast({ days, unit }: Props) {
  return (
    <section
      aria-labelledby="daily-forecast-title"
      className="rounded-2xl bg-white p-6 shadow dark:bg-slate-800"
    >
      <h2
        id="daily-forecast-title"
        className="text-lg font-semibold text-slate-600 dark:text-slate-300"
      >
        {days.length}일 예보
      </h2>
      <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
        {days.map((day, i) => {
          const { label, icon } = describeWeather(day.code)
          return (
            <li key={day.date} className="flex items-center gap-3 py-2">
              <div className="w-12 shrink-0">
                <p className="font-medium">{i === 0 ? '오늘' : formatWeekday(day.date)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatMonthDay(day.date)}
                </p>
              </div>
              <span className="text-2xl" aria-hidden="true" title={label}>
                {icon}
              </span>
              {/* 좁은 화면에서는 아이콘만 보이고, 설명은 스크린 리더용으로 남긴다. */}
              <span className="sr-only min-w-0 flex-1 truncate text-sm text-slate-600 sm:not-sr-only dark:text-slate-300 sm:whitespace-nowrap">
                {label}
              </span>
              <span className="flex-1 sm:hidden" aria-hidden="true" />
              <span className="w-14 shrink-0 text-right text-sm text-sky-700 dark:text-sky-300">
                <span aria-hidden="true">💧</span>
                <span className="sr-only">강수 확률 </span>
                {day.precipProb}%
              </span>
              <span className="w-20 shrink-0 text-right tabular-nums">
                <span className="sr-only">최고 </span>
                <span className="font-semibold">{formatTemp(day.tempMax, unit, false)}</span>
                <span className="text-slate-400 dark:text-slate-500"> / </span>
                <span className="sr-only">최저 </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatTemp(day.tempMin, unit, false)}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
