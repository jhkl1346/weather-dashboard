import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { City } from '../types/weather'
import FavoriteCities from './FavoriteCities'

const seoul: City = {
  name: '서울',
  country: '대한민국',
  admin1: '서울특별시',
  lat: 37.5665,
  lon: 126.978,
}
const busan: City = { name: '부산광역시', country: '대한민국', lat: 35.1796, lon: 129.0756 }

function renderFavorites(favorites: City[]) {
  const onSelect = vi.fn()
  const onRemove = vi.fn()
  render(<FavoriteCities favorites={favorites} onSelect={onSelect} onRemove={onRemove} />)
  return { onSelect, onRemove, user: userEvent.setup() }
}

describe('FavoriteCities', () => {
  it('즐겨찾기가 없으면 추가하는 방법을 안내한다', () => {
    renderFavorites([])

    expect(screen.getByText(/☆ 버튼으로 자주 보는 도시를 추가해 보세요/)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('도시 이름과 지역을 함께 보여주고, 누르면 그 도시를 선택한다', async () => {
    const { onSelect, user } = renderFavorites([seoul, busan])

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    // 이름과 지역이 같거나 지역이 없으면 이름만 보여준다.
    expect(screen.getByRole('button', { name: '부산광역시' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '서울 서울특별시' }))
    expect(onSelect).toHaveBeenCalledWith(seoul)
  })

  it('× 버튼을 누르면 그 도시를 삭제한다', async () => {
    const { onSelect, onRemove, user } = renderFavorites([seoul, busan])

    await user.click(screen.getByRole('button', { name: '부산광역시 즐겨찾기에서 삭제' }))

    expect(onRemove).toHaveBeenCalledWith(busan)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
