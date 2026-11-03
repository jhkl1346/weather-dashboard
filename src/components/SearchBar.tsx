import { useId, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useCitySearch } from '../hooks/useCitySearch'
import { useDebounce } from '../hooks/useDebounce'
import { formatCityRegion } from '../lib/format'
import type { City } from '../types/weather'
import EmptyState from './states/EmptyState'
import ErrorMessage from './states/ErrorMessage'

type Props = {
  onSelect: (city: City) => void
}

export default function SearchBar({ onSelect }: Props) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const query = useDebounce(input, 300)
  const { data, isLoading, isError, error, refetch } = useCitySearch(query)

  const inputId = useId()
  const listboxId = useId()
  const results = data ?? []
  const showPanel = open && query.trim().length > 0
  const showList = showPanel && !isLoading && !isError && results.length > 0

  function select(city: City) {
    onSelect(city)
    setInput('')
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        if (!results.length) return
        e.preventDefault()
        setOpen(true)
        setActiveIndex((i) => (i + 1) % results.length)
        break
      case 'ArrowUp':
        if (!results.length) return
        e.preventDefault()
        setOpen(true)
        setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1))
        break
      case 'Enter': {
        // 항목을 고르지 않고 Enter를 누르면 첫 번째 결과를 선택한다.
        const city = results[activeIndex] ?? results[0]
        if (showList && city) {
          e.preventDefault()
          select(city)
        }
        break
      }
      case 'Escape':
        setOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // 검색 영역 안(재시도 버튼 등)으로 포커스가 옮겨갈 때는 닫지 않는다.
  function handleBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }

  return (
    <div className="relative" onBlur={handleBlur}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        도시 검색
      </label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        autoComplete="off"
        placeholder="도시 이름을 입력하세요 (예: 부산)"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={
          showList && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
      />

      {showPanel && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          {isLoading && (
            <p role="status" className="p-4 text-slate-600">
              검색 중…
            </p>
          )}
          {isError && (
            <div className="p-2">
              <ErrorMessage error={error} onRetry={() => refetch()} />
            </div>
          )}
          {!isLoading && !isError && results.length === 0 && (
            <EmptyState message={`'${query.trim()}'에 대한 검색 결과가 없어요.`} />
          )}
          {showList && (
            <ul id={listboxId} role="listbox" aria-label="검색 결과">
              {results.map((city, i) => (
                <li
                  key={`${city.lat},${city.lon}`}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  // 클릭 중에 input이 blur되어 목록이 닫히지 않도록 막는다.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(city)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`cursor-pointer px-4 py-3 ${i === activeIndex ? 'bg-sky-50' : ''}`}
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="ml-2 text-sm text-slate-500">{formatCityRegion(city)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
