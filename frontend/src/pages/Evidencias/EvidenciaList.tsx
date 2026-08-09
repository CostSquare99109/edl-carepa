import { useState, useEffect, useCallback, useRef } from 'react'
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

interface EvaluadoSlim {
  id: number
  documento: string
  nombre_completo: string
  denominacion_empleo: string
  dependencia_nombre: string
  evaluacion_id: number | null
  concertacion_id: number | null
}

export default function EvidenciaList() {
  const { usuario, rolActivo } = useAuth()
  const [items, setItems] = useState<Evidencia[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)

  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([])
  const [periodoId, setPeriodoId] = useState(0)

  const [busquedaQ, setBusquedaQ] = useState('')
  const [resultados, setResultados] = useState<EvaluadoSlim[]>([])
  const [mostrarDrop, setMostrarDrop] = useState(false)
  const [buscandoEval, setBuscandoEval] = useState(false)
  const [evaluado, setEvaluado] = useState<EvaluadoSlim | null>(null)

  const [compromisos, setCompromisos] = useState<Compromiso[]>([])

  const [formCompromisoId, setFormCompromisoId] = useState<number | ''>('')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formUbicacion, setFormUbicacion] = useState('')
  const [formObservacion, setFormObservacion] = useState('')
  const [formArchivo, setFormArchivo] = useState<File | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [editando, setEditando] = useState<Evidencia | null>(null)
  const [editandoArchivo, setEditandoArchivo] = useState<File | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const esEvaluador = rolActivo === 'evaluador'

  const cargarPeriodos = useCallback(async () => {
    try {
      const res = await api.get<PaginatedData<{ id: number; nombre: string }>>('/periodos?por_pagina=50')
      setPeriodos(res.data || [])
    } catch {}
  }, [])

  useEffect(() => { cargarPeriodos() }, [cargarPeriodos])

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

  const buscarEvaluados = useCallback(async (q: string) => {
    if (!periodoId || q.length < 2) {
      setResultados([])
      setMostrarDrop(false)
      return
    }
    setBuscandoEval(true)
    try {
      const res = await api.get<{ data: EvaluadoSlim[] }>(
        `/evaluadores/mis-evaluados?periodo_id=${periodoId}&q=${encodeURIComponent(q)}`
      )
      setResultados(res.data || [])
      setMostrarDrop(true)
      setBuscandoEval(false)
    } catch {
      setBuscandoEval(false)
    }
  }, [periodoId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!busquedaQ.trim()) { setResultados([]); setMostrarDrop(false); return }
    debounceRef.current = setTimeout(() => buscarEvaluados(busquedaQ.trim()), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [busquedaQ, buscarEvaluados])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setMostrarDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function seleccionarEvaluado(ev: EvaluadoSlim) {
    setEvaluado(ev)
    setBusquedaQ(`${ev.nombre_completo} — ${ev.documento}`)
    setMostrarDrop(false)
    setCompromisos([])
    setPagina(1)
    setFormCompromisoId('')
    setFormDescripcion('')
    setFormUbicacion('')
    setFormObservacion('')
    setFormArchivo(null)
    setSubmitted(false)

    if (ev.evaluacion_id) {
      api.get<PaginatedData<Compromiso>>(`/compromisos/evaluacion/${ev.evaluacion_id}?por_pagina=50`)
        .then(res => setCompromisos(res.data || []))
        .catch(() => {})
    } else if (ev.concertacion_id) {
      api.get<PaginatedData<Compromiso>>(`/evidencias/compromisos-evaluado?evaluado_id=${ev.id}&periodo_id=${periodoId}`)
        .then(res => setCompromisos(res.data || []))
        .catch(() => {})
    }
  }

  const puedeCrear = evaluado && !!evaluado.concertacion_id
  const compromisoSeleccionado = compromisos.find(c => c.id === Number(formCompromisoId))

  function limpiarEvaluado() {
    setEvaluado(null)
    setBusquedaQ('')
    setResultados([])
    setCompromisos([])
    setFormCompromisoId('')
    setFormDescripcion('')
    setFormUbicacion('')
    setFormObservacion('')
    setFormArchivo(null)
  }

  async function guardarEvidencia() {
    setSubmitted(true)
    if (!formCompromisoId || !formDescripcion.trim()) {
      toast.error('Compromiso y descripción son obligatorios.')
      return
    }
    if (!formUbicacion.trim() && !formArchivo) {
      toast.error('Debe indicar la ubicación del soporte o adjuntar un archivo.')
      return
    }
    if (!evaluado?.concertacion_id) {
      toast.error('El evaluado no tiene una concertación activa en este período.')
      return
    }
    setGuardando(true)
    try {
      const compromisoSel = compromisos.find(c => c.id === Number(formCompromisoId))
      const fd = new FormData()
      fd.append('periodo_id', String(periodoId))
      fd.append('compromiso_id', String(formCompromisoId))
      fd.append('compromiso_competencia', compromisoSel?.compromiso_competencia || compromisoSel?.descripcion || '')
      fd.append('descripcion', formDescripcion.trim())
      fd.append('ubicacion', formUbicacion.trim())
      fd.append('observacion', formObservacion.trim() || '')
      fd.append('tipo', compromisoSel?.tipo || 'compromiso')
      if (formArchivo) fd.append('archivo', formArchivo)

      await api.postFormData('/evidencias', fd)
      toast.success('Evidencia registrada correctamente.')
      setSubmitted(false)
      setFormCompromisoId('')
      setFormDescripcion('')
      setFormUbicacion('')
      setFormObservacion('')
      setFormArchivo(null)
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
      if (editandoArchivo) {
        const fd = new FormData()
        fd.append('descripcion', editando.descripcion)
        fd.append('ubicacion', editando.ubicacion ?? '')
        fd.append('observacion', editando.observacion ?? '')
        fd.append('compromiso_competencia', editando.compromiso_competencia ?? '')
        fd.append('archivo', editandoArchivo)
        await api.putFormData(`/evidencias/${editando.id}`, fd)
      } else {
        await api.put(`/evidencias/${editando.id}`, {
          descripcion: editando.descripcion,
          ubicacion: editando.ubicacion,
          observacion: editando.observacion,
          compromiso_competencia: editando.compromiso_competencia,
        })
      }
      toast.success('Evidencia actualizada correctamente')
      setEditando(null)
      setEditandoArchivo(null)
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
      header: 'Ubicación / Archivo',
      render: (ev: any) => ev.archivo_nombre ? (
        <a
          href={api.downloadUrl(api.archivoUrl(ev.id))}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inst-azul hover:underline inline-flex items-center gap-1 max-w-[220px] truncate"
          title={`Descargar ${ev.archivo_nombre}`}
        >
          <span className="material-icons text-sm">attach_file</span>
          <span className="truncate">{ev.archivo_nombre}</span>
        </a>
      ) : ev.ubicacion ? (
        ev.ubicacion.startsWith('http') ? (
          <a href={ev.ubicacion} target="_blank" rel="noopener noreferrer" className="text-inst-azul hover:underline inline-flex items-center gap-1 max-w-[200px] truncate">
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
  
  ]

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul text-xl">folder_open</span>
          <h2 className="edl-section-title">Evidencias</h2>
        </div>
        <p className="text-sm text-inst-texto-claro ml-7">
          Registre soportes del cumplimiento de los compromisos: foto, PDF, Word, Excel u otros archivos permitidos (max. 10MB).
        </p>
      </div>

      {/* Periodo select */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Período de evaluación *"
              value={periodoId || ''}
              onChange={e => {
                const val = Number(e.target.value)
                setPeriodoId(val)
                limpiarEvaluado()
              }}
              placeholder="Seleccione un período"
              options={periodos.map(p => ({ value: String(p.id), label: p.nombre }))}
              helperText="Requerido para filtrar evaluados y compromisos"
            />
          </div>
        </div>
      </Card>

      {/* Búsqueda de evaluados (solo evaluador: autocomplete; admin: documento exacto) */}
      {periodoId > 0 && !evaluado && (
        <Card>
          {esEvaluador ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-icons text-inst-azul">search</span>
                <span className="text-sm font-medium">Buscar evaluado asignado</span>
              </div>
              <p className="text-xs text-inst-texto-claro mb-3">
                Escriba nombre o documento del evaluado para filtrar.
              </p>
              <div ref={searchRef} className="relative">
                <input
                  type="text"
                  className="edl-input pr-10"
                  placeholder="Nombre o documento..."
                  value={busquedaQ}
                  onChange={e => setBusquedaQ(e.target.value)}
                  onFocus={() => { if (resultados.length > 0) setMostrarDrop(true) }}
                  autoComplete="off"
                />
                {buscandoEval && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-icons text-inst-azul animate-spin text-lg">sync</span>
                  </span>
                )}
                {mostrarDrop && resultados.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-inst-surface border border-inst-borde rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
                    {resultados.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-inst-azul/10 border-b border-inst-borde/50 last:border-0 transition-colors"
                        onClick={() => seleccionarEvaluado(r)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-inst-azul text-lg">person</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-inst-texto block truncate">{r.nombre_completo}</span>
                            <span className="text-xs text-inst-texto-claro">
                              {r.documento}
                              {r.denominacion_empleo ? ` · ${r.denominacion_empleo}` : ''}
                              {r.dependencia_nombre ? ` · ${r.dependencia_nombre}` : ''}
                            </span>
                          </div>
                          {r.concertacion_id ? (
                            <Badge tone="success" dot>Activo</Badge>
                          ) : (
                            <Badge tone="warning" dot>Sin concertación</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {mostrarDrop && resultados.length === 0 && busquedaQ.length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full bg-inst-surface border border-inst-borde rounded-lg shadow-lg p-4 text-center">
                    <span className="text-sm text-inst-texto-claro">No se encontraron evaluados</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px]">
                <Input
                  label="Documento del evaluado *"
                  type="text"
                  value={busquedaQ}
                  onChange={e => setBusquedaQ(e.target.value)}
                  placeholder="Número de documento"
                  iconRight={
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!busquedaQ.trim() || !periodoId}
                      onClick={async () => {
                        if (!busquedaQ.trim() || !periodoId) return
                        try {
                          const data = await api.get(`/compromisos/buscar-evaluado?documento=${busquedaQ.trim()}&periodo_id=${periodoId}`) as { evaluado?: any }
                          if (data.evaluado) {
                            const ev: EvaluadoSlim = {
                              id: data.evaluado.id,
                              documento: data.evaluado.documento,
                              nombre_completo: `${data.evaluado.primer_nombre || ''} ${data.evaluado.primer_apellido || ''}`.trim(),
                              denominacion_empleo: data.evaluado.denominacion_empleo || '',
                              dependencia_nombre: data.evaluado.dependencia_nombre || '',
                              evaluacion_id: data.evaluado.evaluacion_id || null,
                              concertacion_id: data.evaluado.concertacion_id || null,
                            }
                            seleccionarEvaluado(ev)
                            toast.success('Evaluado encontrado')
                          } else {
                            toast.error('No se encontró un evaluado con ese documento en el período seleccionado.')
                          }
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : 'Error en la búsqueda')
                        }
                      }}
                    >
                      Buscar
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Info del evaluado + Formulario lado a lado */}
      {evaluado && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Info del evaluado */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-l-4 border-l-inst-azul">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-inst-azul text-xl">account_circle</span>
                  <span className="font-heading font-bold text-inst-texto">{evaluado.nombre_completo}</span>
                  <Badge tone="info">{evaluado.documento}</Badge>
                </div>
                <Button variant="ghost" size="sm" iconLeft={<span className="material-icons text-sm">close</span>} onClick={limpiarEvaluado} aria-label="Cambiar evaluado" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-inst-texto-claro">Cargo:</span><span className="font-medium text-right">{evaluado.denominacion_empleo || '—'}</span></div>
                <div className="flex justify-between"><span className="text-inst-texto-claro">Dependencia:</span><span className="font-medium text-right">{evaluado.dependencia_nombre || '—'}</span></div>
                <div className="flex justify-between"><span className="text-inst-texto-claro">Evaluador:</span><span className="font-medium text-right">{usuario?.nombre_completo || '—'}</span></div>
                <div className="flex justify-between"><span className="text-inst-texto-claro">Compromisos:</span><span className="font-medium text-right">{compromisos.length}</span></div>
              </div>
              {!puedeCrear && (
                <Alert tone="warning" className="mt-3">
                  <span className="text-xs">Sin concertación activa en este período. No se pueden registrar evidencias.</span>
                </Alert>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tabla de evidencias */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-inst-texto flex items-center gap-1">
            <span className="material-icons text-lg">list_alt</span>
            Evidencias registradas
          </h3>
        </div>
        {loading ? (
          <SkeletonText lines={6} />
        ) : !evaluado ? (
          <EmptyState
            icon={<span className="material-icons text-3xl">search</span>}
            title="Seleccione un evaluado"
            description="Seleccione un período y busque un evaluado para ver sus evidencias."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<span className="material-icons text-3xl">folder_off</span>}
            title="Sin evidencias registradas"
            description="Use el formulario lateral para registrar la primera evidencia."
          />
        ) : (
          <DataTable<Evidencia>
            columns={columns}
            data={items}
            rowKey={(ev) => ev.id}
            ariaLabel="Lista de evidencias"
            caption={`Evidencias de ${evaluado.nombre_completo}`}
          />
        )}

        {totalPages > 1 && !loading && items.length > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 mt-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
              <button
                key={p}
                onClick={() => setPagina(p)}
                className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-inst-surface border hover:bg-inst-gris'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Modal editar evidencia */}
      {editando && (
        <Modal open={true} onClose={() => { setEditando(null); setEditandoArchivo(null) }} title="Editar Evidencia" size="md">
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
            <div>
              <label htmlFor="ev-edit-file" className="edl-label">Reemplazar archivo adjunto (opcional)</label>
              <input
                id="ev-edit-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={e => setEditandoArchivo(e.target.files?.[0] ?? null)}
                className="edl-input"
              />
              {(editando as any).archivo_nombre && !editandoArchivo && (
                <p className="mt-1 text-xs text-inst-texto-claro">
                  Archivo actual: <a href={api.archivoUrl(editando.id)} target="_blank" rel="noopener noreferrer" className="text-inst-azul hover:underline">{(editando as any).archivo_nombre}</a>
                </p>
              )}
              {editandoArchivo && (
                <p className="mt-1 text-xs text-inst-azul">
                  Nuevo archivo: <strong>{editandoArchivo.name}</strong> ({Math.round(editandoArchivo.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => { setEditando(null); setEditandoArchivo(null) }}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={actualizarEvidencia}>Guardar cambios</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
