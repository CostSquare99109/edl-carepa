import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function CambioForzadoPassword() {
 const navigate = useNavigate()
 const { logout } = useAuth()
 const [password, setPassword] = useState('')
 const [password2, setPassword2] = useState('')
 const [mostrar, setMostrar] = useState(false)
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  if (password.length < 8) {
   setError('La contraseña debe tener minimo 8 caracteres')
   return
  }
  if (password !== password2) {
   setError('Las contraseñas no coinciden')
   return
  }
  setLoading(true)
  try {
   await api.put('/auth/forzar-password', { password_nueva: password })
   alert('Contrasena actualizada exitosamente. Inicie sesion con su nueva contraseña.')
   logout()
   navigate('/login')
  } catch (err: any) {
   setError(err.message || 'Error al actualizar contraseña')
  } finally {
   setLoading(false)
  }
 }

 return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
   <div className="w-full max-w-md">
    <div className="edl-card">
     <div className="flex justify-center mb-4">
      <span className="material-icons text-5xl text-inst-azul">lock_reset</span>
     </div>
     <h1 className="text-lg font-heading font-bold text-inst-azul text-center mb-1">
      Cambio de contraseña requerido
     </h1>
     <p className="text-sm text-inst-texto-claro text-center mb-6">
      Por seguridad, debe cambiar su contraseña antes de continuar.
     </p>
     <div className="edl-divider" />
     <div className="edl-divider-accent" />
     {error && (
      <div className="mt-4 p-3 bg-red-50 border border-inst-rojo/20 rounded-lg text-sm text-inst-rojo flex items-center gap-2">
       <span className="material-icons text-base">error</span>
       {error}
      </div>
     )}
     <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
       <label className="block text-sm font-medium text-inst-texto mb-1">Nueva contraseña</label>
       <div className="relative">
        <input type={mostrar ? 'text' : 'password'} value={password}
         onChange={e => setPassword(e.target.value)}
         className="edl-input pr-10" placeholder="Minimo 8 caracteres" required minLength={8} />
        <button type="button" onClick={() => setMostrar(!mostrar)}
         className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1" tabIndex={-1}>
         <span className="material-icons text-xl">{mostrar ? 'visibility' : 'visibility_off'}</span>
        </button>
       </div>
      </div>
      <div>
       <label className="block text-sm font-medium text-inst-texto mb-1">Confirmar nueva contraseña</label>
       <input type="password" value={password2}
        onChange={e => setPassword2(e.target.value)}
        className="edl-input" placeholder="Repita la nueva contraseña" required minLength={8} />
      </div>
      <button type="submit" disabled={loading}
       className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
       {loading ? (
        <><span className="material-icons text-base animate-spin">sync</span>Actualizando...</>
       ) : (
        <><span className="material-icons text-base">check_circle</span>Cambiar contraseña</>
       )}
      </button>
     </form>
    </div>
    <p className="text-center text-xs text-inst-texto-claro mt-6">
     Alcaldia de Carepa -- Sistema EDL-CAREPA
    </p>
   </div>
  </div>
 )
}
