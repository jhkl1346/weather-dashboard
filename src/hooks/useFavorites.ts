import { isCityList, isSameCity } from '../lib/city'
import type { City } from '../types/weather'
import { useLocalStorage } from './useLocalStorage'

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<City[]>('favorites', [], isCityList)

  function isFavorite(city: City) {
    return favorites.some((f) => isSameCity(f, city))
  }

  function add(city: City) {
    // 이미 있는 도시는 다시 넣지 않는다.
    setFavorites((prev) => (prev.some((f) => isSameCity(f, city)) ? prev : [...prev, city]))
  }

  function remove(city: City) {
    setFavorites((prev) => prev.filter((f) => !isSameCity(f, city)))
  }

  function toggle(city: City) {
    if (isFavorite(city)) remove(city)
    else add(city)
  }

  return { favorites, isFavorite, add, remove, toggle }
}
