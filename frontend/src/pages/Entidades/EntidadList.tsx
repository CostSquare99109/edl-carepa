import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Entidad {
  id: number
  codigo: string
  nombre: string
  tipo: string
  nit: string
  estado: string
}

export default function EntidadList() {
  const [items, setItems] = useState<Entidad[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Entidad>>(`/entidades?pagina=${pagina}&por_pagina=20&busqueda=${busqueda}`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina, busqueda])

  return (
    <div>
      <h2 className="edl-section-title">Entidades</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar entidad..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="edl-input max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No se encontraron entidades</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>NIT</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id}>
                  <td className="font-mono text-xs">{e.codigo}</td>
                  <td>{e.nombre}</td>
                  <td>{e.tipo}</td>
                  <td>{e.nit}</td>
                  <td>
                    <span className={e.estado === 'activo' ? 'edl-badge-activo' : 'edl-badge-inactivo'}>
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="edl-btn-outline" disabled={pagina === 1}>
            Anterior
          </button>
          <span className="py-2 px-3 text-sm text-inst-texto-claro">
            Pagina {pagina} de {Math.ceil(total / 20)}
          </span>
          <button onClick={() => setPagina(p => p + 1)} className="edl-btn-outline" disabled={pagina >= Math.ceil(total / 20)}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
