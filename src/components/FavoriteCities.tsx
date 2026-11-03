import type { City } from '../types/weather'

type Props = {
  favorites: City[]
  onSelect: (city: City) => void
  onRemove: (city: City) => void
}

export default function FavoriteCities({ favorites, onSelect, onRemove }: Props) {
  return (
    <section aria-labelledby="favorites-title" className="mt-4">
      <h2 id="favorites-title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        즐겨찾기
      </h2>
      {favorites.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          날씨 카드의 ☆ 버튼으로 자주 보는 도시를 추가해 보세요.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {favorites.map((city) => (
            <li
              key={`${city.lat},${city.lon}`}
              className="flex items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
            >
              <button
                type="button"
                onClick={() => onSelect(city)}
                className="rounded-l-full py-1.5 pr-1 pl-3 text-sm hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none dark:hover:text-sky-300"
              >
                {city.name}
                {city.admin1 && city.admin1 !== city.name && (
                  // span 밖에 공백을 둬야 스크린 리더가 '서울 서울특별시'처럼 띄어 읽는다.
                  <>
                    {' '}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {city.admin1}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(city)}
                aria-label={`${city.name} 즐겨찾기에서 삭제`}
                className="rounded-r-full py-1.5 pr-3 pl-1 text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none dark:hover:text-red-400"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
