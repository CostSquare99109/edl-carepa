import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Periodo {
  id: number
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
}

export default function PeriodoList() {
  const [items, setItems] = useState<Periodo[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Periodo>>(`/periodos?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina])

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
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.nombre}</td>
                  <td>{p.fecha_inicio}</td>
                  <td>{p.fecha_fin}</td>
                  <td>
                    <span className={p.estado === 'activo' ? 'edl-badge-activo' : p.estado === 'cerrado' ? 'edl-badge-inactivo' : 'edl-badge-pendiente'}>
                      {p.estado}
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
