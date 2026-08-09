import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Button, Select, DataTable, EmptyState } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface Evaluacion {
  id: number
  periodo_id: number
  periodo_nombre?: string
  tipo: string
  nota_funcionales?: string | null
  nota_comportamentales?: string | null
  calificacion_definitiva?: string | null
  nivel_resultado?: string | null
  estado: string
  fecha_calificacion?: string | null
  fecha_evaluacion?: string | null
  observaciones?: string | null
  evaluado_documento?: string
  evaluado_nombre?: string
  evaluador_documento?: string
  evaluador_nombre?: string
}

interface Periodo {
 id: number
 nombre: string
 anio: string
 fecha_inicio: string
 fecha_fin: string
}

type Semestre = 'primer_semestre' | 'segundo_semestre'

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

const ESTADOS_EVAL = ['pendiente', 'concertacion', 'en_proceso', 'calificada', 'aprobada_comision', 'rechazada_comision', 'cerrada', 'anulada'] as const
const TIPOS_EVAL = ['parcial_primer_semestre', 'parcial_segundo_semestre', 'parcial_eventual', 'calificacion_extraordinaria'] as const
const NIVELES_RESULTADO = ['sobresaliente', 'satisfactorio', 'no_satisfactorio'] as const

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
  const [reportSemestre, setReportSemestre] = useState<Semestre | ''>('')
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
    api.get<PaginatedData<Periodo> | Periodo[]>('/periodos?por_pagina=100')
      .then(res => {
        const items = Array.isArray(res) ? res : ((res as any)?.data ?? [])
        setPeriodos(items)
      })
      .catch(() => {})
  }, [])

  async function generarReporte() {
    if (!reportPeriodoId || !reportType || !reportSemestre) return
    setReportLoading(true)
    setReportGenerated(false)
    try {
      const params = new URLSearchParams({
        periodo_id: reportPeriodoId,
        semestre: reportSemestre,
      })
      const res = await api.get<ConcertacionAprobada[]>(`/reportes/concertaciones-aprobadas?${params.toString()}`)
      setReportData(res || [])
      setReportGenerated(true)
    } catch (e: any) {
      toast.error(e?.message || 'Error al generar el reporte')
      setReportData([])
    }
    setReportLoading(false)
  }

  async function descargarExcel() {
    if (!reportPeriodoId || !reportSemestre) return
    try {
      const params = new URLSearchParams({
        periodo_id: reportPeriodoId,
        semestre: reportSemestre,
      })
      const blob = await api.getBlob(`/reportes/excel/concertaciones-aprobadas?${params.toString()}`)
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
    if (reportPeriodoId && reportType && reportSemestre) generarReporte()
  }, [reportPeriodoId, reportType, reportSemestre])

  async function guardar() {
    if (!editando) return
    setSaving(true)
    try {
      await api.put(`/evaluaciones/${editando.id}`, {
        tipo: editando.tipo,
        nota_funcionales: editando.nota_funcionales !== undefined ? parseFloat(String(editando.nota_funcionales)) : null,
        nota_comportamentales: editando.nota_comportamentales !== undefined ? parseFloat(String(editando.nota_comportamentales)) : null,
        calificacion_definitiva: editando.calificacion_definitiva !== undefined ? parseFloat(String(editando.calificacion_definitiva)) : null,
        nivel_resultado: editando.nivel_resultado || null,
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
    if (p === null || p === undefined || isNaN(p)) return 'text-inst-texto-claro'
    if (p >= 80) return 'text-inst-azul font-semibold'
    if (p >= 60) return 'text-amber-600 font-semibold'
    return 'text-inst-rojo font-semibold'
  }

  const parsePuntaje = (raw: string | number | null | undefined): number | null => {
    if (raw === null || raw === undefined) return null
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw))
    return isNaN(n) ? null : n
  }

  const formatFecha = (raw?: string | null): string => {
    if (!raw) return 'Pendiente'
    const d = new Date(raw)
    return isNaN(d.getTime()) ? 'Pendiente' : d.toLocaleDateString('es-CO')
  }

  const formatTipo = (tipo: string): string => {
    const map: Record<string, string> = {
      'parcial_primer_semestre': 'Parcial Primer Semestre',
      'parcial_segundo_semestre': 'Parcial Segundo Semestre',
      'parcial_eventual': 'Parcial Eventual',
      'calificacion_extraordinaria': 'Calificación Extraordinaria',
    }
    return map[tipo] || tipo
  }

  const formatEstado = (estado: string): string => {
    const map: Record<string, string> = {
      'pendiente': 'Pendiente',
      'concertacion': 'En concertación',
      'en_proceso': 'En proceso',
      'calificada': 'Calificada',
      'aprobada_comision': 'Aprobada por Comisión',
      'rechazada_comision': 'Rechazada por Comisión',
      'cerrada': 'Cerrada',
      'anulada': 'Anulada',
    }
    return map[estado] || estado
  }

  const estadoBadge = (e: string) => {
    if (e === 'cerrada' || e === 'aprobada_comision' || e === 'calificada') return 'edl-badge-activo'
    if (e === 'pendiente') return 'edl-badge-pendiente'
    if (e === 'anulada' || e === 'rechazada_comision') return 'edl-badge-rojo'
    return 'edl-badge-inactivo'
  }

  const reportColumns: DataTableColumn<ConcertacionAprobada>[] = [
    { key: 'periodo', header: 'Periodo', render: (r) => r.periodo },
    { key: 'tipo_reporte', header: 'Tipo de reporte', render: () => TIPOS_REPORTE.find(t => t.value === reportType)?.label || reportType },
    { key: 'semestre', header: 'Semestre', render: () => reportSemestre === 'primer_semestre' ? 'Primer Semestre' : reportSemestre === 'segundo_semestre' ? 'Segundo Semestre' : '—' },
    { key: 'evaluado_documento', header: 'Documento del evaluado', render: (r) => r.evaluado_documento },
    { key: 'evaluado_nombre', header: 'Nombre del evaluado', render: (r) => (r as any).evaluado_nombre || r.evaluado_documento },
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
        <span className="material-icons text-inst-azul text-xl">assessment</span>
        <h2 className="edl-section-title">Evaluaciones</h2>
      </div>
      <div className="edl-divider" />
      <div className="edl-divider-accent" />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Seleccione un periodo para reportes"
            value={reportPeriodoId}
            onChange={e => { setReportPeriodoId(e.target.value); setReportSemestre(''); setReportType(''); setReportGenerated(false); setReportData([]) }}
            placeholder="Seleccione un periodo..."
            options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
          />
          <Select
            label="Semestre"
            value={reportSemestre}
            onChange={e => { setReportSemestre(e.target.value as Semestre | ''); setReportType(''); setReportGenerated(false); setReportData([]) }}
            placeholder="Seleccione un semestre..."
            disabled={!reportPeriodoId}
            options={[
              { value: 'primer_semestre', label: 'Primer semestre (Feb-Jul)' },
              { value: 'segundo_semestre', label: 'Segundo semestre (Ago-Ene)' },
            ]}
          />
          <Select
            label="Tipo de reporte"
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            placeholder="Seleccione un tipo..."
            disabled={!reportPeriodoId || !reportSemestre}
            options={TIPOS_REPORTE.map(t => ({ value: t.value, label: t.label }))}
          />
        </div>
      </Card>

      {reportLoading && (
        <Card>
          <EmptyState
            icon={<span className="material-icons text-3xl animate-spin">sync</span>}
            title="Generando reporte..."
          />
        </Card>
      )}

      {reportGenerated && reportPeriodoId && reportSemestre && reportType && !reportLoading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-inst-azul">
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
        <h3 className="font-heading font-semibold text-inst-azul mb-4">Listado de evaluaciones</h3>
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
                  <th>Nota Definitiva</th>
                  <th>Nivel</th>
                  <th>Fecha calificación</th>
                  <th>Estado</th>
                  <th className="text-center w-16">Editar</th>
                </tr>
              </thead>
              <tbody>
                {items.map(e => {
                  const nota = parsePuntaje(e.calificacion_definitiva)
                  return (
                  <tr key={e.id} className={e.estado === 'anulada' ? 'opacity-60' : ''}>
                    <td className="font-mono">{e.periodo_nombre || `#${e.periodo_id}`}</td>
                    <td>{formatTipo(e.tipo)}</td>
                    <td className={puntajeColor(nota)}>
                      {nota !== null ? `${nota.toFixed(2)}%` : 'Pendiente'}
                    </td>
                    <td>
                      {e.nivel_resultado ? (
                        <span className={`edl-badge ${e.nivel_resultado === 'sobresaliente' ? 'edl-badge-activo' : e.nivel_resultado === 'satisfactorio' ? 'edl-badge-info' : 'edl-badge-rojo'}`}>
                          {e.nivel_resultado.charAt(0).toUpperCase() + e.nivel_resultado.slice(1)}
                        </span>
                      ) : <span className="text-inst-texto-claro text-xs">—</span>}
                    </td>
                    <td>{formatFecha(e.fecha_calificacion || e.fecha_evaluacion)}</td>
                    <td>
                      <span className={estadoBadge(e.estado)}>{formatEstado(e.estado)}</span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setEditando({ ...e })}
                        className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
                        title="Editar evaluacion"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-inst-surface rounded-lg shadow-xl border border-inst-borde w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-inst-borde">
              <h3 className="edl-section-title text-base">Editar Evaluacion #{editando.id}</h3>
              <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
                <span className="material-icons text-xl text-inst-texto-claro">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editando.estado === 'cerrada' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-icons text-yellow-600">lock</span>
                  <p className="text-sm text-yellow-800 font-medium">Esta evaluacion esta cerrada. Modifique con precaucion.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo</label>
                  <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input w-full">
                    {TIPOS_EVAL.map(t => <option key={t} value={t}>{formatTipo(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
                  <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
                    {ESTADOS_EVAL.map(e => <option key={e} value={e}>{formatEstado(e)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nota Funcionales</label>
                  <input type="number" step="0.01" min="0" max="100" value={editando.nota_funcionales ?? ''} onChange={e => setEditando({ ...editando, nota_funcionales: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nota Comportamentales</label>
                  <input type="number" step="0.01" min="0" max="100" value={editando.nota_comportamentales ?? ''} onChange={e => setEditando({ ...editando, nota_comportamentales: e.target.value })} className="edl-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Calificacion Definitiva</label>
                  <input type="number" step="0.01" min="0" max="100" value={editando.calificacion_definitiva ?? ''} onChange={e => setEditando({ ...editando, calificacion_definitiva: e.target.value })} className="edl-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nivel de Resultado</label>
                  <select value={editando.nivel_resultado || ''} onChange={e => setEditando({ ...editando, nivel_resultado: e.target.value || null })} className="edl-input w-full">
                    <option value="">— Sin definir —</option>
                    {NIVELES_RESULTADO.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
                  </select>
                </div>
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
