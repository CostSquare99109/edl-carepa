import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Button, Input, Alert } from '../components/ui'
import { toast } from 'sonner'

type Tab = 'login' | 'recuperar'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const [documento, setDocumento] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [recEmail, setRecEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setError('')
    try {
      const roles = await login(documento, password)
      if (localStorage.getItem('edl_forzar_cambio') === '1') {
        localStorage.removeItem('edl_forzar_cambio')
        navigate('/cambio-forzado-password', { replace: true })
        return
      }
      if (roles.length > 1) {
        navigate('/seleccionar-rol', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      setError('Usuario o contraseña incorrectos')
    }
  }

  async function handleRecuperar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/auth/recuperar', { email: recEmail })
      toast.success('Código enviado. Revisa tu correo.')
      navigate(`/verificar-codigo?email=${encodeURIComponent(recEmail)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error en recuperación')
    } finally {
      setSaving(false)
    }
  }

  const tabInfo: Record<Tab, { titulo: string; subtitulo: string }> = {
    login: { titulo: 'Evaluación del Desempeño Laboral', subtitulo: 'Alcaldía de Carepa' },
    recuperar: { titulo: 'Recuperar contraseña', subtitulo: 'Restablezca el acceso a su cuenta' },
  }
  const { titulo, subtitulo } = tabInfo[tab]

  return (
    <div className="min-h-screen bg-inst-gris flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="edl-card animate-fadeIn">
          <div className="flex justify-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Escudo de Carepa"
              className="h-20 w-auto"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
                const parent = (e.target as HTMLImageElement).parentElement
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const span = document.createElement('span')
                  span.className = 'escudo-fallback text-3xl font-heading font-bold text-inst-azul-osc'
                  span.textContent = 'CAREPA'
                  parent.appendChild(span)
                }
              }}
            />
          </div>

          <h1 className="text-lg font-heading font-bold text-inst-azul-osc text-center mb-1">
            {titulo}
          </h1>
          <p className="text-sm text-inst-texto-claro text-center mb-4">{subtitulo}</p>

          <div className="edl-divider" />
          <div className="edl-divider-accent" />

          {error ? (
            <div className="mb-4">
              <Alert tone="danger" onDismiss={() => setError('')}>
                {error}
              </Alert>
            </div>
          ) : null}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <h2 className="text-base font-heading font-semibold text-inst-azul-osc text-center mb-2">
                Iniciar Sesión
              </h2>

              <Input
                label="Nombre de usuario"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingrese su nombre de usuario"
                autoComplete="username"
                error={submitted && !documento ? 'Campo obligatorio' : undefined}
              />

              <Input
                label="Contraseña"
                required
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    tabIndex={-1}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="hover:text-inst-texto transition-colors"
                  >
                    <span className="material-icons text-xl align-middle">
                      {mostrarPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                }
                error={submitted && !password ? 'Campo obligatorio' : undefined}
              />

              <Button type="submit" variant="primary" fullWidth loading={loading} iconLeft={<span className="material-icons text-base">login</span>}>
                Acceder
              </Button>

              <p className="text-center text-xs text-inst-texto-claro">
                ¿Olvidó su contraseña?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('recuperar')}
                  className="text-inst-azul-osc hover:underline font-medium"
                >
                  Recuperar contraseña
                </button>
              </p>
            </form>
          )}

          {tab === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <Alert tone="info" title="Información">
                Ingrese el correo electrónico asociado a su cuenta. Recibirá un código de 6 caracteres para restablecer su contraseña.
              </Alert>

              <Input
                label="Correo electrónico"
                type="email"
                required
                value={recEmail}
                onChange={(e) => setRecEmail(e.target.value)}
                placeholder="Ingrese su correo"
              />

              <Button type="submit" variant="primary" fullWidth loading={saving} iconLeft={<span className="material-icons text-base">mail</span>}>
                Enviar código de recuperación
              </Button>

              <p className="text-center text-xs text-inst-texto-claro">
                ¿Recuerda su contraseña?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-inst-azul-osc hover:underline font-medium"
                >
                  Iniciar sesión
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-inst-texto-claro mt-6">
          EDL Carepa — Alcaldía de Carepa
        </p>
      </div>
    </div>
  )
}
