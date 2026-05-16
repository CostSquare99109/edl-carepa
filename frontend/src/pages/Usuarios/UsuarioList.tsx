import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Usuario {
  id: number
  documento: string
  tipo_documento: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  cargo: string
  grado: string
  tipo_vinculacion: string
  estado: string
  entidad_id: number | null
}

const ESTADOS_USUARIO = ['activo', 'inactivo', 'bloqueado'] as const
const TIPOS_DOC = ['CC', 'CE', 'TI', 'PA', 'NIT'] as const
const VINCULACIONES = ['planta', 'contrato', 'provisional', 'encargo', 'comision'] as const

export default function UsuarioList() {
  const [items, setItems] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Usuario>>(`/usuarios?pagina=${pagina}&por_pagina=20&busqueda=${busqueda}`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina, busqueda])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/usuarios/${editando.id}`, {
        documento: editando.documento,
        tipo_documento: editando.tipo_documento,
        nombres: editando.nombres,
        apellidos: editando.apellidos,
        email: editando.email,
        telefono: editando.telefono,
        cargo: editando.cargo,
        grado: editando.grado,
        tipo_vinculacion: editando.tipo_vinculacion,
        estado: editando.estado,
      })
      setEditando(null)
      cargar()
    } catch (err) {
      console.error('Error al guardar:', err)
    } finally {
      setSaving(false)
    }
  }

  const estadoBadge = (e: string) => {
    if (e === 'activo') return 'edl-badge-activo'
    if (e === 'bloqueado') return 'edl-badge-inactivo'
    return 'edl-badge-pendiente'
  }

  return (
    <div>
      <h2 className="edl-section-title">Usuarios</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="edl-input max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No se encontraron usuarios</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className={u.estado === 'bloqueado' || u.estado === 'inactivo' ? 'opacity-60' : ''}>
                  <td className="font-mono text-xs">{u.documento}</td>
                  <td>{u.nombres} {u.apellidos}</td>
                  <td>{u.email}</td>
                  <td>{u.cargo}</td>
                  <td>
                    <span className={estadoBadge(u.estado)}>{u.estado}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...u })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={u.estado === 'bloqueado' ? 'Desbloquear/Editar usuario' : 'Editar usuario'}
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-inst-borde">
              <h3 className="edl-section-title text-base">Editar Usuario</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'bloqueado' && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-red-600">lock</span>
                  <p className="text-sm text-red-800 font-medium">Este usuario esta bloqueado por intentos fallidos. Cambie el estado a "activo" para desbloquearlo.</p>
                </div>
              )}
              {editando.estado === 'inactivo' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Este usuario esta inactivo. Puede reactivarlo cambiando el estado.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo Doc.</label>
                  <select value={editando.tipo_documento} onChange={e => setEditando({ ...editando, tipo_documento: e.target.value })} className="edl-input w-full">
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Documento</label>
                  <input value={editando.documento} onChange={e => setEditando({ ...editando, documento: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombres</label>
                  <input value={editando.nombres} onChange={e => setEditando({ ...editando, nombres: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Apellidos</label>
                  <input value={editando.apellidos} onChange={e => setEditando({ ...editando, apellidos: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Email</label>
                  <input value={editando.email} onChange={e => setEditando({ ...editando, email: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Telefono</label>
                  <input value={editando.telefono || ''} onChange={e => setEditando({ ...editando, telefono: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Cargo</label>
                  <input value={editando.cargo || ''} onChange={e => setEditando({ ...editando, cargo: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Grado</label>
                  <input value={editando.grado || ''} onChange={e => setEditando({ ...editando, grado: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Vinculacion</label>
                  <select value={editando.tipo_vinculacion || ''} onChange={e => setEditando({ ...editando, tipo_vinculacion: e.target.value })} className="edl-input w-full">
                    <option value="">Sin asignar</option>
                    {VINCULACIONES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                  <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                    {ESTADOS_USUARIO.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-inst-borde">
              <button onClick={() => setEditando(null)} className="edl-btn-outline">Cancelar</button>
              <button onClick={guardar} disabled={saving} className="edl-btn-primary flex items-center gap-2">
                {saving && <span className="material-icons text-sm animate-spin">sync</span>}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
