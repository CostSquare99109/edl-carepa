import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useContadores } from './useContadores'
import { api } from '../api'

vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('useContadores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty contadores initially', () => {
    vi.mocked(api.get).mockResolvedValue({})
    const { result } = renderHook(() => useContadores(60_000))
    expect(result.current).toEqual({
      notificaciones_no_leidas: 0,
      compromisos_pendientes_aprobacion: 0,
      mis_compromisos_enviados: 0,
      evaluaciones_pendientes: 0,
    })
  })

  it('calls api.get with /dashboard/resumen', async () => {
    vi.mocked(api.get).mockResolvedValue({
      notificaciones_no_leidas: 5,
      compromisos_pendientes_aprobacion: 2,
      mis_compromisos_enviados: 1,
      evaluaciones_pendientes: 3,
    })
    renderHook(() => useContadores(60_000))
    expect(api.get).toHaveBeenCalledWith('/dashboard/resumen')
  })

  it('updates contadores from API response', async () => {
    vi.mocked(api.get).mockResolvedValue({
      notificaciones_no_leidas: 5,
      compromisos_pendientes_aprobacion: 2,
    })
    const { result } = renderHook(() => useContadores(60_000))
    await waitFor(() => {
      expect(result.current.notificaciones_no_leidas).toBe(5)
    })
    expect(result.current.compromisos_pendientes_aprobacion).toBe(2)
    expect(result.current.mis_compromisos_enviados).toBe(0)
    expect(result.current.evaluaciones_pendientes).toBe(0)
  })

  it('returns zeros on API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useContadores(60_000))
    await waitFor(() => {
      expect(result.current.notificaciones_no_leidas).toBe(0)
    })
  })

  it('polls at the specified interval', async () => {
    vi.mocked(api.get).mockResolvedValue({ notificaciones_no_leidas: 1 })
    renderHook(() => useContadores(5_000))
    expect(api.get).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5_000)
    expect(api.get).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(5_000)
    expect(api.get).toHaveBeenCalledTimes(3)
  })

  it('cleans up interval on unmount', () => {
    vi.mocked(api.get).mockResolvedValue({})
    const { unmount } = renderHook(() => useContadores(5_000))
    unmount()
    vi.advanceTimersByTime(5_000)
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('cancels stale API responses', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ notificaciones_no_leidas: 1 })
      .mockResolvedValueOnce({ notificaciones_no_leidas: 2 })
    const { result, unmount } = renderHook(() => useContadores(100))
    await vi.advanceTimersToNextTimerAsync()
    expect(api.get).toHaveBeenCalledTimes(2)
    unmount()
    await vi.advanceTimersToNextTimerAsync()
    await vi.advanceTimersToNextTimerAsync()
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('uses default 60s interval', () => {
    vi.mocked(api.get).mockResolvedValue({})
    renderHook(() => useContadores())
    vi.advanceTimersByTime(60_000)
    expect(api.get).toHaveBeenCalledTimes(2)
  })
})
