import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Evidencia {
  id: number
  meta_id: number
  nombre_archivo: string
  tipo_mime: string
  tamano_bytes: number
  descripcion: string | null
  estado: string
  creado_en: string
}

export default function EvidenciaList() {
  const [items, setItems] = useState<Evidencia[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<PaginatedData<Evidencia>>(`/evidencias?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pagina])

  const formatSize = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1048576).toFixed(1)} MB`
  }

  const estadoBadge = (e: string) => {
    if (e === 'verificada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-inactivo'
  }

  return (
    <div>
      <h2 className="edl-section-title">Evidencias</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      {loading ? (
        <p className="text-inst-texto-claro text-sm">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-inst-texto-claro text-sm">No hay evidencias registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Meta</th>
                <th>Archivo</th>
                <th>Tamano</th>
                <th>Descripcion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(ev => (
                <tr key={ev.id}>
                  <td className="font-mono">#{ev.meta_id}</td>
                  <td className="font-mono text-xs">{ev.nombre_archivo}</td>
                  <td>{formatSize(ev.tamano_bytes)}</td>
                  <td className="max-w-xs truncate">{ev.descripcion || '-'}</td>
                  <td>
                    <span className={estadoBadge(ev.estado)}>{ev.estado}</span>
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
