import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Card, Button, Input, Alert, Badge, Modal, SkeletonText } from '../components/ui'
import { toast } from 'sonner'
import CargoManualCard from '../components/CargoManualCard'

interface UsuarioPerfil {
 id: number
 documento: string
 tipo_documento: string
 genero: string | null
 primer_nombre: string
 segundo_nombre: string | null
 primer_apellido: string
 segundo_apellido: string | null
 email: string
 email_confirmado: number
 telefono1: string | null
 telefono2: string | null
 estado: string
 dependencia_id: number | null
 cargo: string | null
 nivel: string | null
 naturaleza: string | null
 tipo_nombramiento: string | null
 denominacion_empleo: string | null
 proposito_principal_empleo: string | null
 en_periodo_prueba: number
 es_contratista: number
 ultimo_acceso: string | null
}

interface PerfilCompleto {
 usuario: UsuarioPerfil
 roles: { codigo: string; nombre: string }[]
 permisos: string[]
}

const NIVEL_LABEL: Record<string, string> = {
 directivo: 'Directivo',
 asesor: 'Asesor',
 profesional: 'Profesional',
 tecnico: 'Técnico',
 asistencial: 'Asistencial',
}

const ROL_TONE: Record<string, 'danger' | 'success' | 'info' | 'warning'> = {
 admin: 'danger',
 evaluador: 'success',
 evaluado: 'info',
 jefe_entidad: 'warning',
 jefe_dependencia: 'warning',
}

export default function Perfil() {
 const { usuario, logout } = useAuth()
 const [perfil, setPerfil] = useState<PerfilCompleto | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 const [editEmail, setEditEmail] = useState('')
 const [editTel1, setEditTel1] = useState('')
 const [editTel2, setEditTel2] = useState('')
 const [guardandoPerfil, setGuardandoPerfil] = useState(false)
 const [perfilDirty, setPerfilDirty] = useState(false)

 const [modalPassword, setModalPassword] = useState(false)
 const [pwdActual, setPwdActual] = useState('')
 const [pwdNueva, setPwdNueva] = useState('')
 const [pwdConfirmar, setPwdConfirmar] = useState('')
 const [guardandoPwd, setGuardandoPwd] = useState(false)
 const [pwdError, setPwdError] = useState('')

 async function cargar() {
 setLoading(true)
 setError('')
 try {
 const data = await api.get<PerfilCompleto>('/auth/perfil')
 setPerfil(data)
 setEditEmail(data.usuario.email || '')
 setEditTel1(data.usuario.telefono1 || '')
 setEditTel2(data.usuario.telefono2 || '')
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Error al cargar perfil')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => { cargar() }, [])

 const nombreCompleto = perfil
 ? [perfil.usuario.primer_nombre, perfil.usuario.segundo_nombre, perfil.usuario.primer_apellido, perfil.usuario.segundo_apellido]
 .filter(Boolean).join(' ')
 : ''

 const iniciales = perfil
 ? `${perfil.usuario.primer_nombre?.[0] ?? ''}${perfil.usuario.primer_apellido?.[0] ?? ''}`.toUpperCase()
 : '?'

 async function guardarPerfil() {
 if (!perfil) return
 if (!editEmail.trim()) {
 toast.error('El correo electrónico es obligatorio')
 return
 }
 setGuardandoPerfil(true)
 try {
 await api.put('/auth/perfil', {
 email: editEmail.trim(),
 telefono1: editTel1.trim() || null,
 telefono2: editTel2.trim() || null,
 })
 toast.success('Perfil actualizado correctamente')
 setPerfilDirty(false)
 await cargar()
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al actualizar perfil')
 } finally {
 setGuardandoPerfil(false)
 }
 }

 function abrirModalPassword() {
 setPwdActual('')
 setPwdNueva('')
 setPwdConfirmar('')
 setPwdError('')
 setModalPassword(true)
 }

 async function cambiarPassword() {
 setPwdError('')
 if (!pwdActual || !pwdNueva || !pwdConfirmar) {
 setPwdError('Todos los campos son obligatorios')
 return
 }
 if (pwdNueva.length < 8) {
 setPwdError('La nueva contraseña debe tener al menos 8 caracteres')
 return
 }
 if (pwdNueva !== pwdConfirmar) {
 setPwdError('La nueva contraseña y su confirmación no coinciden')
 return
 }
 if (pwdActual === pwdNueva) {
 setPwdError('La nueva contraseña debe ser diferente a la actual')
 return
 }
 setGuardandoPwd(true)
 try {
 await api.put('/auth/password', {
 password_actual: pwdActual,
 password_nueva: pwdNueva,
 })
 toast.success('Contraseña actualizada. Por seguridad, vuelve a iniciar sesión.')
 setModalPassword(false)
 setTimeout(() => logout(), 1500)
 } catch (e) {
 setPwdError(e instanceof Error ? e.message : 'Error al cambiar contraseña')
 } finally {
 setGuardandoPwd(false)
 }
 }

 if (loading) {
 return (
 <div className="space-y-6">
 <SkeletonText lines={2} />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <SkeletonText lines={8} />
 <SkeletonText lines={6} />
 <SkeletonText lines={4} />
 </div>
 </div>
 )
 }

 if (error || !perfil) {
 return (
 <div className="p-4 lg:p-6">
 <Alert tone="danger" title="Error al cargar el perfil">
 {error || 'No se pudo cargar el perfil.'}
 <Button variant="outline" size="sm" className="mt-3" onClick={cargar}>
 Reintentar
 </Button>
 </Alert>
 </div>
 )
 }

 return (
 <div className="space-y-6 p-4 lg:p-6">
 {/* Header con avatar */}
 <div className="animate-fadeIn flex items-center gap-4 flex-wrap">
 <div className="w-20 h-20 rounded-full bg-inst-azul-osc text-white flex items-center justify-center font-heading font-bold text-2xl flex-shrink-0">
 {iniciales}
 </div>
 <div>
 <h1 className="text-2xl font-heading font-bold text-inst-azul-osc">{nombreCompleto}</h1>
 <p className="text-sm text-inst-texto-claro">
  {perfil.usuario.denominacion_empleo || perfil.usuario.cargo || 'Sin cargo asignado'} · Documento {perfil.usuario.documento}
 </p>
 <div className="flex gap-1.5 mt-2 flex-wrap">
 {perfil.roles.map(r => (
 <Badge key={r.codigo} tone={ROL_TONE[r.codigo] ?? 'neutral'} dot>
 {r.nombre}
 </Badge>
 ))}
 </div>
 </div>
 </div>

 {error ? <Alert tone="danger">{error}</Alert> : null}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Card: Datos personales (no editables) */}
 <Card>
 <h3 className="text-sm font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
 <span className="material-icons text-base">person</span>
 Datos personales
 </h3>
 <dl className="space-y-2 text-sm">
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Tipo y documento</dt>
 <dd className="font-medium text-inst-texto">{perfil.usuario.tipo_documento} {perfil.usuario.documento}</dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Género</dt>
 <dd className="font-medium text-inst-texto">
 {perfil.usuario.genero === 'masculino' ? 'Masculino'
 : perfil.usuario.genero === 'femenino' ? 'Femenino'
 : perfil.usuario.genero === 'otro' ? 'Otro'
 : 'Sin especificar'}
 </dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Estado</dt>
 <dd>
 <Badge tone={perfil.usuario.estado === 'activo' ? 'success' : 'neutral'} dot>
 {perfil.usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
 </Badge>
 </dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Último acceso</dt>
 <dd className="text-inst-texto">
 {perfil.usuario.ultimo_acceso
 ? new Date(perfil.usuario.ultimo_acceso).toLocaleString('es-CO')
 : '—'}
 </dd>
 </div>
 </dl>
 </Card>

 {/* Card: Datos laborales (no editables) */}
 <Card>
 <h3 className="text-sm font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
 <span className="material-icons text-base">work</span>
 Datos laborales
 </h3>
 <dl className="space-y-2 text-sm">
  <div>
  <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Denominación del empleo</dt>
  <dd className="font-medium text-inst-texto">{perfil.usuario.denominacion_empleo || perfil.usuario.cargo || '—'}</dd>
  </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Nivel</dt>
 <dd className="font-medium text-inst-texto">
 {perfil.usuario.nivel ? NIVEL_LABEL[perfil.usuario.nivel] || perfil.usuario.nivel : '—'}
 </dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Naturaleza</dt>
 <dd className="font-medium text-inst-texto">{perfil.usuario.naturaleza || '—'}</dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Tipo de nombramiento</dt>
 <dd className="font-medium text-inst-texto">{perfil.usuario.tipo_nombramiento || '—'}</dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">¿Es contratista?</dt>
 <dd>
 <Badge tone={perfil.usuario.es_contratista ? 'warning' : 'neutral'}>
 {perfil.usuario.es_contratista ? 'Sí' : 'No'}
 </Badge>
 </dd>
 </div>
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">¿En periodo de prueba?</dt>
 <dd>
 <Badge tone={perfil.usuario.en_periodo_prueba ? 'info' : 'neutral'}>
 {perfil.usuario.en_periodo_prueba ? 'Sí' : 'No'}
 </Badge>
 </dd>
 </div>
 {perfil.usuario.proposito_principal_empleo ? (
 <div>
 <dt className="text-xs text-inst-texto-claro uppercase tracking-wide">Propósito del empleo</dt>
 <dd className="text-inst-texto">{perfil.usuario.proposito_principal_empleo}</dd>
 </div>
 ) : null}
 </dl>
 </Card>

 {/* Card: Mi Cargo del Manual (Decreto 159/2024) */}
 <CargoManualCard
   usuarioId={perfil.usuario.id}
   denominacionActual={perfil.usuario.denominacion_empleo || perfil.usuario.cargo || ''}
 />

 {/* Card: Contacto (editable) */}
 <Card>
 <h3 className="text-sm font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
 <span className="material-icons text-base">contact_mail</span>
 Contacto
 </h3>
 <div className="space-y-3">
 <Input
 label="Correo electrónico"
 type="email"
 required
 value={editEmail}
 onChange={e => { setEditEmail(e.target.value); setPerfilDirty(true); }}
 helperText={
 perfil.usuario.email_confirmado
 ? 'Correo verificado'
 : 'Pendiente de verificación'
 }
 />
 <Input
 label="Teléfono principal"
 type="tel"
 value={editTel1}
 onChange={e => { setEditTel1(e.target.value); setPerfilDirty(true); }}
 placeholder="Ej: 3101234567"
 />
 <Input
 label="Teléfono secundario"
 type="tel"
 value={editTel2}
 onChange={e => { setEditTel2(e.target.value); setPerfilDirty(true); }}
 placeholder="Opcional"
 />
 <div className="flex justify-end gap-2 pt-2 border-t border-inst-borde">
 <Button
 variant="primary"
 size="sm"
 loading={guardandoPerfil}
 disabled={!perfilDirty}
 onClick={guardarPerfil}
 >
 Guardar contacto
 </Button>
 </div>
 </div>
 </Card>
 </div>

 {/* Seguridad */}
 <Card>
 <div className="flex items-start gap-4 flex-wrap">
 <div className="w-12 h-12 rounded-lg bg-inst-amarillo-light flex items-center justify-center flex-shrink-0">
 <span className="material-icons text-2xl text-amber-700">lock</span>
 </div>
 <div className="flex-1 min-w-[200px]">
 <h3 className="text-base font-heading font-semibold text-inst-azul-osc">Seguridad</h3>
 <p className="text-sm text-inst-texto-claro mt-0.5">
 Cambia tu contraseña periódicamente para mantener tu cuenta segura. Mínimo 8 caracteres.
 </p>
 </div>
 <Button
 variant="primary"
 iconLeft={<span className="material-icons text-base">lock_reset</span>}
 onClick={abrirModalPassword}
 >
 Cambiar contraseña
 </Button>
 </div>
 </Card>

 {/* Modal cambiar contraseña */}
 <Modal
 open={modalPassword}
 onClose={() => setModalPassword(false)}
 title="Cambiar contraseña"
 size="sm"
 >
 <div className="space-y-3">
 <Input
 label="Contraseña actual"
 type="password"
 required
 value={pwdActual}
 onChange={e => setPwdActual(e.target.value)}
 autoComplete="current-password"
 autoFocus
 />
 <Input
 label="Nueva contraseña"
 type="password"
 required
 value={pwdNueva}
 onChange={e => setPwdNueva(e.target.value)}
 helperText="Mínimo 8 caracteres"
 autoComplete="new-password"
 />
 <Input
 label="Confirmar nueva contraseña"
 type="password"
 required
 value={pwdConfirmar}
 onChange={e => setPwdConfirmar(e.target.value)}
 autoComplete="new-password"
 />
 {pwdError ? (
 <Alert tone="danger" title="Error">{pwdError}</Alert>
 ) : null}
 </div>
 <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
 <Button variant="outline" onClick={() => setModalPassword(false)}>Cancelar</Button>
 <Button variant="primary" loading={guardandoPwd} onClick={cambiarPassword}>
 Guardar contraseña
 </Button>
 </div>
 </Modal>
 </div>
 )
}
