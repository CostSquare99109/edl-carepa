import { useEffect, useState } from 'react'
import { COLORES_TAILWIND } from '../../styles/colors'
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

const ESTADOS_PERIODO: { value: string; label: string }[] = [
  { value: 'configuracion', label: 'Configuración' },
  { value: 'concertacion', label: 'Concertación' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'evaluacion', label: 'Evaluación' },
  { value: 'calificacion', label: 'Calificación' },
  { value: 'cerrado', label: 'Cerrado' },
]

const PERIODOS_ANUALES = [
  '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027',
  '2027-2028', '2028-2029', '2029-2030',
]

function generarNombre(inicio: number): string {
  return `${inicio}-${inicio + 1}`
}

function generarFechas(inicio: number) {
  return {
    fecha_inicio: `${inicio}-01-01`,
    fecha_fin: `${inicio + 1}-12-31`,
    fecha_inicio_concertacion: `${inicio}-01-15`,
    fecha_fin_concertacion: `${inicio}-03-31`,
    fecha_inicio_evaluacion: `${inicio + 1}-01-15`,
    fecha_fin_evaluacion: `${inicio + 1}-06-30`,
  }
}

export default function PeriodoList() {
  const [items, setItems] = useState<Periodo[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Periodo | null>(null)
  const [saving, setSaving] = useState(false)
  const [creando, setCreando] = useState(false)
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear())

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

  async function crearPeriodo() {
    setSaving(true)
    try {
      const fechas = generarFechas(nuevoAnio)
      await api.post('/periodos', {
        nombre: generarNombre(nuevoAnio),
        estado: 'configuracion',
        ...fechas,
      })
      setCreando(false)
      cargar()
    } catch (err) {
      console.error('Error al crear:', err)
    } finally {
      setSaving(false)
    }
  }

  const estadoLabel = (e: string) => ESTADOS_PERIODO.find(ep => ep.value === e)?.label || e

  const estadoBadge = (e: string) => {
    if (e === 'cerrado') return 'bg-gray-100 text-gray-700'
    if (e === 'calificacion' || e === 'evaluacion') return 'bg-yellow-100 text-yellow-800'
    if (e === 'configuracion') return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${COLORES_TAILWIND.azulClaroText}`}>
        <span className="material-icons text-lg align-middle mr-1">date_range</span>
        Periodos de Evaluacion
        </h2>
        <button onClick={() => setCreando(true)}
        className={`${COLORES_TAILWIND.azulClaro} text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2`}>
          <span className="material-icons text-base">add</span>
          Nuevo Periodo
        </button>
      </div>

      {/* Crear nuevo periodo */}
      {creando && (
        <div className={`bg-white rounded-lg shadow-sm p-4 border-2 ${COLORES_TAILWIND.azulClaroBorder}/20`}>
        <h3 className={`text-sm font-semibold ${COLORES_TAILWIND.azulClaroText} mb-3`}>Crear Nuevo Periodo</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-inst-texto-claro mb-1">Año de inicio</label>
              <select value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {Array.from({ length: 10 }, (_, i) => 2022 + i).map(a => (
                  <option key={a} value={a}>{generarNombre(a)}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-inst-texto-claro py-2">
              Del <strong>{nuevoAnio}-01-01</strong> al <strong>{nuevoAnio + 1}-12-31</strong>
            </div>
            <button onClick={crearPeriodo} disabled={saving}
              className={`${COLORES_TAILWIND.verde} text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1`}>
              {saving ? <span className="material-icons text-sm animate-spin">sync</span> : <span className="material-icons text-sm">check</span>}
              Crear
            </button>
            <button onClick={() => setCreando(false)}
              className="border border-gray-300 text-inst-texto px-3 py-2 rounded-lg text-sm hover:bg-inst-gris">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <span className="material-icons text-4xl block mb-2">event_busy</span>
          No hay periodos registrados. Cree uno nuevo.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-inst-gris">
                <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Periodo</th>
                <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Fecha Inicio</th>
                <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Fecha Fin</th>
                <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-inst-texto-claro w-16">Editar</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className={`border-b hover:bg-inst-gris/50 transition ${p.estado === 'cerrado' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-medium text-inst-azul">{p.nombre}</td>
                  <td className="px-4 py-3">{p.fecha_inicio ? new Date(p.fecha_inicio + 'T00:00:00').toLocaleDateString('es-CO') : '—'}</td>
                  <td className="px-4 py-3">{p.fecha_fin ? new Date(p.fecha_fin + 'T00:00:00').toLocaleDateString('es-CO') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoBadge(p.estado)}`}>
                      {estadoLabel(p.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditando({ ...p })}
                      className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                      title="Editar periodo"
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
              <h3 className={`text-base font-bold ${COLORES_TAILWIND.azulClaroText}`}>Editar Periodo</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'cerrado' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Este periodo está cerrado. Puede reabrirlo cambiando el estado.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombre</label>
                <input value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} className="edl-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fecha Inicio</label>
                  <input type="date" value={editando.fecha_inicio?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_inicio: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fecha Fin</label>
                  <input type="date" value={editando.fecha_fin?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_fin: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                  {ESTADOS_PERIODO.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <hr className="border-inst-borde" />
              <p className="text-xs font-medium text-inst-texto-claro">Fechas de Concertación</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Inicio Concertación</label>
                  <input type="date" value={editando.fecha_inicio_concertacion?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_inicio_concertacion: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fin Concertación</label>
                  <input type="date" value={editando.fecha_fin_concertacion?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_fin_concertacion: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <p className="text-xs font-medium text-inst-texto-claro">Fechas de Evaluación</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Inicio Evaluación</label>
                  <input type="date" value={editando.fecha_inicio_evaluacion?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_inicio_evaluacion: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Fin Evaluación</label>
                  <input type="date" value={editando.fecha_fin_evaluacion?.substring(0, 10) || ''} onChange={e => setEditando({ ...editando, fecha_fin_evaluacion: e.target.value })} className="edl-input w-full" />
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
