import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// jsdom에는 없는 브라우저 기능을 테스트용으로 채운다.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// Recharts의 ResponsiveContainer가 크기 변화를 감지할 때 쓴다.
// jsdom은 화면을 그리지 않아 크기가 늘 0이므로, 고정 크기를 알려 준다.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    private callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      const entry = { target, contentRect: { width: 600, height: 240 } }
      this.callback([entry as unknown as ResizeObserverEntry], this)
    }
    unobserve() {}
    disconnect() {}
  }
}

// 한 테스트에서 저장한 값(즐겨찾기, 테마 등)이 다음 테스트에 남지 않게 한다.
afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})
