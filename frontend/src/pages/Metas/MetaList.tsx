import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Meta {
  id: number
  descripcion: string
  tipo: string
  peso: number
  indicador: string
  estado: string
}

export default function MetaList() {
  const [items, setItems] = useState<Meta[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Meta>>(`/metas?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina])

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
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id}>
                  <td className="max-w-xs truncate">{m.descripcion}</td>
                  <td>{m.tipo}</td>
                  <td className="font-mono">{m.peso}%</td>
                  <td className="max-w-xs truncate">{m.indicador}</td>
                  <td>
                    <span className={m.estado === 'cumplida' ? 'edl-badge-activo' : m.estado === 'pendiente' ? 'edl-badge-pendiente' : 'edl-badge-inactivo'}>
                      {m.estado}
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
