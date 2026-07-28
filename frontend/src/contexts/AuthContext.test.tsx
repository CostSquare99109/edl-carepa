import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

// Mock auth API
vi.mock('../lib/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    perfil: vi.fn(),
    menu: vi.fn(),
    cambiarRol: vi.fn(),
  },
}))

// Mock api
vi.mock('../lib/api', () => ({
  api: {
    fetchCsrfToken: vi.fn().mockResolvedValue(null),
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import { authApi } from '../lib/auth'
const mockAuthApi = vi.mocked(authApi)

// Test component that uses the auth context
function TestConsumer() {
  const { usuario, token, rolActivo, loading, login, logout, cambiarRol } = useAuth()
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="usuario">{usuario?.primer_nombre ?? 'null'}</span>
      <span data-testid="rol">{rolActivo ?? 'null'}</span>
      <button onClick={() => login('admin', '12345678')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => cambiarRol('evaluador')}>Cambiar Rol</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Reset localStorage mock
  localStorage.clear()
})

describe('AuthContext', () => {
  describe('estado inicial', () => {
    it('token es null cuando no hay sesion', () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
      expect(screen.getByTestId('token')).toHaveTextContent('null')
    })

    it('usuario es null cuando no hay sesion', () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
      expect(screen.getByTestId('usuario')).toHaveTextContent('null')
    })
  })

  describe('login', () => {
    it('login exitoso guarda token y usuario', async () => {
      mockAuthApi.login.mockResolvedValue([
        { codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 },
      ])
      mockAuthApi.perfil.mockResolvedValue({
        usuario: {
          id: 1,
          documento: 'admin',
          primer_nombre: 'Admin',
          primer_apellido: 'Principal',
          email: 'admin@test.com',
          estado: 'activo',
          tipo_documento: 'CC',
          entidad_id: 1,
          dependencia_id: 1,
        },
        roles: [{ codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 }],
      })
      mockAuthApi.menu.mockResolvedValue([])

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      expect(screen.getByTestId('token')).not.toHaveTextContent('null')
      expect(screen.getByTestId('usuario')).toHaveTextContent('Admin')
    })

    it('login fallido no guarda token', async () => {
      mockAuthApi.login.mockRejectedValue(new Error('Credenciales invalidas'))

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      expect(screen.getByTestId('token')).toHaveTextContent('null')
    })
  })

  describe('logout', () => {
    it('logout limpia token y usuario', async () => {
      // First login
      mockAuthApi.login.mockResolvedValue([
        { codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 },
      ])
      mockAuthApi.perfil.mockResolvedValue({
        usuario: {
          id: 1, documento: 'admin', primer_nombre: 'Admin',
          primer_apellido: 'P', email: 'a@t.com', estado: 'activo',
          tipo_documento: 'CC', entidad_id: 1, dependencia_id: 1,
        },
        roles: [{ codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 }],
      })
      mockAuthApi.menu.mockResolvedValue([])
      mockAuthApi.logout.mockResolvedValue(null)

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      expect(screen.getByTestId('token')).not.toHaveTextContent('null')

      await act(async () => {
        screen.getByText('Logout').click()
      })

      expect(screen.getByTestId('token')).toHaveTextContent('null')
      expect(screen.getByTestId('usuario')).toHaveTextContent('null')
    })
  })

  describe('cambiarRol', () => {
    it('cambiarRol actualiza el rol activo', async () => {
      mockAuthApi.login.mockResolvedValue([
        { codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 },
        { codigo: 'jefe', nombre: 'Jefe', entidad_id: 1 },
      ])
      mockAuthApi.perfil.mockResolvedValue({
        usuario: {
          id: 1, documento: 'admin', primer_nombre: 'Admin',
          primer_apellido: 'P', email: 'a@t.com', estado: 'activo',
          tipo_documento: 'CC', entidad_id: 1, dependencia_id: 1,
        },
        roles: [
          { codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 },
          { codigo: 'jefe', nombre: 'Jefe', entidad_id: 1 },
        ],
      })
      mockAuthApi.menu.mockResolvedValue([])
      mockAuthApi.cambiarRol.mockResolvedValue({
        rol_activo: 'jefe',
        token: 'new-token',
        csrf_token: 'csrf',
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Login first
      await act(async () => {
        screen.getByText('Login').click()
      })

      // Change role
      await act(async () => {
        screen.getByText('Cambiar Rol').click()
      })

      expect(screen.getByTestId('rol')).toHaveTextContent('jefe')
    })
  })

  describe('persistencia', () => {
    it('restaura token de localStorage al montar', () => {
      // Simulate existing session in localStorage
      localStorage.setItem('edl_token', 'stored-token')
      localStorage.setItem('edl_user', JSON.stringify({
        id: 1, documento: 'admin', primer_nombre: 'Admin',
        primer_apellido: 'P', email: 'a@t.com', estado: 'activo',
        tipo_documento: 'CC', entidad_id: 1, dependencia_id: 1,
      }))

      mockAuthApi.perfil.mockResolvedValue({
        usuario: {
          id: 1, documento: 'admin', primer_nombre: 'Admin',
          primer_apellido: 'P', email: 'a@t.com', estado: 'activo',
          tipo_documento: 'CC', entidad_id: 1, dependencia_id: 1,
        },
        roles: [{ codigo: 'evaluador', nombre: 'Evaluador', entidad_id: 1 }],
      })
      mockAuthApi.menu.mockResolvedValue([])

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
    })
  })
})
