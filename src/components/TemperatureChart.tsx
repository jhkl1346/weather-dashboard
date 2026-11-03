import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { summarizeTemperatures, toChartData } from '../lib/chart'
import type { TempUnit } from '../lib/units'
import type { DailyWeather } from '../types/weather'

type Props = {
  days: DailyWeather[]
  unit: TempUnit
}

// 색은 index.css의 CSS 변수로 지정해서 다크 모드에서 함께 바뀌게 한다.
const tick = { fill: 'var(--chart-text)', fontSize: 12 }

export default function TemperatureChart({ days, unit }: Props) {
  const data = toChartData(days, unit)

  return (
    <section
      aria-labelledby="temperature-chart-title"
      className="rounded-2xl bg-white p-6 shadow lg:col-span-2 dark:bg-slate-800"
    >
      <h2
        id="temperature-chart-title"
        className="text-lg font-semibold text-slate-600 dark:text-slate-300"
      >
        주간 기온
      </h2>
      <figure className="mt-2">
        {/* 차트 내용은 아래 figcaption 요약으로 전달하므로 스크린 리더에서는 숨긴다. */}
        <div className="h-60" aria-hidden="true">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 600, height: 240 }}
          >
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              accessibilityLayer={false}
            >
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
              <YAxis
                unit="°"
                width={40}
                tick={tick}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                formatter={(value) => `${value}°${unit}`}
                contentStyle={{
                  background: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-grid)',
                  borderRadius: 8,
                }}
                labelStyle={{ color: 'var(--chart-text)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-text)' }} />
              {/* 최고/최저를 색뿐 아니라 실선/점선으로도 구분한다. */}
              <Line
                type="monotone"
                dataKey="max"
                name="최고"
                stroke="var(--chart-max)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="min"
                name="최저"
                stroke="var(--chart-min)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {summarizeTemperatures(days, unit)}
        </figcaption>
      </figure>
    </section>
  )
}
