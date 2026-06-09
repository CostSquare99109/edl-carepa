import { useEffect, useState } from 'react'
import { api, API_BASE, type PaginatedData } from '../../lib/api'

interface Concertacion {
  id: number
  meta_id: number
  observaciones: string
  estado: string
  fecha_concertacion: string
}

const ESTADOS_CONC = ['pendiente', 'aprobada', 'rechazada', 'en_revision'] as const

export default function ConcertacionList() {
  const [items, setItems] = useState<Concertacion[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Concertacion | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Concertacion>>(`/concertaciones?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/concertaciones/${editando.id}`, {
        observaciones: editando.observaciones,
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
    if (e === 'aprobada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-inactivo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Concertaciones</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay concertaciones registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Meta ID</th>
                <th>Observaciones</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-center w-16">PDF</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className={c.estado === 'rechazada' ? 'opacity-60' : ''}>
                  <td className="font-mono">#{c.meta_id}</td>
                  <td className="max-w-xs truncate">{c.observaciones || 'Sin observaciones'}</td>
                  <td>{c.fecha_concertacion}</td>
                  <td>
                  <span className={estadoBadge(c.estado)}>{c.estado}</span>
                  </td>
                  <td className="text-center">
                  <a href={`${API_BASE}/reportes/concertacion-pdf/${c.id}`} target="_blank" rel="noopener"
                   className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-verde inline-block" title="Descargar PDF">
                   <span className="material-icons text-lg">picture_as_pdf</span>
                  </a>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...c })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={c.estado === 'rechazada' ? 'Revisar/Editar concertacion' : 'Editar concertacion'}
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
              <h3 className="edl-section-title text-base">Editar Concertacion #{editando.id}</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'rechazada' && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-red-600">block</span>
                  <p className="text-sm text-red-800 font-medium">Esta concertacion fue rechazada. Puede cambiar el estado para reevaluarla.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Observaciones</label>
                <textarea value={editando.observaciones || ''} onChange={e => setEditando({ ...editando, observaciones: e.target.value })} className="edl-input w-full" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                  {ESTADOS_CONC.map(e => <option key={e} value={e}>{e}</option>)}
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
