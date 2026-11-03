import type { Theme } from '../hooks/useTheme'
import type { TempUnit } from '../lib/units'

type Option<T> = { value: T; label: string }

type SegmentedProps<T extends string> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** 여러 버튼 중 하나를 고르는 토글. 선택 상태는 aria-pressed로 알린다. */
function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-lg bg-slate-200 p-0.5 text-sm dark:bg-slate-700"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              selected
                ? 'bg-white font-semibold shadow-sm dark:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const UNIT_OPTIONS: Option<TempUnit>[] = [
  { value: 'C', label: '°C' },
  { value: 'F', label: '°F' },
]

const THEME_OPTIONS: Option<Theme>[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
]

type Props = {
  unit: TempUnit
  onUnitChange: (unit: TempUnit) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

export default function SettingsBar({ unit, onUnitChange, theme, onThemeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented label="온도 단위" options={UNIT_OPTIONS} value={unit} onChange={onUnitChange} />
      <Segmented label="화면 테마" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
    </div>
  )
}
