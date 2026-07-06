import { useEffect, useState, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Button, Badge, Tooltip, SkeletonText, Modal } from '../../components/ui'
import { toast } from 'sonner'

interface Usuario {
  id: number
  documento: string
  tipo_documento: string
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  email: string
  telefono1?: string
  denominacion_empleo?: string
  grado_empleo?: string
  dependencia_id?: number
  dependencia_nombre?: string
  nivel?: string
  naturaleza?: string
  tipo_nombramiento?: string
  estado: string
  roles?: { codigo: string; nombre: string }[]
}

const TIPOS_DOC = ['CC', 'CE', 'TI', 'PA', 'NIT'] as const
const ESTADOS = ['activo', 'inactivo', 'bloqueado'] as const

const ROLES_SISTEMA = [
  { codigo: 'admin_carepa', nombre: 'Administrador CAREPA' },
  { codigo: 'jefe_dependencia', nombre: 'Jefe de Dependencia' },
  { codigo: 'comision_evaluadora', nombre: 'Comisión Evaluadora' },
  { codigo: 'evaluador', nombre: 'Evaluador' },
  { codigo: 'evaluado', nombre: 'Evaluado' },
  { codigo: 'cargador', nombre: 'Cargador' },
]

export default function UsuarioList() {
  const [items, setItems] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    documento: '', tipo_documento: 'CC',
    primer_nombre: '', segundo_nombre: '',
    primer_apellido: '', segundo_apellido: '',
    email: '', telefono1: '',
    denominacion_empleo: '', grado_empleo: '',
    estado: 'activo',
    rolesSeleccionados: [] as string[],
  })

  const cargar = useCallback(() => {
    setLoading(true)
    api.get<PaginatedData<Usuario>>(`/usuarios?pagina=${pagina}&por_pagina=20&busqueda=${encodeURIComponent(busqueda)}`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [pagina, busqueda])

  useEffect(() => { cargar() }, [cargar])

  const abrirEditar = (u: Usuario) => {
    setEditando(u)
    setEditForm({
      documento: u.documento,
      tipo_documento: u.tipo_documento || 'CC',
      primer_nombre: u.primer_nombre || '',
      segundo_nombre: u.segundo_nombre || '',
      primer_apellido: u.primer_apellido || '',
      segundo_apellido: u.segundo_apellido || '',
      email: u.email || '',
      telefono1: u.telefono1 || '',
      denominacion_empleo: u.denominacion_empleo || '',
      grado_empleo: u.grado_empleo || '',
      estado: u.estado || 'activo',
      rolesSeleccionados: (u.roles || []).map(r => r.codigo),
    })
  }

  const guardar = async () => {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/usuarios/${editando.id}`, {
        documento: editForm.documento,
        tipo_documento: editForm.tipo_documento,
        primer_nombre: editForm.primer_nombre,
        segundo_nombre: editForm.segundo_nombre || null,
        primer_apellido: editForm.primer_apellido,
        segundo_apellido: editForm.segundo_apellido || null,
        email: editForm.email,
        telefono1: editForm.telefono1 || null,
        denominacion_empleo: editForm.denominacion_empleo || null,
        grado_empleo: editForm.grado_empleo || null,
        estado: editForm.estado,
      })
      if (editForm.rolesSeleccionados.length > 0) {
        await api.put(`/usuarios/${editando.id}/roles`, { roles: editForm.rolesSeleccionados })
      }
      toast.success('Usuario actualizado correctamente')
      setEditando(null)
      cargar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  const eliminarUsuario = async (u: Usuario) => {
    const nombre = `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim()
    if (!confirm(`¿Eliminar usuario "${nombre}" (${u.documento})? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/usuarios/${u.id}`)
      toast.success(`Usuario ${nombre} eliminado correctamente`)
      cargar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar usuario')
    }
  }

  const nombreCompleto = (u: Usuario) =>
    [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido]
      .filter(Boolean).join(' ').trim() || '—'

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-heading font-bold text-inst-azul-osc">
          <span className="material-icons align-middle mr-2 text-2xl">people</span>
          Usuarios
        </h2>
      </div>

      <Card>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[240px]">
            <input
              type="search"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
              placeholder="Buscar por nombre o documento..."
              className="edl-input w-full"
            />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <SkeletonText lines={8} />
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-3xl text-inst-texto-claro">person_off</span>
            <p className="text-sm text-inst-texto-claro mt-2">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="edl-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Dependencia</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th className="text-center">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id} className={u.estado !== 'activo' ? 'opacity-60' : ''}>
                    <td className="font-mono text-xs">{u.documento}</td>
                    <td>{nombreCompleto(u)}</td>
                    <td>{u.email || <span className="text-inst-texto-claro">—</span>}</td>
                    <td>{u.denominacion_empleo || <span className="text-inst-texto-claro">—</span>}</td>
                    <td>{u.dependencia_nombre || <span className="text-inst-texto-claro">Sin dependencia</span>}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {(u.roles || []).map(r => (
                          <Badge key={r.codigo} tone={r.codigo.startsWith('admin') ? 'danger' : r.codigo === 'evaluador' ? 'success' : 'info'}>
                            {r.nombre || r.codigo}
                          </Badge>
                        ))}
                        {(!u.roles || u.roles.length === 0) ? <span className="text-xs text-inst-texto-claro">Sin rol</span> : null}
                      </div>
                    </td>
                    <td>
                      <Badge tone={u.estado === 'activo' ? 'success' : 'neutral'} dot>
                        {u.estado === 'activo' ? 'Activo' : u.estado === 'bloqueado' ? 'Bloqueado' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-center">
                        <Tooltip content="Editar usuario">
                          <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-sm">edit</span>} onClick={() => abrirEditar(u)}>
                            Editar
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar usuario">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarUsuario(u)}
                            aria-label={`Eliminar usuario ${u.primer_nombre} ${u.primer_apellido}`}
                            className="text-inst-rojo hover:bg-red-50"
                          >
                            <span className="material-icons text-base">delete</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && !loading && items.length > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 mt-3 border-t border-inst-borde">
            <div className="text-sm text-inst-texto-claro">
              Mostrando {((pagina - 1) * 20) + 1} - {Math.min(pagina * 20, total)} de {total} usuarios
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                className="px-3 py-1 rounded text-sm bg-white border hover:bg-inst-gris disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página anterior">
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, pagina - 3), pagina + 2)
                .map(p => (
                  <button key={p} onClick={() => setPagina(p)}
                    className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul-osc text-white' : 'bg-white border hover:bg-inst-gris'}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPagina(p => Math.min(totalPages, p + 1))} disabled={pagina === totalPages}
                className="px-3 py-1 rounded text-sm bg-white border hover:bg-inst-gris disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página siguiente">
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {editando && (
        <Modal
          open={true}
          onClose={() => setEditando(null)}
          title="Editar Usuario"
          description={`Editando: ${editForm.primer_nombre} ${editForm.primer_apellido}`}
          size="lg"
        >
          <div className="space-y-4">
            {editando.estado === 'bloqueado' && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                <span className="material-icons text-red-600">lock</span>
                <p className="text-sm text-red-800 font-medium">Usuario bloqueado por intentos fallidos. Cambie estado a "activo" para desbloquear.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo Doc.</label>
                <select value={editForm.tipo_documento} onChange={e => setEditForm(f => ({ ...f, tipo_documento: e.target.value }))} className="edl-input w-full">
                  {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Documento</label>
                <input value={editForm.documento} onChange={e => setEditForm(f => ({ ...f, documento: e.target.value }))} className="edl-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Primer nombre</label>
                <input value={editForm.primer_nombre} onChange={e => setEditForm(f => ({ ...f, primer_nombre: e.target.value }))} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Segundo nombre</label>
                <input value={editForm.segundo_nombre} onChange={e => setEditForm(f => ({ ...f, segundo_nombre: e.target.value }))} className="edl-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Primer apellido</label>
                <input value={editForm.primer_apellido} onChange={e => setEditForm(f => ({ ...f, primer_apellido: e.target.value }))} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Segundo apellido</label>
                <input value={editForm.segundo_apellido} onChange={e => setEditForm(f => ({ ...f, segundo_apellido: e.target.value }))} className="edl-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Email</label>
                <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Teléfono</label>
                <input value={editForm.telefono1} onChange={e => setEditForm(f => ({ ...f, telefono1: e.target.value }))} className="edl-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Cargo</label>
                <input value={editForm.denominacion_empleo} onChange={e => setEditForm(f => ({ ...f, denominacion_empleo: e.target.value }))} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Grado</label>
                <input value={editForm.grado_empleo} onChange={e => setEditForm(f => ({ ...f, grado_empleo: e.target.value }))} className="edl-input w-full" />
              </div>
            </div>
            <div className="border-t border-inst-borde pt-4">
              <h4 className="text-sm font-semibold text-inst-azul mb-3 flex items-center gap-2">
                <span className="material-icons text-base">badge</span>
                Roles del usuario
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES_SISTEMA.map(rol => {
                  const activo = editForm.rolesSeleccionados.includes(rol.codigo)
                  return (
                    <label
                      key={rol.codigo}
                      className={`flex items-center gap-3 p-2.5 rounded border cursor-pointer transition-colors ${
                        activo ? 'border-inst-azul bg-inst-azul/5' : 'border-inst-borde hover:bg-inst-gris'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditForm(f => ({ ...f, rolesSeleccionados: [...f.rolesSeleccionados, rol.codigo] }))
                          } else {
                            setEditForm(f => ({ ...f, rolesSeleccionados: f.rolesSeleccionados.filter(r => r !== rol.codigo) }))
                          }
                        }}
                        className="w-4 h-4 accent-inst-azul"
                      />
                      <span className="text-sm text-inst-texto font-medium">{rol.nombre}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editForm.estado} onChange={e => setEditForm((f: typeof editForm) => ({ ...f, estado: e.target.value }))} className="edl-input w-full">
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={guardar}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
