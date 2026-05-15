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

export default function EvaluacionList() {
  const [items, setItems] = useState<Evaluacion[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Evaluacion>>(`/evaluaciones?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina])

  const puntajeColor = (p: number | null) => {
    if (p === null) return 'text-inst-texto-claro'
    if (p >= 80) return 'text-inst-verde font-semibold'
    if (p >= 60) return 'text-amber-600 font-semibold'
    return 'text-inst-rojo font-semibold'
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
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id}>
                  <td className="font-mono">#{e.periodo_id}</td>
                  <td>{e.tipo}</td>
                  <td className={puntajeColor(e.puntaje)}>
                    {e.puntaje !== null ? `${e.puntaje}%` : 'N/A'}
                  </td>
                  <td>{e.fecha_evaluacion || 'Pendiente'}</td>
                  <td>
                    <span className={
                      e.estado === 'calificada' ? 'edl-badge-activo' :
                      e.estado === 'pendiente' ? 'edl-badge-pendiente' :
                      'edl-badge-inactivo'
                    }>
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
