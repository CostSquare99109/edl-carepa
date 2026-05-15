import { useState } from 'react'
import { api } from '../../lib/api'

export default function ReportesPage() {
  const [periodoId, setPeriodoId] = useState('')
  const [entidadId, setEntidadId] = useState('')
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<unknown>(null)
  const [tipo, setTipo] = useState('concertacion')
  const [error, setError] = useState('')

  const generarReporte = async () => {
    setLoading(true)
    setError('')
    setReporte(null)
    try {
      const params = new URLSearchParams()
      if (periodoId) params.set('periodo_id', periodoId)
      if (entidadId) params.set('entidad_id', entidadId)
      
      const path = tipo === 'concertacion' 
        ? `/reportes/concertacion?${params.toString()}`
        : `/reportes/evaluaciones?${params.toString()}`
      
      const data = await api.get(path)
      setReporte(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="edl-section-title">Reportes</h2>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <div className="edl-card mb-6">
        <h3 className="text-sm font-semibold text-inst-azul mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo de Reporte</label>
            <select 
              value={tipo} 
              onChange={e => setTipo(e.target.value)}
              className="edl-input"
            >
              <option value="concertacion">Concertacion</option>
              <option value="evaluaciones">Evaluaciones</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-inst-texto-claro mb-1">Periodo ID</label>
            <input
              type="number"
              value={periodoId}
              onChange={e => setPeriodoId(e.target.value)}
              placeholder="Ej: 1"
              className="edl-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-inst-texto-claro mb-1">Entidad ID</label>
            <input
              type="number"
              value={entidadId}
              onChange={e => setEntidadId(e.target.value)}
              placeholder="Ej: 1"
              className="edl-input"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={generarReporte}
            disabled={loading}
            className="edl-btn-primary"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-inst-rojo/20 text-inst-rojo text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      {reporte && (
        <div className="edl-card">
          <h3 className="text-sm font-semibold text-inst-azul mb-3">Resultado</h3>
          <pre className="text-xs bg-inst-gris p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(reporte, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
