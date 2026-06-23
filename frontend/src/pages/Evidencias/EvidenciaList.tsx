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
  registrado_por: number
  registrado_nombre?: string
  creado_en: string
  periodo_nombre?: string
}

interface Evaluado {
  id: number
  documento: string
  primer_nombre: string
  primer_apellido: string
  denominacion_empleo: string
  dependencia: string
  evaluador_nombre: string
  evaluacion_id?: number
  concertacion_id?: number
  periodo_id?: number
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
  const [formCompromisoId, setFormCompromisoId] = useState<number | ''>('')
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

  useEffect(() => { cargarPeriodos() }, [cargarPeriodos])

  // Cargar evidencias filtradas por evaluado y periodo
  const cargarEvidencias = useCallback(async () => {
    if (!evaluado?.id || !periodoId) {
      setItems([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await api.get<PaginatedData<Evidencia>>(
        `/evidencias?evaluado_id=${evaluado.id}&periodo_id=${periodoId}&pagina=${pagina}&por_pagina=20`
      )
      setItems(res.data || [])
      setTotal(res.total || 0)
    } catch {}
    setLoading(false)
  }, [evaluado?.id, periodoId, pagina])

  useEffect(() => { cargarEvidencias() }, [cargarEvidencias])

  async function buscarEvaluado() {
    if (!documento.trim() || !periodoId) {
      setErrorBusqueda('Debe seleccionar un período e ingresar un documento.')
      return
    }
    setBuscando(true)
    setErrorBusqueda('')
    setEvaluado(null)
    setCompromisos([])
    try {
      const data = await api.get(`/compromisos/buscar-evaluado?documento=${documento.trim()}&periodo_id=${periodoId}`) as { evaluado?: Evaluado }
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
        setErrorBusqueda('No se encontró un evaluado con ese documento en el período seleccionado.')
      }
    } catch (e) {
      setErrorBusqueda(e instanceof Error ? e.message : 'Error en la búsqueda')
    }
    setBuscando(false)
  }

  async function cargarCompromisosEvaluado() {
    if (!evaluado?.id || !periodoId) return
    try {
      const res = await api.get<PaginatedData<Compromiso>>(
        `/evidencias/compromisos-evaluado?evaluado_id=${evaluado.id}&periodo_id=${periodoId}`
      )
      setCompromisos(res.data || [])
    } catch {}
  }

  // Cuando cambia el evaluado o periodo, recargar compromisos disponibles
  useEffect(() => {
    if (evaluado?.id && periodoId) {
      cargarCompromisosEvaluado()
    }
  }, [evaluado?.id, periodoId])

  async function guardarEvidencia() {
    setSubmitted(true)
    if (!formCompromisoId || !formDescripcion.trim() || !formUbicacion.trim()) {
      toast.error('Compromiso, descripción y ubicación son obligatorios.')
      return
    }
    if (!evaluado?.concertacion_id) {
      toast.error('El evaluado no tiene una concertación activa en este período.')
      return
    }
    setGuardando(true)
    try {
      const compromisoSel = compromisos.find(c => c.id === Number(formCompromisoId))
      await api.post('/evidencias', {
        periodo_id: periodoId,
        compromiso_id: Number(formCompromisoId),
        compromiso_competencia: compromisoSel?.descripcion || compromisoSel?.compromiso_competencia || '',
        descripcion: formDescripcion.trim(),
        ubicacion: formUbicacion.trim(),
        observacion: formObservacion.trim() || null,
        tipo: compromisoSel?.tipo || 'compromiso',
      })
      toast.success('La creación de la evidencia se realizó correctamente.')
      setMostrarForm(false)
      setSubmitted(false)
      setFormCompromisoId('')
      setFormDescripcion('')
      setFormUbicacion('')
      setFormObservacion('')
      cargarEvidencias()
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
      toast.success('La evidencia se actualizó correctamente')
      setEditando(null)
      cargarEvidencias()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar')
    }
    setGuardando(false)
  }

  const totalPages = Math.ceil(total / 20)

  const columns: DataTableColumn<Evidencia>[] = [
    {
      key: 'compromiso',
      header: 'Compromiso / Competencia',
      render: (ev) => <span className="max-w-[250px] truncate inline-block">{ev.compromiso_competencia || '-'}</span>,
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (ev) => <span className="max-w-[300px] truncate inline-block">{ev.descripcion || '-'}</span>,
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      render: (ev) => ev.ubicacion ? (
        ev.ubicacion.startsWith('http') ? (
          <a href={ev.ubicacion} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline inline-flex items-center gap-1 max-w-[200px] truncate">
            <span className="material-icons text-sm">open_in_new</span>
            {ev.ubicacion}
          </a>
        ) : (
          <span className="max-w-[200px] truncate inline-block">{ev.ubicacion}</span>
        )
      ) : <span className="text-inst-texto-claro">-</span>,
    },
    {
      key: 'observacion',
      header: 'Observación',
      render: (ev) => <span className="max-w-[200px] truncate inline-block">{ev.observacion || '-'}</span>,
    },
    {
      key: 'periodo',
      header: 'Período',
      render: (ev) => <span className="text-xs">{ev.periodo_nombre || '-'}</span>,
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
            className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul-osc hover:text-inst-azul-osc"
            aria-label="Editar evidencia"
          >
            <span className="material-icons text-lg">edit</span>
          </button>
        </Tooltip>
      ),
    },
  ]

  const puedeCrear = evaluado && !!evaluado.concertacion_id
  const compromisoSeleccionado = compromisos.find(c => c.id === Number(formCompromisoId))

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul-osc text-xl">folder_open</span>
          <h2 className="edl-section-title">Evidencias</h2>
        </div>
        <p className="text-sm text-inst-texto-claro ml-7">
          Registro descriptivo de soportes de cumplimiento. No se cargan archivos al aplicativo: solo se registra el compromiso/competencia, la descripción, la ubicación (física o digital) y observaciones.
        </p>
      </div>

      {/* Paso 1: Selección de período */}
      <Card>
        <Alert tone="info" className="mb-4">
          <span className="text-sm">
            <strong>Paso 1:</strong> Seleccione el período de evaluación y busque el evaluado por número de documento.
          </span>
        </Alert>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Período de evaluación *"
              value={periodoId || ''}
              onChange={e => {
                const val = Number(e.target.value)
                setPeriodoId(val)
                setEvaluado(null)
                setCompromisos([])
                setErrorBusqueda('')
              }}
              placeholder="Seleccione un período"
              options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
              helperText="Requerido para filtrar evaluados y compromisos"
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <Input
              label="Documento del evaluado *"
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
                  disabled={!documento.trim() || !periodoId}
                  onClick={buscarEvaluado}
                >
                  Buscar
                </Button>
              }
            />
          </div>
        </div>
      </Card>

      {/* Paso 2: Info del evaluado y compromisos disponibles */}
      {evaluado && (
        <Card className="border-l-4 border-l-inst-azul-osc">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-inst-azul-osc text-xl">account_circle</span>
            <span className="font-heading font-bold text-inst-texto">{evaluado.primer_nombre} {evaluado.primer_apellido}</span>
            <Badge tone="info">{evaluado.documento}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-4">
            <div><span className="text-inst-texto-claro">Cargo:</span> <span className="font-medium">{evaluado.denominacion_empleo}</span></div>
            <div><span className="text-inst-texto-claro">Dependencia:</span> <span className="font-medium">{evaluado.dependencia}</span></div>
            <div><span className="text-inst-texto-claro">Evaluador:</span> <span className="font-medium">{evaluado.evaluador_nombre}</span></div>
            <div><span className="text-inst-texto-claro">Compromisos disp.:</span> <span className="font-medium">{compromisos.length}</span></div>
          </div>

          {!evaluado.concertacion_id && (
            <Alert tone="warning" className="mb-4">
              <span className="text-sm">
                Este evaluado no tiene una concertación activa en el período seleccionado.
                No se pueden registrar evidencias hasta que exista una concertación con compromisos aprobados.
              </span>
            </Alert>
          )}

          {puedeCrear && (
            <Alert tone="success" className="mb-4">
              <span className="text-sm">
                <strong>Paso 2:</strong> Seleccione un compromiso/competencia aprobado y complete el formulario de evidencia.
              </span>
            </Alert>
          )}
        </Card>
      )}

      {/* Paso 3: Formulario de creación de evidencia */}
      {mostrarForm && evaluado && puedeCrear && (
        <Card className="border border-inst-azul-osc/20 bg-inst-azul/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-inst-azul-osc">Registrar evidencia</h3>
            <Button variant="ghost" size="sm" iconLeft={<span className="material-icons">close</span>} onClick={() => { setMostrarForm(false); setSubmitted(false); }}>
              Cerrar
            </Button>
          </div>
          <div className="space-y-3">
            <Select
              label="Compromiso o competencia *"
              required
              value={formCompromisoId}
              onChange={e => setFormCompromisoId(e.target.value ? Number(e.target.value) : '')}
              placeholder="Seleccione un compromiso o competencia"
              options={compromisos.map(c => ({
                value: String(c.id),
                label: `${c.tipo === 'funcional' ? '📋 Funcional' : '🧠 Comportamental'}: ${(c.compromiso_competencia || c.descripcion).slice(0, 120)}`,
              }))}
              error={submitted && !formCompromisoId ? 'Campo obligatorio' : undefined}
              helperText={compromisoSeleccionado ? `Tipo: ${compromisoSeleccionado.tipo}` : undefined}
            />

            <div>
              <label htmlFor="ev-desc" className="edl-label">
                Descripción de la evidencia <span className="text-inst-rojo">*</span>
              </label>
              <textarea
                id="ev-desc"
                value={formDescripcion}
                onChange={e => setFormDescripcion(e.target.value)}
                className="edl-input min-h-[80px]"
                placeholder="Detalle del elemento, documento o soporte que demuestra el cumplimiento o incumplimiento"
              />
              {submitted && !formDescripcion.trim() && (
                <p className="mt-1 text-xs text-inst-rojo flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span> Campo obligatorio
                </p>
              )}
            </div>

            <Input
              label="Ubicación (física o virtual) *"
              type="text"
              required
              value={formUbicacion}
              onChange={e => setFormUbicacion(e.target.value)}
              placeholder="Ej: Archivo central, Caja 12, Carpeta 3 — o https://drive.google.com/..."
              helperText="Campo obligatorio. Ubicación física (archivo, estante, caja) o enlace digital (Drive, SharePoint, etc.)"
              error={submitted && !formUbicacion.trim() ? 'Campo obligatorio' : undefined}
            />

            <div>
              <label htmlFor="ev-obs" className="edl-label">Observación (opcional)</label>
              <textarea
                id="ev-obs"
                value={formObservacion}
                onChange={e => setFormObservacion(e.target.value)}
                className="edl-input min-h-[60px]"
                placeholder="Observaciones adicionales sobre la evidencia"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setMostrarForm(false); setSubmitted(false); }}>Cancelar</Button>
              <Button variant="primary" loading={guardando} onClick={guardarEvidencia}>Guardar evidencia</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de evidencias filtradas */}
      <Card>
        {loading ? (
          <SkeletonText lines={6} />
        ) : !evaluado ? (
          <EmptyState
            icon={<span className="material-icons text-3xl">search</span>}
            title="Busque un evaluado para ver sus evidencias"
            description="Seleccione un período e ingrese el número de documento para filtrar las evidencias registradas."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<span className="material-icons text-3xl">folder_off</span>}
            title="Sin evidencias registradas"
            description="No hay evidencias para este evaluado en el período seleccionado. Use el botón «Registrar evidencia» para crear la primera."
          />
        ) : (
          <DataTable<Evidencia>
            columns={columns}
            data={items}
            rowKey={(ev) => ev.id}
            ariaLabel="Lista de evidencias"
            caption={`Evidencias de ${evaluado.primer_nombre} ${evaluado.primer_apellido} (${evaluado.documento})`}
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

      {/* Modal editar evidencia */}
      {editando && (
        <Modal open={true} onClose={() => setEditando(null)} title="Editar Evidencia" size="md">
          <div className="space-y-3">
            <Input
              label="Compromiso o competencia"
              value={editando.compromiso_competencia || ''}
              onChange={e => setEditando({ ...editando, compromiso_competencia: e.target.value })}
              disabled
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
            <Button variant="primary" loading={guardando} onClick={actualizarEvidencia}>Guardar cambios</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}