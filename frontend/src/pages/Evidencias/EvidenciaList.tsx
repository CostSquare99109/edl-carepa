import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Evidencia {
  id: number
  meta_id: number
  nombre_archivo: string
  tipo_mime: string
  tamano_bytes: number
  descripcion: string | null
  estado: string
  creado_en: string
}

const ESTADOS_EVID = ['pendiente', 'verificada', 'rechazada'] as const

export default function EvidenciaList() {
  const [items, setItems] = useState<Evidencia[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Evidencia | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Evidencia>>(`/evidencias?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/evidencias/${editando.id}/verificar`, {
        descripcion: editando.descripcion,
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

  const formatSize = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1048576).toFixed(1)} MB`
  }

  const estadoBadge = (e: string) => {
    if (e === 'verificada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-inactivo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Evidencias</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay evidencias registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Meta</th>
                <th>Archivo</th>
                <th>Tamano</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(ev => (
                <tr key={ev.id} className={ev.estado === 'rechazada' ? 'opacity-60' : ''}>
                  <td className="font-mono">#{ev.meta_id}</td>
                  <td className="font-mono text-xs">{ev.nombre_archivo}</td>
                  <td>{formatSize(ev.tamano_bytes)}</td>
                  <td className="max-w-xs truncate">{ev.descripcion || '-'}</td>
                  <td>
                    <span className={estadoBadge(ev.estado)}>{ev.estado}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...ev })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={ev.estado === 'rechazada' ? 'Revisar/Editar evidencia rechazada' : 'Editar evidencia'}
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
          <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-inst-borde">
              <h3 className="edl-section-title text-base">Editar Evidencia</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'rechazada' && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-red-600">block</span>
                  <p className="text-sm text-red-800 font-medium">Esta evidencia fue rechazada. Puede cambiar el estado para reevaluarla.</p>
                </div>
              )}

              <div className="bg-inst-gris rounded-lg p-3 text-sm space-y-1">
                <p><span className="font-medium">Archivo:</span> {editando.nombre_archivo}</p>
                <p><span className="font-medium">Tipo:</span> {editando.tipo_mime}</p>
                <p><span className="font-medium">Tamano:</span> {formatSize(editando.tamano_bytes)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Descripcion</label>
                <textarea value={editando.descripcion || ''} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} className="edl-input w-full" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                  {ESTADOS_EVID.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
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
