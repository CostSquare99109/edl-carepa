import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Alert, Badge, EmptyState, SkeletonText } from '../../components/ui'
import { toast } from 'sonner'

interface CompromisoFuncional {
  id?: number
  tipo: string
  descripcion: string
  resultado_esperado: string
  medio_verificacion: string
  peso: number
  estado: string
  meta_id?: number | null
  meta_descripcion?: string
  observaciones_evaluado?: string
}

interface CompetenciaComportamental {
  id?: number
  competencia_codigo: string
  competencia_nombre: string
  decreto: string
  conductas: string
  estado: string
  es_propuesto_evaluado: number
}

interface ContextoPropuesta {
  evaluacion_id: number | null
  concertacion_id: number | null
  evaluador_id: number | null
  evaluador_nombre: string | null
  periodo_nombre: string | null
}

export default function ProponerCompromisos() {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [contexto, setContexto] = useState<ContextoPropuesta>({
    evaluacion_id: null,
    concertacion_id: null,
    evaluador_id: null,
    evaluador_nombre: null,
    periodo_nombre: null,
  })

  const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([])
  const [comportamentales, setComportamentales] = useState<CompetenciaComportamental[]>([])
  const [competencias, setCompetencias] = useState<any[]>([])
  const [metas, setMetas] = useState<any[]>([])

  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarInicial()
  }, [])

  async function cargarInicial() {
    setLoading(true)
    try {
      // 1. Cargar las evaluaciones del evaluado actual
      const evalsRes = await api.get<PaginatedData<any>>('/evaluaciones?por_pagina=10')
      const evals = evalsRes.data || []
      const evalActiva = evals.find((e: any) => e.estado !== 'cerrada' && e.estado !== 'anulada') || evals[0]

      if (!evalActiva) {
        setLoading(false)
        return
      }

      // 2. Cargar detalles de la evaluacion
      let evaluadorId: number | null = null
      let evaluadorNombre: string | null = null
      let periodoNombre: string | null = null
      try {
        const evalDetalle = await api.get<any>(`/evaluaciones/${evalActiva.id}`)
        evaluadorId = evalDetalle.evaluador_id ?? null
        evaluadorNombre = evalDetalle.evaluador_nombre ?? null
        periodoNombre = evalDetalle.periodo_nombre ?? null
      } catch {}

      // 3. Cargar compromisos existentes
      const concertacionId = evalActiva.concertacion_id ?? null
      const concertId = concertacionId ?? await resolverConcertacionPorEvaluacion(evalActiva.id)

      setContexto({
        evaluacion_id: evalActiva.id,
        concertacion_id: concertId,
        evaluador_id: evaluadorId,
        evaluador_nombre: evaluadorNombre,
        periodo_nombre: periodoNombre,
      })

      await Promise.all([
        cargarCompromisosExistentes(evalActiva.id, concertId),
        cargarCompetencias(),
        cargarMetas(),
      ])
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
    setLoading(false)
  }

  async function resolverConcertacionPorEvaluacion(evalId: number): Promise<number | null> {
    try {
      const evalDetalle = await api.get<any>(`/evaluaciones/${evalId}`)
      return evalDetalle.concertacion_id ?? null
    } catch {
      return null
    }
  }

  async function cargarCompromisosExistentes(evalId: number, concertId: number | null) {
    try {
      const [funcRes, compRes] = await Promise.all([
        api.get<PaginatedData<any>>(`/compromisos/evaluacion/${evalId}?por_pagina=50`),
        api.get<any>(`/compromisos-comportamentales/evaluacion/${evalId}`),
      ])
      const TERMINALES = ['cumplido', 'incumplido', 'rechazado']
      const funcData = funcRes.data || []
      setFuncionales(funcData
        .filter((c: any) => !TERMINALES.includes(c.estado))
        .map((c: any) => ({
          id: c.id,
          tipo: 'funcional',
          descripcion: c.descripcion || '',
          resultado_esperado: c.resultado_esperado || '',
          medio_verificacion: c.medio_verificacion || '',
          peso: Number(c.peso) || 0,
          estado: c.estado,
          meta_id: c.meta_id ?? null,
          meta_descripcion: c.meta_descripcion || '',
          observaciones_evaluado: c.observaciones_evaluado || '',
        })))

      const compData = Array.isArray(compRes) ? compRes : (compRes?.data || [])
      setComportamentales(compData
        .filter((c: any) => !TERMINALES.includes(c.estado))
        .map((c: any) => ({
          id: c.id,
          competencia_codigo: c.competencia_codigo || '',
          competencia_nombre: c.competencia_nombre || c.descripcion || '',
          decreto: c.competencia_decreto || '815',
          conductas: '',
          estado: c.estado,
          es_propuesto_evaluado: c.es_propuesto_evaluado || 0,
        })))
    } catch (err) {
      console.error('Error cargando compromisos:', err)
    }
  }

  async function cargarCompetencias() {
    try {
      const res = await api.get<any>('/compromisos-comportamentales/competencias')
      setCompetencias(res.data || [])
    } catch {}
  }

  async function cargarMetas() {
    try {
      const res = await api.get<PaginatedData<any>>('/metas?por_pagina=100')
      setMetas(res.data || [])
    } catch {}
  }

  function agregarFuncional() {
    setFuncionales([...funcionales, {
      tipo: 'funcional',
      descripcion: '',
      resultado_esperado: '',
      medio_verificacion: '',
      peso: 0,
      estado: 'nuevo',
      meta_id: null,
      meta_descripcion: '',
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
    setComportamentales([...comportamentales, {
      competencia_codigo: comp.codigo || comp.id,
      competencia_nombre: comp.nombre || comp.descripcion,
      decreto: comp.decreto || '815',
      conductas: '',
      estado: 'nuevo',
      es_propuesto_evaluado: 1,
    }])
  }

  function eliminarComportamental(idx: number) {
    setComportamentales(comportamentales.filter((_, i) => i !== idx))
  }

  const totalPeso = funcionales.reduce((acc, f) => acc + (Number(f.peso) || 0), 0)
  const todosAprobados = funcionales.length > 0 && funcionales.every(f => f.estado === 'aprobado')
  const todosComportamentalesAprobados = comportamentales.length > 0 && comportamentales.every(c => c.estado === 'aprobado')

  async function enviarPropuesta() {
    if (!contexto.evaluacion_id && !contexto.concertacion_id) {
      toast.error('No se encontró una evaluación o concertación activa.')
      return
    }
    if (!contexto.evaluador_id) {
      toast.error('No se encontró el evaluador asignado para esta evaluación.')
      return
    }

    const nuevosFuncionales = funcionales.filter(f => !f.id)
    const nuevosComportamentales = comportamentales.filter(c => !c.id)

    if (nuevosFuncionales.length === 0 && nuevosComportamentales.length === 0) {
      toast.info('No hay propuestas nuevas para enviar. Modifique o agregue compromisos.')
      return
    }

    if (nuevosFuncionales.length > 0 && nuevosFuncionales.length < 1) {
      toast.error('Debe incluir al menos 1 compromiso funcional.')
      return
    }
    if (nuevosFuncionales.length > 5) {
      toast.error('Máximo 5 compromisos funcionales.')
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

      toast.success(`Propuesta enviada correctamente. ${nuevosFuncionales.length} funcional(es) y ${nuevosComportamentales.length} comportamental(es) quedaron en estado "propuesto" para revisión del Jefe de Dependencia.`)
      setObservaciones('')
      await cargarInicial()
    } catch (e: any) {
      toast.error(e instanceof Error ? e.message : 'Error al enviar la propuesta')
    }
    setGuardando(false)
  }

  const competenciasDisponibles = competencias.filter(
    c => !comportamentales.find(b => b.competencia_codigo === (c.codigo || c.id))
  )

  if (loading) {
    return <SkeletonText lines={6} />
  }

  if (!contexto.evaluacion_id && !contexto.concertacion_id) {
    return (
      <div>
        <h2 className="edl-section-title">Proponer Compromisos</h2>
        <EmptyState
          icon={<span className="material-icons text-3xl">rate_review</span>}
          title="No tiene una evaluación activa"
          description="No se encontró una evaluación ni concertación asociada a su usuario. Comuníquese con la Jefatura de Personal para que le asignen un evaluador y periodo."
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="material-icons text-inst-azul-osc text-xl">rate_review</span>
        <h2 className="edl-section-title">Proponer Compromisos</h2>
      </div>
      <p className="text-sm text-inst-texto-claro mb-4 ml-7">
        Acuerdo 6176 de 2018 — Proponga los compromisos funcionales y competencias comportamentales del periodo.
        Las propuestas serán revisadas y aprobadas por su Jefe de Dependencia antes de pasar al evaluador.
      </p>

      <Card className="mb-4 bg-inst-azul/5 border-l-4 border-l-inst-azul-osc">
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
            <span className="text-inst-texto-claro block text-xs uppercase font-bold">Estado actual</span>
            <span className="font-medium">
              {todosAprobados && todosComportamentalesAprobados ? (
                <Badge tone="success" dot>Concertación aprobada</Badge>
              ) : (
                <Badge tone="warning" dot>En propuesta / revisión</Badge>
              )}
            </span>
          </div>
        </div>
      </Card>

      {todosAprobados && todosComportamentalesAprobados && (
        <Alert tone="info" className="mb-4">
          <span className="text-sm">
            Sus compromisos ya fueron aprobados. La concertación está cerrada y no se pueden enviar nuevas propuestas para este período.
          </span>
        </Alert>
      )}

      {/* COMPROMISOS FUNCIONALES */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
            <span className="material-icons">task_alt</span>
            Compromisos Funcionales
          </h3>
          {!todosAprobados && (
            <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-base">add</span>} onClick={agregarFuncional}>
              Agregar
            </Button>
          )}
        </div>
        {funcionales.length === 0 ? (
          <p className="text-sm text-inst-texto-claro">No hay compromisos funcionales. Agregue entre 1 y 5.</p>
        ) : (
          <div className="space-y-3">
            {funcionales.map((f, idx) => (
              <div key={idx} className="border border-inst-borde rounded p-3 relative bg-white">
                {f.estado && f.estado !== 'nuevo' && (
                  <Badge tone={f.estado === 'aprobado' ? 'success' : f.estado === 'propuesto' ? 'warning' : 'neutral'} className="absolute top-2 right-2">
                    {f.estado}
                  </Badge>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-20">
                  <div className="md:col-span-2">
                    <label className="edl-label">Descripción <span className="text-inst-rojo">*</span></label>
                    <textarea
                      value={f.descripcion}
                      onChange={e => actualizarFuncional(idx, 'descripcion', e.target.value)}
                      className="edl-input min-h-[60px]"
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
                  <div className="w-32">
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
      </Card>

      {/* COMPETENCIAS COMPORTAMENTALES */}
      <Card className="mb-4">
        <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
          <span className="material-icons">psychology</span>
          Competencias Comportamentales
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
                  <Badge tone={c.estado === 'aprobado' ? 'success' : c.estado === 'propuesto' ? 'warning' : 'neutral'}>
                    {c.estado}
                  </Badge>
                )}
                {!c.id && (
                  <button onClick={() => eliminarComportamental(idx)} className="text-inst-texto-claro hover:text-inst-rojo" title="Eliminar">
                    <span className="material-icons text-lg">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {competenciasDisponibles.length > 0 && !todosComportamentalesAprobados && (
          <div>
            <label className="edl-label">Agregar competencia</label>
            <p className="text-xs text-inst-texto-claro mb-2">Seleccionadas: {comportamentales.length} (mínimo 3, máximo 5)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {competenciasDisponibles.slice(0, 30).map(comp => (
                <button
                  key={comp.codigo || comp.id}
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
      </Card>

      {/* OBSERVACIONES + ACCIONES */}
      {!todosAprobados && (
        <Card className="mb-4">
          <h3 className="font-heading font-semibold text-inst-azul mb-3 flex items-center gap-2">
            <span className="material-icons">note</span>
            Observaciones para el Jefe de Dependencia
          </h3>
          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="edl-input min-h-[80px]"
            placeholder="Aclaraciones, contexto o justificación de sus propuestas (opcional)"
          />
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={cargarInicial} disabled={guardando}>
          Recargar
        </Button>
        <Button
          variant="primary"
          iconLeft={<span className="material-icons">send</span>}
          onClick={enviarPropuesta}
          disabled={guardando || todosAprobados}
        >
          {guardando ? 'Enviando propuesta...' : 'Enviar propuesta al Jefe de Dependencia'}
        </Button>
      </div>
    </div>
  )
}
