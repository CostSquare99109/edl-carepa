import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Button, Select, DataTable, EmptyState } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface Evaluacion {
  id: number
  periodo_id: number
  tipo: string
  puntaje: number | null
  estado: string
  fecha_evaluacion: string | null
  observaciones: string | null
}

interface Periodo {
 id: number
 nombre: string
 anio: string
}

interface ConcertacionAprobada {
 periodo: string
 evaluado_documento: string
 compromisos_funcionales: number
 peso_comportamentales: string
 metas_institucionales: string | null
 evaluador_documento: string
 evaluador_nombre: string
 comision_evaluadora: string
 cargo: string | null
 fecha_creacion: string
 fecha_aprobacion: string
}

const ESTADOS_EVAL = ['pendiente', 'concertacion', 'en_proceso', 'calificada', 'aprobada_comision', 'cerrada'] as const
const TIPOS_EVAL = ['parcial_semestral', 'parcial_eventual', 'definitiva'] as const

const TIPOS_REPORTE = [
 { value: 'concertaciones-aprobadas', label: 'Concertaciones Aprobadas' },
 { value: 'concertaciones-rechazadas', label: 'Concertaciones Rechazadas' },
 { value: 'concertaciones-pendientes', label: 'Concertaciones Creadas y Pendientes de Aprobacion' },
 { value: 'concertaciones-ajustadas', label: 'Concertaciones Ajustadas' },
 { value: 'nuevas-concertaciones', label: 'Nuevas Concertaciones' },
 { value: 'evaluados-pendientes', label: 'Evaluados Pendientes Por Concertacion' },
 { value: 'evaluaciones-entidad', label: 'Evaluaciones Por Entidad' },
 { value: 'evaluaciones-anuladas', label: 'Evaluaciones Anuladas Por Entidad' },
]

export default function EvaluacionList() {
  const [items, setItems] = useState<Evaluacion[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Evaluacion | null>(null)
  const [saving, setSaving] = useState(false)

  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [reportPeriodoId, setReportPeriodoId] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportData, setReportData] = useState<any[]>([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  function cargar() {
    setLoading(true)
    api.get<PaginatedData<Evaluacion>>(`/evaluaciones?pagina=${pagina}&por_pagina=20`)
      .then(d => { setItems(d.data || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [pagina])

  useEffect(() => {
    api.get<{data: Periodo[]}>('/periodos?por_pagina=100')
      .then(res => setPeriodos(res.data || []))
      .catch(() => {})
  }, [])

  async function generarReporte() {
    if (!reportPeriodoId || !reportType) return
    setReportLoading(true)
    setReportGenerated(false)
    try {
      const res = await api.get<ConcertacionAprobada[]>(`/reportes/concertaciones-aprobadas?periodo_id=${reportPeriodoId}`)
      setReportData(res || [])
      setReportGenerated(true)
    } catch (e: any) {
      toast.error(e?.message || 'Error al generar el reporte')
      setReportData([])
    }
    setReportLoading(false)
  }

  async function descargarExcel() {
    if (!reportPeriodoId) return
    try {
      const blob = await api.getBlob(`/reportes/excel/concertaciones-aprobadas?periodo_id=${reportPeriodoId}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${reportType}_${Date.now()}.xls`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      toast.error(e?.message || 'Error al descargar')
    }
  }

  useEffect(() => {
    if (reportPeriodoId && reportType) generarReporte()
  }, [reportPeriodoId, reportType])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/evaluaciones/${editando.id}`, {
        tipo: editando.tipo,
        puntaje: editando.puntaje,
        estado: editando.estado,
        observaciones: editando.observaciones,
      })
      setEditando(null)
      cargar()
    } catch (err) {
      console.error('Error al guardar:', err)
    } finally {
      setSaving(false)
    }
  }

  const puntajeColor = (p: number | null) => {
    if (p === null) return 'text-inst-texto-claro'
    if (p >= 80) return 'text-inst-azul-osc font-semibold'
    if (p >= 60) return 'text-amber-600 font-semibold'
    return 'text-inst-rojo font-semibold'
  }

  const estadoBadge = (e: string) => {
    if (e === 'definitiva' || e === 'aprobada_comision' || e === 'calificada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    return 'edl-badge-inactivo'
  }

  const reportColumns: DataTableColumn<ConcertacionAprobada>[] = [
    { key: 'periodo', header: 'Periodo', render: (r) => r.periodo },
    { key: 'evaluado_documento', header: 'Documento del evaluado', render: (r) => r.evaluado_documento },
    { key: 'compromisos_funcionales', header: 'Compromisos Funcionales', align: 'center', render: (r) => r.compromisos_funcionales },
    { key: 'peso_comportamentales', header: 'Peso % Comportamentales', align: 'center', render: (r) => r.peso_comportamentales },
    { key: 'metas_institucionales', header: 'Metas institucionales', render: (r) => r.metas_institucionales || '-' },
    { key: 'evaluador_documento', header: 'Documento del evaluador', render: (r) => r.evaluador_documento },
    { key: 'evaluador_nombre', header: 'Nombre del evaluador', render: (r) => r.evaluador_nombre },
    { key: 'comision_evaluadora', header: 'Comision evaluadora', render: (r) => r.comision_evaluadora || 'Sin comision' },
    { key: 'cargo', header: 'Cargo', render: (r) => r.cargo || '-' },
    { key: 'fecha_creacion', header: 'Fecha de creacion', render: (r) => r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleDateString('es-CO') : '-' },
    { key: 'fecha_aprobacion', header: 'Fecha de aprobacion', render: (r) => r.fecha_aprobacion ? new Date(r.fecha_aprobacion).toLocaleDateString('es-CO') : '-' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-icons text-inst-azul-osc text-xl">assessment</span>
        <h2 className="edl-section-title">Evaluaciones</h2>
      </div>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <Card>
        <div className="max-w-xs">
          <Select
            label="Seleccione un periodo para reportes"
            value={reportPeriodoId}
            onChange={e => { setReportPeriodoId(e.target.value); setReportType(''); setReportGenerated(false); setReportData([]) }}
            placeholder="Seleccione un periodo..."
            options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
          />
        </div>
      </Card>

      {reportPeriodoId && (
        <Card>
          <h3 className="font-heading font-semibold text-inst-azul-osc mb-4">Reportes de Evaluaciones</h3>
          <div className="max-w-md">
            <Select
              label="Seleccione un tipo de reporte"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              placeholder="Seleccione un tipo de reporte..."
              options={TIPOS_REPORTE.map(t => ({ value: t.value, label: t.label }))}
            />
          </div>
        </Card>
      )}

      {reportLoading && (
        <Card>
          <EmptyState
            icon={<span className="material-icons text-3xl animate-spin">sync</span>}
            title="Generando reporte..."
          />
        </Card>
      )}

      {reportGenerated && !reportLoading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-inst-azul-osc">
              Resultado de reporte {TIPOS_REPORTE.find(t => t.value === reportType)?.label || reportType}
            </h3>
            <Button variant="primary" size="sm" onClick={descargarExcel} iconLeft={<span className="material-icons text-base">table_view</span>}>
              Descargar Excel
            </Button>
          </div>
          {reportData.length === 0 ? (
            <EmptyState
              icon={<span className="material-icons text-3xl">search_off</span>}
              title="Sin resultados"
              description="No se encontraron registros para este reporte."
            />
          ) : (
            <DataTable<ConcertacionAprobada>
              columns={reportColumns}
              data={reportData}
              rowKey={(r) => `${r.evaluado_documento}-${r.evaluador_documento}-${r.fecha_creacion}`}
              ariaLabel="Resultado de reporte"
            />
          )}
        </Card>
      )}

      <Card>
        <h3 className="font-heading font-semibold text-inst-azul-osc mb-4">Listado de evaluaciones</h3>
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
                  <th className="text-center w-16">Editar</th>
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} className={e.estado === 'definitiva' ? 'opacity-60' : ''}>
                    <td className="font-mono">#{e.periodo_id}</td>
                    <td>{e.tipo}</td>
                    <td className={puntajeColor(e.puntaje)}>
                      {e.puntaje !== null ? `${e.puntaje}%` : 'N/A'}
                    </td>
                    <td>{e.fecha_evaluacion || 'Pendiente'}</td>
                    <td>
                      <span className={estadoBadge(e.estado)}>{e.estado}</span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setEditando({ ...e })}
                        className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                        title={e.estado === 'definitiva' ? 'Editar evaluacion definitiva' : 'Editar evaluacion'}
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
      </Card>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-inst-borde">
              <h3 className="edl-section-title text-base">Editar Evaluacion #{editando.id}</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'definitiva' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Esta evaluacion es definitiva. Modifique con precaucion.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo</label>
                  <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input w-full">
                    {TIPOS_EVAL.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                  <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                    {ESTADOS_EVAL.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Puntaje (%)</label>
                <input type="number" step="0.01" min="0" max="100" value={editando.puntaje ?? ''} onChange={e => setEditando({ ...editando, puntaje: e.target.value ? parseFloat(e.target.value) : null })} className="edl-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-inst-texto-claro mb-1">Observaciones</label>
                <textarea value={editando.observaciones || ''} onChange={e => setEditando({ ...editando, observaciones: e.target.value })} className="edl-input w-full" rows={3} />
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
