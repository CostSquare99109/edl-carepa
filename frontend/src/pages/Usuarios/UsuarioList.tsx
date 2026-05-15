import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Usuario {
  id: number
  documento: string
  tipo_documento: string
  nombres: string
  apellidos: string
  email: string
  cargo: string
  estado: string
}

export default function UsuarioList() {
  const [items, setItems] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Usuario>>(`/usuarios?pagina=${pagina}&por_pagina=20&busqueda=${busqueda}`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina, busqueda])

  return (
    <div>
      <h2 className="edl-section-title">Usuarios</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="edl-input max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No se encontraron usuarios</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">{u.documento}</td>
                  <td>{u.nombres} {u.apellidos}</td>
                  <td>{u.email}</td>
                  <td>{u.cargo}</td>
                  <td>
                    <span className={u.estado === 'activo' ? 'edl-badge-activo' : 'edl-badge-inactivo'}>
                      {u.estado}
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
