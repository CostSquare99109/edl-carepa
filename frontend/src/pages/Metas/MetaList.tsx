import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Meta {
  id: number
  periodo_id: number
  funcionario_id: number
  descripcion: string
  tipo: string
  peso: number
  indicador: string
  meta_numerica: number | null
  unidad_medida: string
  estado: string
}

const TIPOS_META = ['cualitativa', 'cuantitativa', 'mixta'] as const
const ESTADOS_META = ['pendiente', 'concertada', 'aprobada', 'en_seguimiento', 'evaluada', 'cerrada'] as const

export default function MetaList() {
  const [items, setItems] = useState<Meta[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Meta | null>(null)
  const [saving, setSaving] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Meta>>(`/metas?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/metas/${editando.id}`, {
        descripcion: editando.descripcion,
        tipo: editando.tipo,
        peso: editando.peso,
        indicador: editando.indicador,
        meta_numerica: editando.meta_numerica,
        unidad_medida: editando.unidad_medida,
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
    if (e === 'evaluada' || e === 'cerrada') return 'edl-badge-inactivo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-activo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Metas</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay metas registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Descripcion</th>
                <th>Tipo</th>
                <th>Peso</th>
                <th>Indicador</th>
                <th>Estado</th>
                <th className="text-center w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id} className={m.estado === 'cerrada' ? 'opacity-60' : ''}>
                  <td className="max-w-xs truncate">{m.descripcion}</td>
                  <td>{m.tipo}</td>
                  <td className="font-mono">{m.peso}%</td>
                  <td className="max-w-xs truncate">{m.indicador}</td>
                  <td>
                    <span className={estadoBadge(m.estado)}>{m.estado}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setEditando({ ...m })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title={m.estado === 'cerrada' ? 'Reabrir/Editar meta' : 'Editar meta'}
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
              <h3 className="edl-section-title text-base">Editar Meta</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'cerrada' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Esta meta esta cerrada. Puede reabrirla cambiando el estado.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Descripcion</label>
                <textarea value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} className="edl-input w-full" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo</label>
                  <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input w-full">
                    {TIPOS_META.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Peso (%)</label>
                  <input type="number" step="0.01" min="0" max="100" value={editando.peso} onChange={e => setEditando({ ...editando, peso: parseFloat(e.target.value) || 0 })} className="edl-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Indicador</label>
                <input value={editando.indicador || ''} onChange={e => setEditando({ ...editando, indicador: e.target.value })} className="edl-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Meta Numerica</label>
                  <input type="number" step="0.01" value={editando.meta_numerica ?? ''} onChange={e => setEditando({ ...editando, meta_numerica: e.target.value ? parseFloat(e.target.value) : null })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Unidad Medida</label>
                  <input value={editando.unidad_medida || ''} onChange={e => setEditando({ ...editando, unidad_medida: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                  {ESTADOS_META.map(e => <option key={e} value={e}>{e}</option>)}
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
