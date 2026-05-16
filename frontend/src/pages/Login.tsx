import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro civil' },
  { value: 'NIT', label: 'NIT' },
]

type Tab = 'login' | 'registro' | 'recuperar'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [fadingError, setFadingError] = useState(false)
 const [fadingSuccess, setFadingSuccess] = useState(false)

 // Auto-ocultar errores después de 10 segundos con fade
 const showError = useCallback((msg: string) => {
 setError(msg)
 setFadingError(false)
 }, [])
 const hideError = useCallback(() => {
 setFadingError(true)
 setTimeout(() => { setError(''); setFadingError(false) }, 500)
 }, [])

 useEffect(() => {
 if (!error) return
 const t = setTimeout(hideError, 10000)
 return () => clearTimeout(t)
 }, [error, hideError])

 const showSuccess = useCallback((msg: string) => {
 setSuccess(msg)
 setFadingSuccess(false)
 }, [])
 const hideSuccess = useCallback(() => {
 setFadingSuccess(true)
 setTimeout(() => { setSuccess(''); setFadingSuccess(false) }, 500)
 }, [])

 useEffect(() => {
 if (!success) return
 const t = setTimeout(hideSuccess, 10000)
 return () => clearTimeout(t)
 }, [success, hideSuccess])

  // Login
  const [documento, setDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('CC')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Registro
  const [regDocumento, setRegDocumento] = useState('')
  const [regTipoDoc, setRegTipoDoc] = useState('CC')
  const [regNombres, setRegNombres] = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')
  const [regTelefono, setRegTelefono] = useState('')
  const [regCargo, setRegCargo] = useState('')
  const [regMostrarPass, setRegMostrarPass] = useState(false)

  // Recuperar
  const [recEmail, setRecEmail] = useState('')
  const [recToken, setRecToken] = useState('')
  const [recPassword, setRecPassword] = useState('')
  const [recPassword2, setRecPassword2] = useState('')
  const [recMostrarPass, setRecMostrarPass] = useState(false)
  const [recPaso, setRecPaso] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)

 function switchTab(t: Tab) {
 setTab(t)
 setError('')
 setSuccess('')
 setFadingError(false)
 setFadingSuccess(false)
 }

  // --- LOGIN ---
  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const roles = await login(documento, tipoDocumento, password)
      if (roles.length > 1) {
        navigate('/seleccionar-rol', { replace: true })
      } else if (roles.length === 1 && ['admin', 'admin_cnsc', 'admin_entidad'].includes(roles[0].codigo)) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Usuario o contraseña incorrectos')
    }
  }

  // --- REGISTRO ---
  async function handleRegistro(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (regPassword !== regPassword2) {
      showError('Las contraseñas no coinciden')
      return
    }
    if (regPassword.length < 8) {
      showError('La contraseña debe tener mínimo 8 caracteres')
      return
    }

    setSaving(true)
    try {
      await api.post('/auth/registro', {
        documento: regDocumento,
        tipo_documento: regTipoDoc,
        nombres: regNombres,
        apellidos: regApellidos,
        email: regEmail,
        password: regPassword,
        telefono: regTelefono || undefined,
        cargo: regCargo || undefined,
      })
      showSuccess('Cuenta creada exitosamente. Ahora puede iniciar sesión.')
      setTab('login')
      setDocumento(regDocumento)
      setTipoDocumento(regTipoDoc)
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSaving(false)
    }
  }

  // --- RECUPERAR ---
  async function handleRecuperar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (recPaso === 1) {
        await api.post('/auth/recuperar', { email: recEmail })
        showSuccess('Se envió un enlace de recuperación. Ingrese el token recibido.')
        setRecPaso(2)
      } else {
        if (recPassword !== recPassword2) {
          showError('Las contraseñas no coinciden')
          return
        }
        if (recPassword.length < 8) {
          showError('La contraseña debe tener mínimo 8 caracteres')
          return
        }
        await api.put(`/auth/recuperar/${recToken}`, { password: recPassword })
        showSuccess('Contraseña actualizada. Puede iniciar sesión.')
        setTab('login')
        setRecPaso(1)
        setRecEmail('')
        setRecToken('')
        setRecPassword('')
        setRecPassword2('')
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error en recuperación')
    } finally {
      setSaving(false)
    }
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button"
      onClick={() => switchTab(t)}
      className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        tab === t
          ? 'border-inst-azul text-inst-azul'
          : 'border-transparent text-inst-texto-claro hover:text-inst-texto hover:border-inst-borde'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="edl-card">
          {/* Logo CNSC */}
          <div className="flex justify-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="CNSC"
              className="h-20 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                const parent = (e.target as HTMLImageElement).parentElement
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const span = document.createElement('span')
                  span.className = 'escudo-fallback text-3xl font-heading font-bold text-inst-azul'
                  span.textContent = 'CNSC'
                  parent.appendChild(span)
                }
              }}
            />
          </div>

          {/* Título */}
          <h1 className="text-lg font-heading font-bold text-inst-azul text-center mb-1">
            Evaluación del Desempeño Laboral
          </h1>
          <p className="text-sm text-inst-texto-claro text-center mb-4">
            Comisión Nacional del Servicio Civil
          </p>

          {/* Doble línea */}
          <div className="edl-divider" />
          <div className="edl-divider-accent" />

          {/* Pestañas */}
          <div className="flex border-b border-inst-borde mb-4">
            {tabBtn('login', 'Iniciar Sesión')}
            {tabBtn('registro', 'Registrarse')}
            {tabBtn('recuperar', 'Recuperar')}
          </div>

 {/* Alertas */}
 {error && (
 <div
 className={`mb-4 p-3 bg-red-50 border border-inst-rojo/20 rounded-lg text-sm text-inst-rojo flex items-center gap-2 transition-opacity duration-500 ${fadingError ? 'opacity-0' : 'opacity-100'}`}
 >
 <span className="material-icons text-base">error</span>
 <span className="flex-1">{error}</span>
 <button type="button" onClick={hideError} className="p-0.5 rounded hover:bg-inst-rojo/10 text-inst-rojo/60 hover:text-inst-rojo" aria-label="Cerrar">
 <span className="material-icons text-sm">close</span>
 </button>
 </div>
 )}
 {success && (
 <div
 className={`mb-4 p-3 bg-green-50 border border-green-300/40 rounded-lg text-sm text-inst-verde flex items-center gap-2 transition-opacity duration-500 ${fadingSuccess ? 'opacity-0' : 'opacity-100'}`}
 >
 <span className="material-icons text-base">check_circle</span>
 <span className="flex-1">{success}</span>
 <button type="button" onClick={hideSuccess} className="p-0.5 rounded hover:bg-inst-verde/10 text-inst-verde/60 hover:text-inst-verde" aria-label="Cerrar">
 <span className="material-icons text-sm">close</span>
 </button>
 </div>
 )}

          {/* ====== LOGIN ====== */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">
                  Tipo de documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="edl-input"
                >
                  {TIPOS_DOCUMENTO.map((td) => (
                    <option key={td.value} value={td.value}>{td.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">
                  Número de documento
                </label>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="edl-input"
                  placeholder="Número de cédula"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-inst-texto mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="edl-input pr-10"
                    placeholder="Ingrese su contraseña"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
                    tabIndex={-1}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-icons text-xl">
                      {mostrarPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-icons text-base animate-spin">refresh</span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">login</span>
                    Ingresar
                  </>
                )}
              </button>

              <p className="text-center text-xs text-inst-texto-claro">
                ¿No tiene cuenta?{' '}
                <button type="button" onClick={() => switchTab('registro')} className="text-inst-azul hover:underline font-medium">
                  Regístrese aquí
                </button>
              </p>
              <p className="text-center text-xs text-inst-texto-claro">
                ¿Olvidó su contraseña?{' '}
                <button type="button" onClick={() => switchTab('recuperar')} className="text-inst-azul hover:underline font-medium">
                  Recuperar contraseña
                </button>
              </p>
            </form>
          )}

          {/* ====== REGISTRO ====== */}
          {tab === 'registro' && (
            <form onSubmit={handleRegistro} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Tipo documento</label>
                  <select value={regTipoDoc} onChange={e => setRegTipoDoc(e.target.value)} className="edl-input">
                    {TIPOS_DOCUMENTO.map(td => (
                      <option key={td.value} value={td.value}>{td.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Número</label>
                  <input type="text" value={regDocumento} onChange={e => setRegDocumento(e.target.value)} className="edl-input" placeholder="Cédula" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Nombres</label>
                  <input type="text" value={regNombres} onChange={e => setRegNombres(e.target.value)} className="edl-input" placeholder="Juan" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Apellidos</label>
                  <input type="text" value={regApellidos} onChange={e => setRegApellidos(e.target.value)} className="edl-input" placeholder="Pérez" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-inst-texto mb-1">Correo electrónico</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="edl-input" placeholder="correo@ejemplo.com" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Teléfono</label>
                  <input type="tel" value={regTelefono} onChange={e => setRegTelefono(e.target.value)} className="edl-input" placeholder="3001234567" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto mb-1">Cargo</label>
                  <input type="text" value={regCargo} onChange={e => setRegCargo(e.target.value)} className="edl-input" placeholder="Asesor" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-inst-texto mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={regMostrarPass ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="edl-input pr-10"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setRegMostrarPass(!regMostrarPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
                    tabIndex={-1}
                  >
                    <span className="material-icons text-xl">{regMostrarPass ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-inst-texto mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={regPassword2}
                  onChange={e => setRegPassword2(e.target.value)}
                  className="edl-input"
                  placeholder="Repita la contraseña"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="material-icons text-base animate-spin">sync</span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">person_add</span>
                    Crear cuenta
                  </>
                )}
              </button>

              <p className="text-center text-xs text-inst-texto-claro">
                ¿Ya tiene cuenta?{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-inst-azul hover:underline font-medium">
                  Inicie sesión
                </button>
              </p>
            </form>
          )}

          {/* ====== RECUPERAR CONTRASEÑA ====== */}
          {tab === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="space-y-4">
              {recPaso === 1 ? (
                <>
                  <div className="bg-inst-gris rounded-lg p-3 text-sm text-inst-texto-claro flex items-start gap-2">
                    <span className="material-icons text-base mt-0.5">info</span>
                    <p>Ingrese el correo electrónico asociado a su cuenta. Recibirá un token para restablecer su contraseña.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-inst-texto mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={recEmail}
                      onChange={(e) => setRecEmail(e.target.value)}
                      className="edl-input"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="material-icons text-base animate-spin">sync</span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-base">mail</span>
                        Enviar token de recuperación
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-300/40 rounded-lg p-3 text-sm text-inst-verde flex items-start gap-2">
                    <span className="material-icons text-base mt-0.5">mark_email_read</span>
                    <p>Token enviado a <strong>{recEmail}</strong>. Revíselo e ingréselo abajo con su nueva contraseña.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-inst-texto mb-1">
                      Token de recuperación
                    </label>
                    <input
                      type="text"
                      value={recToken}
                      onChange={(e) => setRecToken(e.target.value)}
                      className="edl-input font-mono text-xs"
                      placeholder="Pegue el token recibido"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-inst-texto mb-1">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={recMostrarPass ? 'text' : 'password'}
                        value={recPassword}
                        onChange={(e) => setRecPassword(e.target.value)}
                        className="edl-input pr-10"
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setRecMostrarPass(!recMostrarPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
                        tabIndex={-1}
                      >
                        <span className="material-icons text-xl">{recMostrarPass ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-inst-texto mb-1">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={recPassword2}
                      onChange={(e) => setRecPassword2(e.target.value)}
                      className="edl-input"
                      placeholder="Repita la nueva contraseña"
                      required
                      minLength={8}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="material-icons text-base animate-spin">sync</span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-base">lock_reset</span>
                        Cambiar contraseña
                      </>
                    )}
                  </button>
                </>
              )}

              <p className="text-center text-xs text-inst-texto-claro">
                ¿Recuerda su contraseña?{' '}
                <button type="button" onClick={() => { switchTab('login'); setRecPaso(1) }} className="text-inst-azul hover:underline font-medium">
                  Inicie sesión
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Pie - SIN correo de soporte */}
        <p className="text-center text-xs text-inst-texto-claro mt-6">
          Comisión Nacional del Servicio Civil — Sistema EDL-CNSC
        </p>
      </div>
    </div>
  )
}
