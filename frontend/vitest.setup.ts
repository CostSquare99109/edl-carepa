import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock localStorage - functional implementation using Map
const localStorageStore = new Map<string, string>()
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore.set(key, String(value)) }),
  removeItem: vi.fn((key: string) => { localStorageStore.delete(key) }),
  clear: vi.fn(() => { localStorageStore.clear() }),
  get length() { return localStorageStore.size },
  key: vi.fn((index: number) => [...localStorageStore.keys()][index] ?? null),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch globally
global.fetch = vi.fn()

// Suppress console.error in tests unless needed
const originalError = console.error
console.error = (...args) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) return
  originalError.call(console, ...args)
}