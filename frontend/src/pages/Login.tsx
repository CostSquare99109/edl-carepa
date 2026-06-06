import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

type Tab = 'login' | 'recuperar'

export default function Login() {
 const { login, loading } = useAuth()
 const navigate = useNavigate()
 const [tab, setTab] = useState<Tab>('login')
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [fadingError, setFadingError] = useState(false)
 const [fadingSuccess, setFadingSuccess] = useState(false)

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

 const [documento, setDocumento] = useState('')
 const [password, setPassword] = useState('')
 const [mostrarPassword, setMostrarPassword] = useState(false)

 const [recEmail, setRecEmail] = useState('')
 const [saving, setSaving] = useState(false)

 function switchTab(t: Tab) {
 setTab(t)
 setError('')
 setSuccess('')
 setFadingError(false)
 setFadingSuccess(false)
 }

 async function handleLogin(e: FormEvent) {
 e.preventDefault()
 setError('')
 try {
 const roles = await login(documento, password)
 if (roles.length > 1) {
 navigate('/seleccionar-rol', { replace: true })
 } else if (roles.length === 1 && ['admin', 'admin_carepa', 'admin_entidad', 'jefe_personal'].includes(roles[0].codigo)) {
 navigate('/admin', { replace: true })
 } else {
 navigate('/', { replace: true })
 }
 } catch {
 showError('Usuario o contrasena incorrectos')
 }
 }

 async function handleRecuperar(e: FormEvent) {
 e.preventDefault()
 setError('')
 setSuccess('')
 setSaving(true)

 try {
 await api.post('/auth/recuperar', { email: recEmail })
 navigate(`/verificar-codigo?email=${encodeURIComponent(recEmail)}`)
 } catch (err: unknown) {
 showError(err instanceof Error ? err.message : 'Error en recuperacion')
 } finally {
 setSaving(false)
 }
 }

 const tabInfo: Record<Tab, { titulo: string; subtitulo: string }> = {
 login: { titulo: 'Evaluacion del Desempeno Laboral', subtitulo: 'Alcaldia de Carepa' },
 recuperar: { titulo: 'Recuperar contrasena', subtitulo: 'Restablezca el acceso a su cuenta' },
 }
 const { titulo, subtitulo } = tabInfo[tab]

 return (
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
 <div className="w-full max-w-md">
 <div className="edl-card">
 <div className="flex justify-center mb-6">
 <img
 src={`${import.meta.env.BASE_URL}escudo.png`}
 alt="Carepa"
 className="h-20 w-auto"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none'
 const parent = (e.target as HTMLImageElement).parentElement
 if (parent && !parent.querySelector('.escudo-fallback')) {
 const span = document.createElement('span')
 span.className = 'escudo-fallback text-3xl font-heading font-bold text-inst-azul'
 span.textContent = 'CAREPA'
 parent.appendChild(span)
 }
 }}
 />
 </div>

 <h1 className="text-lg font-heading font-bold text-inst-azul text-center mb-1">
 {titulo}
 </h1>
 <p className="text-sm text-inst-texto-claro text-center mb-4">
 {subtitulo}
 </p>

 <div className="edl-divider" />
 <div className="edl-divider-accent" />

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

 {tab === 'login' && (
 <form onSubmit={handleLogin} className="space-y-4">
 <h2 className="text-base font-heading font-semibold text-inst-azul text-center mb-2">Iniciar Sesion</h2>

 <div>
 <label className="block text-sm font-medium text-inst-texto mb-1">
 Numero de documento
 </label>
 <input
 type="text"
 value={documento}
 onChange={(e) => setDocumento(e.target.value)}
 className="edl-input"
 placeholder="Ingrese su Documento"
 required
 autoComplete="username"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-inst-texto mb-1">
 Contrasena
 </label>
 <div className="relative">
 <input
 type={mostrarPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="edl-input pr-10"
 placeholder="Ingrese su contrasena"
 required
 autoComplete="current-password"
 />
 <button
 type="button"
 onClick={() => setMostrarPassword(!mostrarPassword)}
 className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
 tabIndex={-1}
 aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
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
 Olvido su contrasena?{' '}
 <button type="button" onClick={() => switchTab('recuperar')} className="text-inst-azul hover:underline font-medium">
 Recuperar contrasena
 </button>
 </p>
 </form>
 )}

 {tab === 'recuperar' && (
 <form onSubmit={handleRecuperar} className="space-y-4">
 <div className="bg-inst-gris rounded-lg p-3 text-sm text-inst-texto-claro flex items-start gap-2">
 <span className="material-icons text-base mt-0.5">info</span>
 <p>Ingrese el correo electronico asociado a su cuenta. Recibira un codigo de 6 caracteres para restablecer su contrasena.</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-inst-texto mb-1">
 Correo electronico
 </label>
 <input
 type="email"
 value={recEmail}
 onChange={(e) => setRecEmail(e.target.value)}
 className="edl-input"
 placeholder="Ingrese su correo"
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
 Enviando codigo...
 </>
 ) : (
 <>
 <span className="material-icons text-base">mail</span>
 Enviar codigo de recuperacion
 </>
 )}
 </button>

 <p className="text-center text-xs text-inst-texto-claro">
 Recuerda su contrasena?{' '}
 <button type="button" onClick={() => switchTab('login')} className="text-inst-azul hover:underline font-medium">
 Inicie sesion
 </button>
 </p>
 </form>
 )}
 </div>

 <p className="text-center text-xs text-inst-texto-claro mt-6">
 Alcaldia de Carepa -- Sistema EDL-CAREPA
 </p>
 </div>
 </div>
 )
}
