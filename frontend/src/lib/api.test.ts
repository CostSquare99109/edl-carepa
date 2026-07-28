import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

const mockToken = 'test.jwt.token'
const mockCsrf = 'csrf-token-123'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function mockFetch(response: Partial<Response>, body: unknown) {
  vi.mocked(fetch).mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
    ...response,
  } as Response)
}

describe('ApiClient - request', () => {
  it('sends GET request and returns data on code=01', async () => {
    localStorage.setItem('edl_token', mockToken)
    mockFetch({ status: 200 }, { code: '01', message: 'OK', data: { id: 1, name: 'test' } })
    const result = await api.get<{ id: number; name: string }>('/test')
    expect(result).toEqual({ id: 1, name: 'test' })
  })

  it('throws on code=02', async () => {
    mockFetch({ status: 400 }, { code: '02', message: 'Bad request', data: null })
    await expect(api.get('/test')).rejects.toThrow('Bad request')
  })

  it('throws on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'))
    await expect(api.get('/test')).rejects.toThrow('No se puede conectar con el servidor')
  })

  it('throws on empty response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') } as Response)
    await expect(api.get('/test')).rejects.toThrow('no respondio')
  })

  it('throws on invalid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('not json') } as Response)
    await expect(api.get('/test')).rejects.toThrow('Respuesta invalida')
  })

  it('sends Authorization header when token exists', async () => {
    localStorage.setItem('edl_token', mockToken)
    mockFetch({ status: 200 }, { code: '01', message: 'OK', data: null })
    await api.get('/test')
    const calls = vi.mocked(fetch).mock.calls
    const headers = calls[0][1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe(`Bearer ${mockToken}`)
  })

  it('sends CSRF header when csrf exists', async () => {
    localStorage.setItem('edl_token', mockToken)
    localStorage.setItem('edl_csrf', mockCsrf)
    mockFetch({ status: 200 }, { code: '01', message: 'OK', data: null })
    await api.get('/test')
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['X-CSRF-Token']).toBe(mockCsrf)
  })

  it('sends Content-Type: application/json for GET', async () => {
    mockFetch({ status: 200 }, { code: '01', message: 'OK', data: null })
    await api.get('/test')
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('ApiClient - CSRF retry', () => {
  it('retries on 419 status', async () => {
    localStorage.setItem('edl_token', mockToken)
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 419, text: () => Promise.resolve(JSON.stringify({ code: '02', message: 'CSRF token invalido', data: null })) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: '01', message: 'csrf ok', data: { csrf_token: 'new-csrf' } })) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: '01', message: 'OK', data: { success: true } })) } as Response)
    const result = await api.post('/test', { key: 'value' })
    expect(result).toEqual({ success: true })
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})

describe('ApiClient - 401 retry', () => {
  it('refreshes token and retries on 401', async () => {
    localStorage.setItem('edl_token', 'expired.token')
    const newToken = 'new.jwt.token'
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 401, text: () => Promise.resolve(JSON.stringify({ code: '02', message: 'Token expirado', data: null })) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: '01', message: 'Refreshed', data: { token: newToken } })) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: '01', message: 'OK', data: { recovered: true } })) } as Response)
    const result = await api.get('/protected')
    expect(result).toEqual({ recovered: true })
    expect(localStorage.getItem('edl_token')).toBe(newToken)
  })
})

describe('ApiClient - fetchCsrfToken', () => {
  it('stores csrf token from response', async () => {
    localStorage.setItem('edl_token', mockToken)
    vi.mocked(fetch).mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({ code: '01', data: { csrf_token: 'new-csrf' } }),
    } as Response)
    await api.fetchCsrfToken()
    expect(localStorage.getItem('edl_csrf')).toBe('new-csrf')
  })

  it('does not throw on failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    await expect(api.fetchCsrfToken()).resolves.toBeUndefined()
  })
})

describe('ApiClient - refreshToken', () => {
  it('returns null when no token exists', async () => {
    const result = await api.refreshToken()
    expect(result).toBeNull()
  })

  it('refreshes token successfully', async () => {
    localStorage.setItem('edl_token', 'old.token')
    vi.mocked(fetch).mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({ code: '01', data: { token: 'new.token' } }),
    } as Response)
    const result = await api.refreshToken()
    expect(result).toBe('new.token')
    expect(localStorage.getItem('edl_token')).toBe('new.token')
  })

  it('returns null on non-ok response', async () => {
    localStorage.setItem('edl_token', 'old.token')
    vi.mocked(fetch).mockResolvedValue({
      ok: false, status: 401, json: () => Promise.resolve({}),
    } as Response)
    const result = await api.refreshToken()
    expect(result).toBeNull()
  })
})

describe('ApiClient - download helpers', () => {
  beforeEach(() => {
    localStorage.setItem('edl_token', mockToken)
  })

  it('archivoUrl returns correct path', () => {
    expect(api.archivoUrl(42)).toContain('/evidencias/archivo/42')
  })

  it('downloadUrl appends token query param', () => {
    const url = api.downloadUrl('/reporte/pdf')
    expect(url).toContain('token=')
    expect(url).toContain(encodeURIComponent(mockToken))
  })

  it('downloadUrl appends with existing query params', () => {
    const url = api.downloadUrl('/reporte/pdf?id=1')
    expect(url).toContain('&token=')
  })
})

describe('ApiClient - postFormData', () => {
  it('sends form data without Content-Type', async () => {
    localStorage.setItem('edl_token', mockToken)
    const formData = new FormData()
    formData.append('file', 'test')
    mockFetch({ status: 200 }, { code: '01', message: 'OK', data: { uploaded: true } })
    const result = await api.postFormData('/upload', formData)
    expect(result).toEqual({ uploaded: true })
  })

  it('throws on error code from form data upload', async () => {
    localStorage.setItem('edl_token', mockToken)
    const formData = new FormData()
    vi.mocked(fetch).mockResolvedValue({
      ok: true, status: 400, text: () => Promise.resolve(JSON.stringify({ code: '02', message: 'Upload failed', data: null })),
    } as Response)
    await expect(api.postFormData('/upload', formData)).rejects.toThrow('Upload failed')
  })
})

describe('ApiClient - getBlob', () => {
  it('returns blob on success', async () => {
    localStorage.setItem('edl_token', mockToken)
    const fakeBlob = new Blob(['test data'])
    vi.mocked(fetch).mockResolvedValue({
      ok: true, blob: () => Promise.resolve(fakeBlob),
    } as Response)
    const result = await api.getBlob('/file/1')
    expect(result).toBe(fakeBlob)
  })

  it('throws on error', async () => {
    localStorage.setItem('edl_token', mockToken)
    vi.mocked(fetch).mockResolvedValue({
      ok: false, status: 404,
    } as Response)
    await expect(api.getBlob('/file/1')).rejects.toThrow('Error al descargar archivo')
  })
})
