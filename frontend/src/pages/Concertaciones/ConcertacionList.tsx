import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Concertacion {
  id: number
  meta_id: number
  observaciones: string
  estado: string
  fecha_concertacion: string
}

export default function ConcertacionList() {
  const [items, setItems] = useState<Concertacion[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Concertacion>>(`/concertaciones?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina])

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
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td className="font-mono">#{c.meta_id}</td>
                  <td className="max-w-xs truncate">{c.observaciones || 'Sin observaciones'}</td>
                  <td>{c.fecha_concertacion}</td>
                  <td>
                    <span className={c.estado === 'aprobada' ? 'edl-badge-activo' : c.estado === 'pendiente' ? 'edl-badge-pendiente' : 'edl-badge-inactivo'}>
                      {c.estado}
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
