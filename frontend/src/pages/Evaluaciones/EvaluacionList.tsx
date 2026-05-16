import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Evaluacion {
  id: number
  periodo_id: number
  tipo: string
  puntaje: number | null
  estado: string
  fecha_evaluacion: string | null
  observaciones: string | null
}

const ESTADOS_EVAL = ['pendiente', 'en_proceso', 'calificada', 'aprobada_comision', 'definitiva'] as const
const TIPOS_EVAL = ['heteroevaluacion', 'coevaluacion', 'autoevaluacion', 'evaluacion_desempeno'] as const

export default function EvaluacionList() {
  const [items, setItems] = useState<Evaluacion[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Evaluacion | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Evaluacion>>(`/evaluaciones?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/evaluaciones/${editando.id}`, {
        tipo: editando.tipo,
        puntaje: editando.puntaje,
        estado: editando.estado,
        observaciones: editando.observaciones,
      })
      setEditando(null)
      cargar()
    } catch (err) {
      console.error('Error al guardar:', err)
    } finally {
      setSaving(false)
    }
  }

  const puntajeColor = (p: number | null) => {
    if (p === null) return 'text-inst-texto-claro'
    if (p >= 80) return 'text-inst-verde font-semibold'
    if (p >= 60) return 'text-amber-600 font-semibold'
    return 'text-inst-rojo font-semibold'
  }

  const estadoBadge = (e: string) => {
    if (e === 'definitiva' || e === 'aprobada_comision' || e === 'calificada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-inactivo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Evaluaciones</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay evaluaciones registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Tipo</th>
                <th>Puntaje</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id} className={e.estado === 'definitiva' ? 'opacity-60' : ''}>
                  <td className="font-mono">#{e.periodo_id}</td>
                  <td>{e.tipo}</td>
                  <td className={puntajeColor(e.puntaje)}>
                    {e.puntaje !== null ? `${e.puntaje}%` : 'N/A'}
                  </td>
                  <td>{e.fecha_evaluacion || 'Pendiente'}</td>
                  <td>
                    <span className={estadoBadge(e.estado)}>{e.estado}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...e })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={e.estado === 'definitiva' ? 'Editar evaluacion definitiva' : 'Editar evaluacion'}
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
              <h3 className="edl-section-title text-base">Editar Evaluacion #{editando.id}</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'definitiva' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Esta evaluacion es definitiva. Modifique con precaucion.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo</label>
                  <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input w-full">
                    {TIPOS_EVAL.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                  <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                    {ESTADOS_EVAL.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Puntaje (%)</label>
                <input type="number" step="0.01" min="0" max="100" value={editando.puntaje ?? ''} onChange={e => setEditando({ ...editando, puntaje: e.target.value ? parseFloat(e.target.value) : null })} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Observaciones</label>
                <textarea value={editando.observaciones || ''} onChange={e => setEditando({ ...editando, observaciones: e.target.value })} className="edl-input w-full" rows={3} />
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
