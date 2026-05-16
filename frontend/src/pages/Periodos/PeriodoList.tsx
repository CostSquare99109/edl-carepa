import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Periodo {
  id: number
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
  fecha_inicio_concertacion: string
  fecha_fin_concertacion: string
  fecha_inicio_evaluacion: string
  fecha_fin_evaluacion: string
}

const ESTADOS_PERIODO = ['configuracion', 'concertacion', 'seguimiento', 'evaluacion', 'calificacion', 'cerrado'] as const

export default function PeriodoList() {
  const [items, setItems] = useState<Periodo[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Periodo | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Periodo>>(`/periodos?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/periodos/${editando.id}`, {
        nombre: editando.nombre,
        fecha_inicio: editando.fecha_inicio,
        fecha_fin: editando.fecha_fin,
        estado: editando.estado,
        fecha_inicio_concertacion: editando.fecha_inicio_concertacion,
        fecha_fin_concertacion: editando.fecha_fin_concertacion,
        fecha_inicio_evaluacion: editando.fecha_inicio_evaluacion,
        fecha_fin_evaluacion: editando.fecha_fin_evaluacion,
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
    if (e === 'cerrado') return 'edl-badge-inactivo'
    if (e === 'configuracion') return 'edl-badge-pendiente'
    return 'edl-badge-activo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Periodos</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay periodos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className={p.estado === 'cerrado' ? 'opacity-60' : ''}>
                  <td className="font-medium">{p.nombre}</td>
                  <td>{p.fecha_inicio}</td>
                  <td>{p.fecha_fin}</td>
                  <td>
                    <span className={estadoBadge(p.estado)}>{p.estado}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...p })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={p.estado === 'cerrado' ? 'Reabrir/Editar periodo' : 'Editar periodo'}
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
              <h3 className="edl-section-title text-base">Editar Periodo</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'cerrado' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Este periodo esta cerrado. Puede reabrirlo cambiando el estado.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombre</label>
                <input value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} className="edl-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fecha Inicio</label>
                  <input type="date" value={editando.fecha_inicio} onChange={e => setEditando({ ...editando, fecha_inicio: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fecha Fin</label>
                  <input type="date" value={editando.fecha_fin} onChange={e => setEditando({ ...editando, fecha_fin: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                  {ESTADOS_PERIODO.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <hr className="border-inst-borde" />
              <p className="text-xs font-medium text-inst-texto-claro">Fechas de Concertacion</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Inicio Concertacion</label>
                  <input type="date" value={editando.fecha_inicio_concertacion || ''} onChange={e => setEditando({ ...editando, fecha_inicio_concertacion: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fin Concertacion</label>
                  <input type="date" value={editando.fecha_fin_concertacion || ''} onChange={e => setEditando({ ...editando, fecha_fin_concertacion: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <p className="text-xs font-medium text-inst-texto-claro">Fechas de Evaluacion</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Inicio Evaluacion</label>
                  <input type="date" value={editando.fecha_inicio_evaluacion || ''} onChange={e => setEditando({ ...editando, fecha_inicio_evaluacion: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fin Evaluacion</label>
                  <input type="date" value={editando.fecha_fin_evaluacion || ''} onChange={e => setEditando({ ...editando, fecha_fin_evaluacion: e.target.value })} className="edl-input w-full" />
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
