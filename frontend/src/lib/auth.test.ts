import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './auth'
import { api } from './api'

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authApi', () => {
  it('login calls api.post with credentials', async () => {
    vi.mocked(api.post).mockResolvedValue({ token: 'jwt', usuario: { id: 1, documento: 'admin' } })
    const result = await authApi.login({ documento: 'admin', password: '12345678' })
    expect(api.post).toHaveBeenCalledWith('/auth/login', { documento: 'admin', password: '12345678' })
    expect(result).toEqual({ token: 'jwt', usuario: { id: 1, documento: 'admin' } })
  })

  it('logout calls api.post without body', async () => {
    vi.mocked(api.post).mockResolvedValue(undefined)
    await authApi.logout()
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('perfil calls api.get', async () => {
    const mockPerfil = { usuario: { id: 1 }, roles: [{ codigo: 'admin', nombre: 'Admin' }] }
    vi.mocked(api.get).mockResolvedValue(mockPerfil)
    const result = await authApi.perfil()
    expect(api.get).toHaveBeenCalledWith('/auth/perfil')
    expect(result).toEqual(mockPerfil)
  })

  it('menu calls api.get', async () => {
    const mockMenu = [{ label: 'Dashboard', icon: 'home', ruta: '/', permisos: [] }]
    vi.mocked(api.get).mockResolvedValue(mockMenu)
    const result = await authApi.menu()
    expect(api.get).toHaveBeenCalledWith('/menu')
    expect(result).toEqual(mockMenu)
  })

  it('cambiarPassword calls api.put with passwords', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)
    await authApi.cambiarPassword({ password_actual: 'old', password_nueva: 'new' })
    expect(api.put).toHaveBeenCalledWith('/auth/password', { password_actual: 'old', password_nueva: 'new' })
  })

  it('cambiarRol calls api.put with rol_codigo', async () => {
    vi.mocked(api.put).mockResolvedValue({ rol_activo: 'evaluador', token: 'new-jwt' })
    const result = await authApi.cambiarRol('evaluador')
    expect(api.put).toHaveBeenCalledWith('/auth/rol', { rol_codigo: 'evaluador' })
    expect(result).toEqual({ rol_activo: 'evaluador', token: 'new-jwt' })
  })
})
