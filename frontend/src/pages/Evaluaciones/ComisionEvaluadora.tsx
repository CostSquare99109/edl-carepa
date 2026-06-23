import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tabs, TabPanel, SkeletonText, Tooltip } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface EvaluacionComision {
 id: number
 evaluado_nombre: string
 evaluado_documento: string
 evaluado_cargo: string
 evaluado_dependencia: string
 evaluador_nombre: string
 tipo: string
 estado: string
 calificacion_definitiva: number | null
 nota_funcionales: number | null
 nota_comportamentales: number | null
 nivel_resultado: string | null
 periodo_nombre: string
}

const NIVEL_LABEL: Record<string, { text: string; tone: 'success' | 'info' | 'danger' }> = {
 sobresaliente: { text: 'Sobresaliente', tone: 'success' },
 satisfactorio: { text: 'Satisfactorio', tone: 'info' },
 no_satisfactorio: { text: 'No Satisfactorio', tone: 'danger' },
}

type TabKey = 'por_aprobar' | 'aprobadas' | 'rechazadas';

export default function ComisionEvaluadora() {
 const { rolActivo } = useAuth()
 const [evaluaciones, setEvaluaciones] = useState<EvaluacionComision[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [cargando, setCargando] = useState(true)
 const [tabActiva, setTabActiva] = useState<TabKey>('por_aprobar')
 const [busqueda, setBusqueda] = useState('')
 const [modalAprobar, setModalAprobar] = useState<EvaluacionComision | null>(null)
 const [observaciones, setObservaciones] = useState('')
 const [procesando, setProcesando] = useState(false)

 const estadoMap: Record<TabKey, string> = {
 por_aprobar: 'calificada',
 aprobadas: 'aprobada_comision',
 rechazadas: 'rechazada_comision',
 };

 useEffect(() => { cargarEvaluaciones() }, [pagina, tabActiva])

 async function cargarEvaluaciones() {
 setCargando(true)
 try {
 const estado = estadoMap[tabActiva];
 let url = `/evaluaciones?por_pagina=20&pagina=${pagina}`
 if (estado) url += `&estado=${estado}`
 if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
 const res = await api.get<PaginatedData<EvaluacionComision>>(url)
 setEvaluaciones(res.data || [])
 setTotal(res.total || 0)
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al cargar evaluaciones')
 } finally {
 setCargando(false)
 }
 }

 async function aprobarEvaluacion(accion: 'aprobar' | 'rechazar') {
 if (!modalAprobar) return
 if (accion === 'rechazar' && !observaciones.trim()) {
 toast.error('Las observaciones son obligatorias al rechazar')
 return
 }
 setProcesando(true)
 try {
 await api.put(`/evaluaciones/${modalAprobar.id}/comision`, {
 accion,
 observaciones,
 })
 toast.success(accion === 'aprobar' ? 'La Comisión Evaluadora aprobó correctamente la evaluación. La calificación queda en firme.' : 'La Comisión Evaluadora rechazó la evaluación. Se notificará al evaluador para los ajustes pertinentes.')
 setModalAprobar(null)
 setObservaciones('')
 cargarEvaluaciones()
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al procesar la evaluación')
 }
 setProcesando(false)
 }

 const totalPages = Math.ceil(total / 20)

 const columns: DataTableColumn<EvaluacionComision>[] = [
 {
 key: 'evaluado',
 header: 'Evaluado',
 render: (ev) => (
 <div>
 <div className="font-medium text-inst-texto">{ev.evaluado_nombre}</div>
 <div className="text-xs text-inst-texto-claro">{ev.evaluado_documento}</div>
 </div>
 ),
 },
 { key: 'cargo', header: 'Cargo', render: (ev) => <span className="text-sm">{ev.evaluado_cargo}</span> },
 { key: 'dependencia', header: 'Dependencia', render: (ev) => <span className="text-sm">{ev.evaluado_dependencia}</span> },
 { key: 'evaluador', header: 'Evaluador', render: (ev) => <span className="text-sm">{ev.evaluador_nombre}</span> },
 {
 key: 'nota',
 header: 'Definitiva',
 align: 'center',
 render: (ev) => ev.calificacion_definitiva !== null ? (
 <span className="font-bold text-inst-azul-osc">{ev.calificacion_definitiva}%</span>
 ) : <span className="text-inst-texto-claro">-</span>,
 },
 {
 key: 'nivel',
 header: 'Nivel',
 render: (ev) => {
 const nivel = ev.nivel_resultado ? NIVEL_LABEL[ev.nivel_resultado] : null;
 return nivel ? <Badge tone={nivel.tone}>{nivel.text}</Badge> : <span className="text-inst-texto-claro">-</span>;
 },
 },
 {
 key: 'periodo',
 header: 'Período',
 render: (ev) => <span className="text-sm">{ev.periodo_nombre}</span>,
 },
 {
 key: 'acciones',
 header: 'Acciones',
 align: 'center',
 render: (ev) => (
 <Tooltip content="Revisar y aprobar/rechazar">
 <Button
 variant="primary"
 size="sm"
 onClick={() => { setModalAprobar(ev); setObservaciones(''); }}
 iconLeft={<span className="material-icons text-sm">rate_review</span>}
 >
 Revisar
 </Button>
 </Tooltip>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 <div className="animate-fadeIn">
 <div className="flex items-center gap-2 mb-1">
 <span className="material-icons text-inst-azul-osc text-xl">gavel</span>
 <h2 className="edl-section-title">Comisión Evaluadora</h2>
 </div>
 <p className="text-sm text-inst-texto-claro ml-7">
 Revisión y aprobación de evaluaciones calificadas. Hasta que la Comisión no apruebe, las evaluaciones no quedan en firme.
 </p>
 </div>

 <Card>
 <Alert tone="info" className="mb-4">
 <span className="text-sm">
 Seleccione una pestaña para ver las evaluaciones en cada estado. Use el buscador para filtrar por evaluado.
 </span>
 </Alert>
 <div className="flex flex-wrap items-end gap-4 mb-4">
 <div className="flex-1 min-w-[240px]">
 <Input
 label="Buscar evaluado"
 type="search"
 value={busqueda}
 onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
 onKeyDown={e => e.key === 'Enter' && cargarEvaluaciones()}
 placeholder="Nombre o documento..."
 iconLeft={<span className="material-icons text-base">search</span>}
 />
 </div>
 <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-sm">refresh</span>} onClick={cargarEvaluaciones}>
 Actualizar
 </Button>
 </div>

 <Tabs
 ariaLabel="Estado de evaluaciones"
 items={[
 { key: 'por_aprobar', label: 'Por aprobar' },
 { key: 'aprobadas', label: 'Aprobadas' },
 { key: 'rechazadas', label: 'Rechazadas' },
 ]}
 activeKey={tabActiva}
 onChange={(k) => { setTabActiva(k as TabKey); setPagina(1); }}
 variant="underline"
 />

 <div className="mt-4">
 <TabPanel tabKey={tabActiva} activeKey={tabActiva}>
 {cargando ? (
 <SkeletonText lines={6} />
 ) : evaluaciones.length === 0 ? (
 <EmptyState
 icon={<span className="material-icons text-3xl">assignment_turned_in</span>}
 title={
 tabActiva === 'por_aprobar' ? 'Sin evaluaciones por aprobar'
 : tabActiva === 'aprobadas' ? 'Sin evaluaciones aprobadas'
 : 'Sin evaluaciones rechazadas'
 }
 description={
 tabActiva === 'por_aprobar'
 ? 'Todas las evaluaciones han sido procesadas. Cuando haya nuevas, aparecerán aquí.'
 : undefined
 }
 />
 ) : (
 <DataTable<EvaluacionComision>
 columns={columns}
 data={evaluaciones}
 rowKey={(ev) => ev.id}
 ariaLabel={`Evaluaciones ${tabActiva.replace('_', ' ')}`}
 />
 )}
 </TabPanel>
 </div>

 {totalPages > 1 && !cargando && evaluaciones.length > 0 ? (
 <div className="flex items-center justify-center gap-2 p-3 mt-3 border-t border-inst-borde">
 {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
 <button
 key={p}
 onClick={() => setPagina(p)}
 className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul-osc text-white' : 'bg-white border hover:bg-inst-gris'}`}
 >
 {p}
 </button>
 ))}
 </div>
 ) : null}
 </Card>

 {modalAprobar ? (
 <Modal
 open={true}
 onClose={() => setModalAprobar(null)}
 title="Revisión de Evaluación"
 description={`${modalAprobar.evaluado_nombre} — ${modalAprobar.evaluado_cargo}`}
 size="lg"
 >
 <Card className="border-l-4 border-l-inst-azul-osc mb-4">
 <div className="grid grid-cols-3 gap-4 text-center">
 <div>
 <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Funcionales</p>
 <p className="text-2xl font-bold text-inst-azul-osc">{modalAprobar.nota_funcionales ?? '-'}%</p>
 </div>
 <div>
 <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Comportamentales</p>
 <p className="text-2xl font-bold text-inst-azul-osc">{modalAprobar.nota_comportamentales ?? '-'}%</p>
 </div>
 <div>
 <p className="text-xs text-inst-texto-claro uppercase tracking-wide">Definitiva</p>
 <p className="text-2xl font-bold text-inst-texto">{modalAprobar.calificacion_definitiva ?? '-'}%</p>
 </div>
 </div>
 {modalAprobar.nivel_resultado && NIVEL_LABEL[modalAprobar.nivel_resultado] ? (
 <div className="text-center mt-3">
 <Badge tone={NIVEL_LABEL[modalAprobar.nivel_resultado].tone} className="text-sm px-3 py-1">
 {NIVEL_LABEL[modalAprobar.nivel_resultado].text}
 </Badge>
 </div>
 ) : null}
 </Card>
 <div>
 <label htmlFor="obs-comision" className="edl-label">
 Observaciones
 <span className="text-inst-texto-claro text-xs font-normal"> (obligatorias al rechazar)</span>
 </label>
 <textarea
 id="obs-comision"
 value={observaciones}
 onChange={e => setObservaciones(e.target.value)}
 className="edl-input min-h-[100px]"
 placeholder="Observaciones de la comisión evaluadora..."
 />
 </div>
 <div className="flex justify-between pt-4 mt-4 border-t border-inst-borde">
 <Button variant="outline" onClick={() => setModalAprobar(null)}>Cancelar</Button>
 <div className="flex gap-3">
 <Button
 variant="danger"
 loading={procesando}
 onClick={() => aprobarEvaluacion('rechazar')}
 >
 Rechazar
 </Button>
 <Button
 variant="primary"
 loading={procesando}
 onClick={() => aprobarEvaluacion('aprobar')}
 iconLeft={<span className="material-icons text-base">check</span>}
 >
 Aprobar
 </Button>
 </div>
 </div>
 </Modal>
 ) : null}
 </div>
 )
}
