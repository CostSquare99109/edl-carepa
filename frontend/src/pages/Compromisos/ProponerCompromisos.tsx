import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

interface Periodo {
  id: number
  nombre: string
  estado: string
}

interface Evaluacion {
  id: number
  tipo: string
  estado: string
  periodo_id: number
  concertacion_id: number | null
  evaluador_id: number | null
  evaluador_nombre: string | null
  periodo_nombre: string
}

const TIPO_EVALUACION_LABEL: Record<string, string> = {
  parcial_primer_semestre: '1er Semestre',
  parcial_segundo_semestre: '2do Semestre',
  parcial_eventual: 'Parcial Eventual',
  calificacion_definitiva: 'Calificación Definitiva',
  calificacion_extraordinaria: 'Calificación Extraordinaria',
}

const MAX_FUNCIONALES = 3
const MAX_COMPORTAMENTALES = 5
const MIN_COMPORTAMENTALES = 3

export default function ProponerCompromisos() {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number>(0)
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<number>(0)

  const [contexto, setContexto] = useState<{
    evaluacion_id: number | null
    concertacion_id: number | null
    evaluador_id: number | null
    evaluador_nombre: string | null
    periodo_nombre: string | null
  }>({
    evaluacion_id: null,
    concertacion_id: null,
    evaluador_id: null,
    evaluador_nombre: null,
    periodo_nombre: null,
  })

  const [funcionales, setFuncionales] = useState<Array<{
    id?: number
    descripcion: string
    resultado_esperado: string
    medio_verificacion: string
    peso: number
    meta_id: number | null
    estado: string
  }>>([])

  const [comportamentales, setComportamentales] = useState<Array<{
    id?: number
    competencia_codigo: string
    competencia_nombre: string
    decreto: string
    estado: string
  }>>([])

  const [competencias, setCompetencias] = useState<any[]>([])
  const [metas, setMetas] = useState<any[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(false)

  useEffect(() => {
    cargarPeriodos()
    cargarCompetencias()
    cargarMetas()
    setLoading(false)
  }, [])

  async function cargarPeriodos() {
    try {
      const res = await api.get<any>('/periodos?por_pagina=100')
      const pers = Array.isArray(res?.data) ? res.data : []
      setPeriodos(pers)
    } catch (e) {
      console.error('Error cargando periodos:', e)
    }
  }

  async function cargarCompetencias() {
    try {
      const res = await api.get<any>('/compromisos-comportamentales/competencias')
      setCompetencias(Array.isArray(res) ? res : (res?.data || []))
    } catch {}
  }

  async function cargarMetas() {
    try {
      const res = await api.get<any>('/metas?por_pagina=100')
      setMetas(Array.isArray(res) ? res : (res?.data || []))
    } catch {}
  }

  useEffect(() => {
    if (periodoSeleccionado > 0) {
      setCargandoEvaluaciones(true)
      api.get<any>(`/evaluaciones?por_pagina=50&periodo_id=${periodoSeleccionado}&evaluado_id=${usuario?.id}`)
        .then(res => {
          const evs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          const activas = evs.filter((e: any) => e.estado !== 'cerrada' && e.estado !== 'anulada' && e.eliminado_en === null)
          setEvaluaciones(activas)
          setEvaluacionSeleccionada(0)
          setContexto({ evaluacion_id: null, concertacion_id: null, evaluador_id: null, evaluador_nombre: null, periodo_nombre: null })
          setFuncionales([])
          setComportamentales([])
        })
        .catch(e => console.error('Error cargando evaluaciones:', e))
        .finally(() => setCargandoEvaluaciones(false))
    } else {
      setEvaluaciones([])
      setEvaluacionSeleccionada(0)
      setContexto({ evaluacion_id: null, concertacion_id: null, evaluador_id: null, evaluador_nombre: null, periodo_nombre: null })
      setFuncionales([])
      setComportamentales([])
    }
  }, [periodoSeleccionado, usuario?.id])

  useEffect(() => {
    if (evaluacionSeleccionada > 0) {
      cargarContextoEvaluacion(evaluacionSeleccionada)
    } else {
      setContexto({ evaluacion_id: null, concertacion_id: null, evaluador_id: null, evaluador_nombre: null, periodo_nombre: null })
      setFuncionales([])
      setComportamentales([])
    }
  }, [evaluacionSeleccionada])

  async function cargarContextoEvaluacion(evalId: number) {
    try {
      const evalDetalle = await api.get<any>(`/evaluaciones/${evalId}`)
      const concertacionId = evalDetalle.concertacion_id ?? null

      setContexto({
        evaluacion_id: evalId,
        concertacion_id: concertacionId,
        evaluador_id: evalDetalle.evaluador_id ?? null,
        evaluador_nombre: evalDetalle.evaluador_nombre ?? null,
        periodo_nombre: evalDetalle.periodo_nombre ?? null,
      })

      await Promise.all([
        cargarCompromisosExistentes(evalId, concertacionId),
        cargarCompetencias(),
        cargarMetas(),
      ])
    } catch (e) {
      console.error('Error cargando contexto:', e)
    }
  }

  async function cargarCompromisosExistentes(evalId: number, concertId: number | null) {
    try {
      const [funcRes, compRes] = await Promise.all([
        api.get<any>(`/compromisos/evaluacion/${evalId}?por_pagina=50`),
        api.get<any>(`/compromisos-comportamentales/evaluacion/${evalId}`),
      ])
      const TERMINALES = ['cumplido', 'incumplido', 'rechazado']
      const funcData = funcRes.data || []
      setFuncionales(funcData
        .filter((c: any) => !TERMINALES.includes(c.estado))
        .map((c: any) => ({
          id: c.id,
          descripcion: c.descripcion || '',
          resultado_esperado: c.resultado_esperado || '',
          medio_verificacion: c.medio_verificacion || '',
          peso: Number(c.peso) || 0,
          meta_id: c.meta_id ?? null,
          meta_descripcion: c.meta_descripcion || '',
          observaciones_evaluado: c.observaciones_evaluado || '',
          estado: c.estado,
        })))

      const compData = Array.isArray(compRes) ? compRes : (compRes?.data || [])
      setComportamentales(compData
        .filter((c: any) => !TERMINALES.includes(c.estado))
        .map((c: any) => ({
          id: c.id,
          competencia_codigo: c.competencia_codigo || '',
          competencia_nombre: c.competencia_nombre || c.descripcion || '',
          decreto: c.competencia_decreto || '815',
          estado: c.estado,
        })))
    } catch (e) {
      console.error('Error cargando compromisos:', e)
    }
  }

  function agregarFuncional() {
    if (funcionales.filter(f => !f.id).length >= 3) {
      toast.error('Máximo 3 compromisos funcionales nuevos.')
      return
    }
    setFuncionales([...funcionales, {
      descripcion: '',
      resultado_esperado: '',
      medio_verificacion: '',
      peso: 0,
      meta_id: null,
      estado: 'nuevo',
    }])
  }

  function eliminarFuncional(idx: number) {
    setFuncionales(funcionales.filter((_, i) => i !== idx))
  }

  function actualizarFuncional(idx: number, campo: string, valor: any) {
    const nuevos = [...funcionales]
    nuevos[idx] = { ...nuevos[idx], [campo]: valor }
    setFuncionales(nuevos)
  }

  function agregarComportamental(comp: any) {
    if (comportamentales.find(c => c.competencia_codigo === (comp.codigo || comp.id))) return
    if (comportamentales.filter(c => !c.id).length >= 5) {
      toast.error('Máximo 5 competencias comportamentales nuevas.')
      return
    }
    setComportamentales([...comportamentales, {
      competencia_codigo: comp.codigo || comp.id,
      competencia_nombre: comp.nombre || comp.descripcion,
      decreto: comp.decreto || '815',
      estado: 'nuevo',
    }])
  }

  function eliminarComportamental(idx: number) {
    setComportamentales(comportamentales.filter((_, i) => i !== idx))
  }

  const totalPeso = funcionales.reduce((acc, f) => acc + (Number(f.peso) || 0), 0)
  const nuevosFuncionales = funcionales.filter(f => !f.id)
  const nuevosComportamentales = comportamentales.filter(c => !c.id)
  const todosAprobados = funcionales.length > 0 && funcionales.every(f => f.estado === 'aprobado')
  const todosComportamentalesAprobados = comportamentales.length > 0 && comportamentales.every(c => c.estado === 'aprobado')

  async function enviarPropuesta() {
    if (!contexto.evaluacion_id && !contexto.concertacion_id) {
      toast.error('Seleccione una evaluación para proponer compromisos.')
      return
    }
    if (!contexto.evaluador_id) {
      toast.error('No se encontró el evaluador asignado para esta evaluación.')
      return
    }

    const nuevosFuncionales = funcionales.filter(f => !f.id)
    const nuevosComportamentales = comportamentales.filter(c => !c.id)

    if (nuevosFuncionales.length === 0 && nuevosComportamentales.length === 0) {
      toast.info('No hay propuestas nuevas para enviar. Agregue compromisos.')
      return
    }

    if (nuevosFuncionales.length > 0 && nuevosFuncionales.length < 1) {
      toast.error('Debe incluir al menos 1 compromiso funcional.')
      return
    }
    if (nuevosFuncionales.length > 3) {
      toast.error('Máximo 3 compromisos funcionales.')
      return
    }
    if (nuevosComportamentales.length > 0 && nuevosComportamentales.length < 3) {
      toast.error('Debe seleccionar al menos 3 competencias comportamentales.')
      return
    }
    if (nuevosComportamentales.length > 5) {
      toast.error('Máximo 5 competencias comportamentales.')
      return
    }

    const pesoNuevos = nuevosFuncionales.reduce((acc, f) => acc + (Number(f.peso) || 0), 0)
    if (nuevosFuncionales.length > 0 && Math.abs(pesoNuevos - 100) > 0.01) {
      toast.error(`La suma de los pesos de los compromisos funcionales nuevos debe ser 100%. Actual: ${pesoNuevos}%.`)
      return
    }

    setGuardando(true)
    try {
      for (const f of nuevosFuncionales) {
        await api.post('/compromisos/enviar', {
          evaluacion_id: contexto.evaluacion_id,
          concertacion_id: contexto.concertacion_id,
          evaluador_id: contexto.evaluador_id,
          descripcion: f.descripcion,
          resultado_esperado: f.resultado_esperado || null,
          medio_verificacion: f.medio_verificacion || null,
          peso: f.peso,
          meta_id: f.meta_id || null,
          observaciones_evaluado: observaciones.trim() || null,
        })
      }

      for (const c of nuevosComportamentales) {
        await api.post('/compromisos-comportamentales/enviar', {
          evaluacion_id: contexto.evaluacion_id,
          concertacion_id: contexto.concertacion_id,
          competencia_codigo: c.competencia_codigo,
          descripcion: c.competencia_nombre,
          observaciones_evaluado: observaciones.trim() || null,
        })
      }

      toast.success(`Propuesta enviada. ${nuevosFuncionales.length} funcional(es) y ${nuevosComportamentales.length} comportamental(es) en estado "propuesto".`)
      setObservaciones('')
      await cargarContextoEvaluacion(contexto.evaluacion_id!)
    } catch (e: any) {
      toast.error(e instanceof Error ? e.message : 'Error al enviar la propuesta')
    }
    setGuardando(false)
  }

  const competenciasDisponibles = competencias.filter(
    c => !comportamentales.find(b => b.competencia_codigo === (c.codigo || c.id))
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin inline-block h-8 w-8 border-4 border-inst-azul border-t-transparent rounded-full"></div>
        <p className="mt-2 text-inst-texto-claro">Cargando...</p>
      </div>
    )
  }

  if (periodos.length === 0) {
    return (
      <div>
        <h2 className="edl-section-title">Proponer Compromisos</h2>
        <div className="text-center py-8">
          <span className="material-icons text-3xl text-inst-texto-claro">rate_review</span>
          <h3 className="mt-2 font-semibold">No hay periodos configurados</h3>
          <p className="text-inst-texto-claro">Comuníquese con la administración para configurar los periodos de evaluación.</p>
        </div>
      </div>
    )
  }

  const evaluacionSeleccionadaObj = evaluaciones.find(e => e.id === evaluacionSeleccionada)
  const tipoEvaluacionLabel = evaluacionSeleccionadaObj ? TIPO_EVALUACION_LABEL[evaluacionSeleccionadaObj.tipo] || evaluacionSeleccionadaObj.tipo : '—'

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="material-icons text-inst-azul-osc text-xl">rate_review</span>
        <h2 className="edl-section-title">Proponer Compromisos</h2>
      </div>
      <p className="text-sm text-inst-texto-claro mb-4 ml-7">
        Acuerdo 617 de 2018 — Proponga los compromisos funcionales (1-3) y competencias comportamentales (3-5) del periodo.
        Las propuestas serán revisadas por su Jefe de Dependencia antes de pasar al evaluador.
      </p>

      {/* SELECTORES: Período + Tipo Evaluación */}
      <div className="edl-card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="edl-label">Período de Evaluación <span className="text-inst-rojo">*</span></label>
            <select
              value={periodoSeleccionado}
              onChange={e => setPeriodoSeleccionado(Number(e.target.value))}
              className="edl-input"
              disabled={cargandoEvaluaciones}
            >
              <option value={0}>Seleccione un período...</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.estado === 'cerrado' ? '(cerrado)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="edl-label">Tipo de Evaluación <span className="text-inst-rojo">*</span></label>
            <select
              value={evaluacionSeleccionada}
              onChange={e => setEvaluacionSeleccionada(Number(e.target.value))}
              className="edl-input"
              disabled={evaluaciones.length === 0 || cargandoEvaluaciones}
            >
              {evaluaciones.length === 0 ? (
                <option value={0}>Seleccione primero un período...</option>
              ) : (
                <>
                  <option value={0}>Seleccione tipo de evaluación...</option>
                  {evaluaciones.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {TIPO_EVALUACION_LABEL[ev.tipo] || ev.tipo} ({ev.estado})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-inst-texto-claro">
              {cargandoEvaluaciones && <span className="flex items-center gap-1 text-inst-azul"><span className="material-icons text-sm animate-spin">sync</span>Cargando...</span>}
              {!cargandoEvaluaciones && periodoSeleccionado > 0 && evaluaciones.length === 0 && (
                <span className="text-inst-rojo">Sin evaluaciones para este período</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {periodoSeleccionado > 0 && evaluacionSeleccionada > 0 && (
        <>
          <div className="edl-card mb-4 bg-inst-azul/5 border-l-4 border-l-inst-azul-osc">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-inst-texto-claro block text-xs uppercase font-bold">Período</span>
                <span className="font-medium">{contexto.periodo_nombre || '—'}</span>
              </div>
              <div>
                <span className="text-inst-texto-claro block text-xs uppercase font-bold">Jefe de Dependencia (revisor)</span>
                <span className="font-medium">{contexto.evaluador_nombre || '—'}</span>
              </div>
              <div>
                <span className="text-inst-texto-claro block text-xs uppercase font-bold">Tipo de Evaluación</span>
                <span className="font-medium">{tipoEvaluacionLabel}</span>
              </div>
            </div>
          </div>

          {funcionales.length > 0 && funcionales.every(f => f.estado === 'aprobado') && comportamentales.length > 0 && comportamentales.every(c => c.estado === 'aprobado') && (
            <div className="edl-card mb-4 bg-green-50 border-green-200">
              <span className="text-sm text-green-800">Sus compromisos ya fueron aprobados. La concertación está cerrada.</span>
            </div>
          )}

          {/* COMPROMISOS FUNCIONALES (máx 3) */}
          <div className="edl-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
                <span className="material-icons">task_alt</span>
                Compromisos Funcionales (máx. 3)
              </h3>
              {(funcionales.length === 0 || funcionales.filter(f => !f.id).length < 3) && (!funcionales.some(f => f.estado === 'aprobado')) && (
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  onClick={agregarFuncional}
                >
                  <span className="material-icons text-base">add</span>
                  Agregar funcional
                </button>
              )}
            </div>

            {funcionales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro">No hay compromisos funcionales. Agregue entre 1 y 3.</p>
            ) : (
              <div className="space-y-3">
                {funcionales.map((f, idx) => (
                  <div key={idx} className="border border-inst-borde rounded p-3 relative bg-white">
                    {f.estado && f.estado !== 'nuevo' && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {f.estado}
                      </span>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-20">
                      <div className="md:col-span-2">
                        <label className="edl-label">Descripción <span className="text-inst-rojo">*</span></label>
                        <textarea
                          value={f.descripcion}
                          onChange={e => actualizarFuncional(idx, 'descripcion', e.target.value)}
                          className="edl-input"
                          style={{ minHeight: '60px' }}
                          placeholder="Verbo en infinitivo + objeto + condición (mín. 20 caracteres). Ej: Elaborar un informe mensual de indicadores según el cronograma."
                          disabled={!!f.id && f.estado !== 'propuesto'}
                        />
                      </div>
                      <div>
                        <label className="edl-label">Resultado esperado</label>
                        <input
                          value={f.resultado_esperado}
                          onChange={e => actualizarFuncional(idx, 'resultado_esperado', e.target.value)}
                          className="edl-input"
                          placeholder="Qué se espera lograr"
                          disabled={!!f.id && f.estado !== 'propuesto'}
                        />
                      </div>
                      <div>
                        <label className="edl-label">Medio de verificación</label>
                        <input
                          value={f.medio_verificacion}
                          onChange={e => actualizarFuncional(idx, 'medio_verificacion', e.target.value)}
                          className="edl-input"
                          placeholder="Cómo se verificará"
                          disabled={!!f.id && f.estado !== 'propuesto'}
                        />
                      </div>
                      <div>
                        <label className="edl-label">Meta institucional</label>
                        <select
                          value={f.meta_id ?? ''}
                          onChange={e => actualizarFuncional(idx, 'meta_id', e.target.value ? Number(e.target.value) : null)}
                          className="edl-input"
                          disabled={!!f.id && f.estado !== 'propuesto'}
                        >
                          <option value="">Sin meta específica</option>
                          {metas.map(m => (
                            <option key={m.id} value={m.id}>
                              {(m.descripcion || m.nombre || '').slice(0, 80)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '8rem' }}>
                        <label className="edl-label">Peso (%) <span className="text-inst-rojo">*</span></label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={f.peso}
                          onChange={e => actualizarFuncional(idx, 'peso', Number(e.target.value))}
                          className="edl-input"
                          disabled={!!f.id && f.estado !== 'propuesto'}
                        />
                      </div>
                    </div>
                    {!f.id && (
                      <button
                        onClick={() => eliminarFuncional(idx)}
                        className="absolute bottom-2 right-2 text-inst-texto-claro hover:text-inst-rojo"
                        title="Eliminar"
                      >
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    )}
                  </div>
                ))}
                <div className={`text-sm font-medium flex items-center gap-2 ${Math.abs(totalPeso - 100) < 0.01 ? 'text-green-700' : 'text-inst-rojo'}`}>
                  <span className="material-icons text-base">{Math.abs(totalPeso - 100) < 0.01 ? 'check_circle' : 'warning'}</span>
                  Total pesos: {totalPeso}% {Math.abs(totalPeso - 100) > 0.01 && '(debe sumar exactamente 100%)'}
                </div>
              </div>
            )}
          </div>

          {/* COMPETENCIAS COMPORTAMENTALES (mín 3, máx 5) */}
          <div className="edl-card mb-4">
            <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
              <span className="material-icons">psychology</span>
              Competencias Comportamentales (mín. 3, máx. 5)
            </h3>

            {comportamentales.length > 0 && (
              <div className="space-y-2 mb-3">
                {comportamentales.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-3 border border-inst-borde rounded p-3 bg-white">
                    <div className="flex-1">
                      <span className="font-medium text-sm text-inst-texto">{c.competencia_nombre}</span>
                      <span className="text-xs text-inst-texto-claro ml-2">
                        ({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})
                      </span>
                    </div>
                    {c.estado && c.estado !== 'nuevo' && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {c.estado}
                      </span>
                    )}
                    {!c.id && (
                      <button onClick={() => eliminarComportamental(idx)} className="text-inst-texto-claro hover:text-inst-rojo" title="Eliminar">
                        <span className="material-icons text-lg">close</span>
                      </button>
                    )}
                  </div>
                ))}
                <div className="text-sm font-medium flex items-center gap-2 text-inst-azul">
                  <span className="material-icons text-base">{comportamentales.filter(c => !c.id).length >= 3 ? 'check_circle' : 'info'}</span>
                  Seleccionadas: {comportamentales.length} (mínimo 3, máximo 5)
                </div>
              </div>
            )}

            {competenciasDisponibles.length > 0 && (comportamentales.length === 0 || !comportamentales.every(c => c.estado === 'aprobado')) && (
              <div>
                <label className="edl-label">Agregar competencia</label>
                <p className="text-xs text-inst-texto-claro mb-2">Seleccionadas: {comportamentales.length} (mínimo 3, máximo 5)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {competenciasDisponibles.slice(0, 30).map(comp => (
                    <button
                      key={comp.codigo || comp.id}
                      type="button"
                      onClick={() => agregarComportamental(comp)}
                      className="text-left text-sm p-2 border border-inst-borde rounded hover:border-inst-azul hover:bg-inst-azul/5 transition-colors"
                    >
                      <span className="font-medium">{comp.nombre || comp.descripcion}</span>
                      <span className="text-xs text-inst-texto-claro block">
                        {comp.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OBSERVACIONES + ACCIONES */}
          {!funcionales.every(f => f.estado === 'aprobado') && !comportamentales.every(c => c.estado === 'aprobado') && (
            <div className="edl-card mb-4">
              <h3 className="font-semibold text-inst-azul mb-3 flex items-center gap-2">
                <span className="material-icons">note</span>
                Observaciones para el Jefe de Dependencia
              </h3>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                className="edl-input"
                style={{ minHeight: '80px' }}
                placeholder="Aclaraciones, contexto o justificación de sus propuestas (opcional)"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => { setPeriodoSeleccionado(0); setEvaluaciones([]); setEvaluacionSeleccionada(0); }}
              disabled={guardando}
            >
              Cambiar período/evaluación
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={enviarPropuesta}
              disabled={guardando || funcionales.every(f => f.estado === 'aprobado') && comportamentales.every(c => c.estado === 'aprobado') || funcionales.filter(f => !f.id).length === 0 && comportamentales.filter(c => !c.id).length === 0}
            >
              <span className="material-icons">send</span>
              {guardando ? 'Enviando propuesta...' : 'Enviar propuesta al Jefe de Dependencia'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}