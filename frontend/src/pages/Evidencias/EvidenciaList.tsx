import { useState, useEffect, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface Compromiso {
 id: number
 tipo: string
 descripcion: string
 compromiso_competencia?: string
}

interface Evidencia {
 id: number
 concertacion_id: number
 compromiso_id: number | null
 compromiso_competencia: string
 descripcion: string
 ubicacion: string | null
 observacion: string | null
 tipo: string
 estado: string
 registrado_por: number
 registrado_nombre?: string
 creado_en: string
}

interface Evaluado {
 id: number
 documento: string
 nombres: string
 apellidos: string
 cargo: string
 dependencia: string
 evaluador_nombre: string
 evaluacion_id?: number
}

export default function EvidenciaList() {
 const { rolActivo } = useAuth()
 const [items, setItems] = useState<Evidencia[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)

 const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([])
 const [periodoId, setPeriodoId] = useState(0)
 const [documento, setDocumento] = useState('')
 const [evaluado, setEvaluado] = useState<Evaluado | null>(null)
 const [buscando, setBuscando] = useState(false)
 const [errorBusqueda, setErrorBusqueda] = useState('')

 const [compromisos, setCompromisos] = useState<Compromiso[]>([])

 const [mostrarForm, setMostrarForm] = useState(false)
 const [formCompromiso, setFormCompromiso] = useState('')
 const [formDescripcion, setFormDescripcion] = useState('')
 const [formUbicacion, setFormUbicacion] = useState('')
 const [formObservacion, setFormObservacion] = useState('')
 const [guardando, setGuardando] = useState(false)
 const [submitted, setSubmitted] = useState(false)

 const [editando, setEditando] = useState<Evidencia | null>(null)

 const cargarPeriodos = useCallback(async () => {
 try {
 const res = await api.get<PaginatedData<{ id: number; nombre: string }>>('/periodos?por_pagina=50')
 setPeriodos(res.data || [])
 } catch {}
 }, [])

 useEffect(() => { cargarPeriodos(); cargar() }, [cargarPeriodos])

 async function cargar() {
 setLoading(true)
 try {
 const res = await api.get<PaginatedData<Evidencia>>(`/evidencias?pagina=${pagina}&por_pagina=20`)
 setItems(res.data || [])
 setTotal(res.total || 0)
 } catch {}
 setLoading(false)
 }

 async function buscarEvaluado() {
 if (!documento.trim()) return
 setBuscando(true)
 setErrorBusqueda('')
 setEvaluado(null)
 setCompromisos([])
 try {
 const data = await api.get(`/compromisos/buscar-evaluado?documento=${documento.trim()}`) as { evaluado?: Evaluado }
 if (data.evaluado) {
 setEvaluado(data.evaluado)
 if (data.evaluado.evaluacion_id) {
 const compRes = await api.get<PaginatedData<Compromiso>>(
 `/compromisos/evaluacion/${data.evaluado.evaluacion_id}?por_pagina=50`
 )
 setCompromisos(compRes.data || [])
 }
 toast.success('Evaluado encontrado')
 } else {
 setErrorBusqueda('No se encontró un evaluado con ese documento.')
 }
 } catch (e) {
 setErrorBusqueda(e instanceof Error ? e.message : 'Error en la búsqueda')
 }
 setBuscando(false)
 }

 async function guardarEvidencia() {
 setSubmitted(true)
 if (!formCompromiso || !formDescripcion.trim() || !formUbicacion.trim()) {
 toast.error('Compromiso, descripción y ubicación son obligatorios.')
 return
 }
 setGuardando(true)
 try {
 const compromisoSel = compromisos.find(c => c.descripcion === formCompromiso || c.compromiso_competencia === formCompromiso)
 await api.post('/evidencias', {
 concertacion_id: evaluado?.evaluacion_id || 0,
 compromiso_id: compromisoSel?.id || null,
 compromiso_competencia: formCompromiso,
 descripcion: formDescripcion.trim(),
 ubicacion: formUbicacion.trim() || null,
 observacion: formObservacion.trim() || null,
 tipo: compromisoSel?.tipo || 'general',
 })
 toast.success('Evidencia registrada correctamente')
 setMostrarForm(false)
 setSubmitted(false)
 setFormCompromiso('')
 setFormDescripcion('')
 setFormUbicacion('')
 setFormObservacion('')
 cargar()
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al guardar evidencia')
 }
 setGuardando(false)
 }

 async function actualizarEvidencia() {
 if (!editando) return
 setGuardando(true)
 try {
 await api.put(`/evidencias/${editando.id}`, {
 descripcion: editando.descripcion,
 ubicacion: editando.ubicacion,
 observacion: editando.observacion,
 compromiso_competencia: editando.compromiso_competencia,
 })
 toast.success('Evidencia actualizada')
 setEditando(null)
 cargar()
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al actualizar')
 }
 setGuardando(false)
 }

 const totalPages = Math.ceil(total / 20)

 const columns: DataTableColumn<Evidencia>[] = [
 {
 key: 'compromiso',
 header: 'Compromiso/Competencia',
 render: (ev) => <span className="max-w-[200px] truncate inline-block">{ev.compromiso_competencia || '-'}</span>,
 },
 {
 key: 'descripcion',
 header: 'Descripción',
 render: (ev) => <span className="max-w-[250px] truncate inline-block">{ev.descripcion || '-'}</span>,
 },
 {
 key: 'ubicacion',
 header: 'Ubicación',
 render: (ev) => ev.ubicacion ? (
 ev.ubicacion.startsWith('http') ? (
 <a href={ev.ubicacion} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline inline-flex items-center gap-1 max-w-[150px] truncate">
 <span className="material-icons text-sm">open_in_new</span>
 {ev.ubicacion}
 </a>
 ) : (
 <span className="max-w-[150px] truncate inline-block">{ev.ubicacion}</span>
 )
 ) : <span className="text-inst-texto-claro">-</span>,
 },
 {
 key: 'observacion',
 header: 'Observación',
 render: (ev) => <span className="max-w-[150px] truncate inline-block">{ev.observacion || '-'}</span>,
 },
 { key: 'registrado', header: 'Registrado por', render: (ev) => ev.registrado_nombre || '-' },
 { key: 'fecha', header: 'Fecha', render: (ev) => <span className="text-xs">{new Date(ev.creado_en).toLocaleDateString('es-CO')}</span> },
 {
 key: 'editar',
 header: 'Editar',
 align: 'center',
 render: (ev) => (
 <Tooltip content="Editar evidencia">
 <button
 onClick={() => setEditando({ ...ev })}
 className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul-osc hover:text-inst-verde"
 aria-label="Editar evidencia"
 >
 <span className="material-icons text-lg">edit</span>
 </button>
 </Tooltip>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 <div className="animate-fadeIn">
 <div className="flex items-center gap-2 mb-1">
 <span className="material-icons text-inst-azul-osc text-xl">folder_open</span>
 <h2 className="edl-section-title">Evidencias</h2>
 </div>
 <p className="text-sm text-inst-texto-claro ml-7">
 Registro descriptivo de soportes de cumplimiento. No se cargan archivos: solo se registra el compromiso/competencia, la descripción, la ubicación (física o digital) y observaciones.
 </p>
 </div>

 <Card>
 <Alert tone="info" className="mb-4">
 <span className="text-sm">
 Busque un evaluado por documento para ver y registrar sus evidencias. El botón <strong>Crear evidencia</strong> aparecerá cuando haya un evaluado seleccionado.
 </span>
 </Alert>
 <div className="flex flex-wrap items-end gap-4">
 <div className="flex-1 min-w-[180px]">
 <Select
 label="Período"
 value={periodoId || ''}
 onChange={e => setPeriodoId(Number(e.target.value))}
 placeholder="Seleccione un período"
 options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
 helperText="Filtra las evidencias por período"
 />
 </div>
 <div className="flex-1 min-w-[200px]">
 <Input
 label="Documento del evaluado"
 type="text"
 value={documento}
 onChange={e => setDocumento(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
 placeholder="Número de documento"
 error={errorBusqueda || undefined}
 iconRight={
 <Button
 variant="primary"
 size="sm"
 loading={buscando}
 disabled={!documento.trim()}
 onClick={buscarEvaluado}
 >
 Buscar
 </Button>
 }
 />
 </div>
 {evaluado && !mostrarForm ? (
 <Button variant="primary" iconLeft={<span className="material-icons text-sm">add</span>} onClick={() => setMostrarForm(true)}>
 Crear evidencia
 </Button>
 ) : null}
 </div>
 </Card>

 {evaluado ? (
 <Card className="border-l-4 border-l-inst-azul-osc">
 <div className="flex items-center gap-2 mb-3">
 <span className="material-icons text-inst-azul-osc text-xl">account_circle</span>
 <span className="font-heading font-bold text-inst-texto">{evaluado.nombres} {evaluado.apellidos}</span>
 <Badge tone="info">{evaluado.documento}</Badge>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
 <div><span className="text-inst-texto-claro">Cargo:</span> <span className="font-medium">{evaluado.cargo}</span></div>
 <div><span className="text-inst-texto-claro">Dependencia:</span> <span className="font-medium">{evaluado.dependencia}</span></div>
 <div><span className="text-inst-texto-claro">Evaluador:</span> <span className="font-medium">{evaluado.evaluador_nombre}</span></div>
 <div><span className="text-inst-texto-claro">Compromisos:</span> <span className="font-medium">{compromisos.length}</span></div>
 </div>
 </Card>
 ) : null}

 {mostrarForm && evaluado ? (
 <Card className="border border-inst-azul-osc/20">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-heading font-semibold text-inst-azul-osc">Crear evidencia</h3>
 <Button variant="ghost" size="sm" iconLeft={<span className="material-icons">close</span>} onClick={() => { setMostrarForm(false); setSubmitted(false); }}>
 Cerrar
 </Button>
 </div>
 <div className="space-y-3">
 <Select
 label="Compromiso o competencia"
 required
 value={formCompromiso}
 onChange={e => setFormCompromiso(e.target.value)}
 placeholder="Seleccione un compromiso o competencia"
 options={compromisos.map(c => ({
 value: c.compromiso_competencia || c.descripcion,
 label: (c.compromiso_competencia || c.descripcion).slice(0, 100),
 }))}
 error={submitted && !formCompromiso ? 'Campo obligatorio' : undefined}
 />

 <div>
 <label htmlFor="ev-desc" className="edl-label">
 Descripción <span className="text-inst-rojo">*</span>
 </label>
 <textarea
 id="ev-desc"
 value={formDescripcion}
 onChange={e => setFormDescripcion(e.target.value)}
 className="edl-input min-h-[80px]"
 placeholder="Detalle de la evidencia o soporte"
 />
 {submitted && !formDescripcion.trim() ? (
 <p className="mt-1 text-xs text-inst-rojo flex items-center gap-1" role="alert">
 <span aria-hidden="true">⚠</span> Campo obligatorio
 </p>
 ) : null}
 </div>

 <Input
 label="Ubicación"
 type="text"
 required
 value={formUbicacion}
 onChange={e => setFormUbicacion(e.target.value)}
 placeholder="Ubicación física (ej: Archivo central, Caja 12) o link digital (https://...)"
 helperText="Campo obligatorio. Puede ser una ubicación física o un enlace."
 error={submitted && !formUbicacion.trim() ? 'Campo obligatorio' : undefined}
 />

 <div>
 <label htmlFor="ev-obs" className="edl-label">Observación (opcional)</label>
 <textarea
 id="ev-obs"
 value={formObservacion}
 onChange={e => setFormObservacion(e.target.value)}
 className="edl-input min-h-[60px]"
 placeholder="Observaciones adicionales"
 />
 </div>

 <div className="flex justify-end gap-3 pt-2">
 <Button variant="outline" onClick={() => { setMostrarForm(false); setSubmitted(false); }}>Cancelar</Button>
 <Button variant="primary" loading={guardando} onClick={guardarEvidencia}>Guardar evidencia</Button>
 </div>
 </div>
 </Card>
 ) : null}

 <Card>
 {loading ? (
 <SkeletonText lines={6} />
 ) : items.length === 0 ? (
 <EmptyState
 icon={<span className="material-icons text-3xl">folder_off</span>}
 title="Sin evidencias registradas"
 description="Aún no se han registrado evidencias. Busque un evaluado para comenzar."
 />
 ) : (
 <DataTable<Evidencia>
 columns={columns}
 data={items}
 rowKey={(ev) => ev.id}
 ariaLabel="Lista de evidencias"
 caption="Evidencias registradas"
 />
 )}

 {totalPages > 1 && !loading && items.length > 0 ? (
 <div className="flex items-center justify-center gap-2 p-3 mt-2">
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

 {editando ? (
 <Modal open={true} onClose={() => setEditando(null)} title="Editar Evidencia" size="md">
 <div className="space-y-3">
 <Input
 label="Compromiso o competencia"
 value={editando.compromiso_competencia || ''}
 onChange={e => setEditando({ ...editando, compromiso_competencia: e.target.value })}
 />
 <div>
 <label htmlFor="ev-edit-desc" className="edl-label">Descripción</label>
 <textarea
 id="ev-edit-desc"
 value={editando.descripcion || ''}
 onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
 className="edl-input min-h-[80px]"
 />
 </div>
 <Input
 label="Ubicación"
 value={editando.ubicacion || ''}
 onChange={e => setEditando({ ...editando, ubicacion: e.target.value })}
 />
 <div>
 <label htmlFor="ev-edit-obs" className="edl-label">Observación</label>
 <textarea
 id="ev-edit-obs"
 value={editando.observacion || ''}
 onChange={e => setEditando({ ...editando, observacion: e.target.value })}
 className="edl-input min-h-[60px]"
 />
 </div>
 </div>
 <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
 <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
 <Button variant="primary" loading={guardando} onClick={actualizarEvidencia}>Guardar</Button>
 </div>
 </Modal>
 ) : null}
 </div>
 )
}
