import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
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
  calificacion_definitiva?: string | number | null
  nivel_resultado?: string | null
  puede_proponer?: number
}

interface Funcional {
  descripcion: string
  resultado_esperado: string
  medio_verificacion: string
  peso: number
  meta_id: number | null
}

interface Comportamental {
  competencia_codigo: string
  competencia_nombre: string
  decreto: string
}

interface Competencia {
  codigo?: string
  id?: string
  nombre?: string
  descripcion?: string
  decreto?: string
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

// Estados terminales de una evaluación: ya cerrada, no se puede proponer
const ESTADOS_TERMINALES = new Set(['calificada', 'aprobada_comision', 'rechazada_comision', 'cerrada', 'anulada'])

export default function ProponerCompromisos() {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number>(0)
  const toastShownRef = useRef(false)
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<number>(0)
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(false)
  const [iniciando, setIniciando] = useState(false)

  // Toast cuando no hay evaluaciones disponibles para el período
  useEffect(() => {
    if (!cargandoEvaluaciones && periodoSeleccionado > 0 && evaluaciones.length === 0 && !toastShownRef.current) {
      toastShownRef.current = true
      toast.info('No tiene evaluaciones en este período para proponer compromisos.')
    }
    if (cargandoEvaluaciones) {
      toastShownRef.current = false
    }
  }, [cargandoEvaluaciones, periodoSeleccionado, evaluaciones.length])

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

  const [funcionales, setFuncionales] = useState<Funcional[]>([])
  const [comportamentales, setComportamentales] = useState<Comportamental[]>([])

  // Compromisos vigentes (APROBADOS) en BD: bloquean nueva propuesta porque
  // ya están concertados oficialmente. Los propuestos/devueltos NO son vigentes:
  // quedan como histórico y deben ser revisados por el evaluador.
  const [vigentesFuncionales, setVigentesFuncionales] = useState(0)
  const [vigentesComportamentales, setVigentesComportamentales] = useState(0)
  const [pendientesFuncionales, setPendientesFuncionales] = useState(0)
  const [pendientesComportamentales, setPendientesComportamentales] = useState(0)

  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [metas, setMetas] = useState<any[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarPeriodos()
    cargarCompetencias()
    cargarMetas()
    setLoading(false)
  }, [])

  async function cargarPeriodos() {
    try {
      const res = await api.get<any>('/periodos?por_pagina=100')
      const pers = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
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
          const visibles = evs.filter((e: any) => e.estado !== 'anulada' && e.eliminado_en === null)
          setEvaluaciones(visibles)
          setEvaluacionSeleccionada(0)
          resetCompromisos()
        })
        .catch(e => console.error('Error cargando evaluaciones:', e))
        .finally(() => setCargandoEvaluaciones(false))
    } else {
      setEvaluaciones([])
      setEvaluacionSeleccionada(0)
      resetCompromisos()
    }
  }, [periodoSeleccionado, usuario?.id])

  // Cuando no hay evaluaciones, permitir iniciar una
  async function iniciarEvaluacion(tipo: string = 'parcial_primer_semestre') {
    if (periodoSeleccionado <= 0) {
      toast.error('Seleccione un período primero')
      return
    }
    setIniciando(true)
    try {
      const res = await api.post<any>('/evaluaciones/iniciar', {
        periodo_id: periodoSeleccionado,
        tipo,
      })
      const data = res.data || res

      if (data.code === '01' || data.evaluacion_id) {
        const info = data.data || data
        toast.success(info.mensaje || 'Evaluación iniciada correctamente')

        // Recargar evaluaciones para que aparezca en el select
        const evRes = await api.get<any>(`/evaluaciones?por_pagina=50&periodo_id=${periodoSeleccionado}&evaluado_id=${usuario?.id}`)
        const evs = Array.isArray(evRes?.data) ? evRes.data : (Array.isArray(evRes) ? evRes : [])
        const visibles = evs.filter((e: any) => e.estado !== 'anulada' && e.eliminado_en === null)
        setEvaluaciones(visibles)

        // Seleccionar automaticamente la nueva evaluacion
        if (info.evaluacion_id) {
          setEvaluacionSeleccionada(info.evaluacion_id)
        }
      } else {
        toast.error(data.message || 'Error al iniciar la evaluación')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al iniciar la evaluación'
      toast.error(msg)
    } finally {
      setIniciando(false)
    }
  }

  function resetCompromisos() {
    setContexto({ evaluacion_id: null, concertacion_id: null, evaluador_id: null, evaluador_nombre: null, periodo_nombre: null })
    setFuncionales([])
    setComportamentales([])
    setObservaciones('')
    setVigentesFuncionales(0)
    setVigentesComportamentales(0)
    setPendientesFuncionales(0)
    setPendientesComportamentales(0)
  }

  useEffect(() => {
    if (evaluacionSeleccionada > 0) {
      cargarContextoEvaluacion(evaluacionSeleccionada)
    } else {
      resetCompromisos()
    }
  }, [evaluacionSeleccionada])

  async function cargarContextoEvaluacion(evalId: number) {
    try {
      const evalDetalle = await api.get<any>(`/evaluaciones/${evalId}`)

      const periodoNombre =
        periodos.find(p => p.id === evalDetalle.periodo_id)?.nombre
        || evalDetalle.periodo_nombre
        || '—'

      // Conteo de existentes:
      // - VIGENTES (aprobados): ocupan cupo, NO se puede proponer NUEVO encima.
      // - PENDIENTES (propuesto/devuelto): histórico, NO ocupan cupo.
      // Esto evita que el evaluado proponga MENOS de 3 comportamentales aunque
      // existan devueltos previos, porque los devueltos no bloquean cupo nuevo.
      let vFunc = 0, vComp = 0, pFunc = 0, pComp = 0
      try {
        const [funcRes, compRes] = await Promise.all([
          api.get<any>(`/compromisos/evaluacion/${evalId}`).catch(() => null),
          api.get<any>(`/compromisos-comportamentales/evaluacion/${evalId}`).catch(() => null),
        ])
        const funcs = funcRes?.funcionales || []
        vFunc = funcs.filter((f: any) => f.estado === 'aprobado').length
        pFunc = funcs.length - vFunc
        const comps = Array.isArray(compRes) ? compRes : []
        vComp = comps.filter((c: any) => c.estado === 'aprobado').length
        pComp = comps.length - vComp
      } catch {}
      setVigentesFuncionales(vFunc)
      setVigentesComportamentales(vComp)
      setPendientesFuncionales(pFunc)
      setPendientesComportamentales(pComp)

      setContexto({
        evaluacion_id: evalId,
        concertacion_id: evalDetalle.concertacion_id ?? null,
        evaluador_id: evalDetalle.evaluador_id ?? null,
        evaluador_nombre: evalDetalle.evaluador_nombre ?? null,
        periodo_nombre: periodoNombre,
      })

      setFuncionales([])
      setComportamentales([])
      setObservaciones('')
    } catch (e) {
      console.error('Error cargando contexto:', e)
    }
  }

  function agregarFuncional() {
    if (vigentesFuncionales + funcionales.length >= MAX_FUNCIONALES) {
      toast.error(
        vigentesFuncionales > 0
          ? `Ya hay ${vigentesFuncionales} compromiso(s) funcional(es) aprobado(s). Máximo permitido: ${MAX_FUNCIONALES}.`
          : `Máximo ${MAX_FUNCIONALES} compromisos funcionales.`
      )
      return
    }
    setFuncionales(prev => [...prev, {
      descripcion: '',
      resultado_esperado: '',
      medio_verificacion: '',
      peso: 0,
      meta_id: null,
    }])
  }

  function eliminarFuncional(idx: number) {
    setFuncionales(prev => prev.filter((_, i) => i !== idx))
  }

  function actualizarFuncional(idx: number, campo: keyof Funcional, valor: any) {
    setFuncionales(prev => {
      const nuevos = [...prev]
      nuevos[idx] = { ...nuevos[idx], [campo]: valor }
      return nuevos
    })
  }

  function agregarComportamental(comp: Competencia) {
    const codigo = comp.codigo || comp.id
    if (!codigo) return
    if (comportamentales.find(c => c.competencia_codigo === codigo)) {
      toast.info('Ya tienes esa competencia seleccionada.')
      return
    }
    if (vigentesComportamentales + comportamentales.length >= MAX_COMPORTAMENTALES) {
      toast.error(
        vigentesComportamentales > 0
          ? `Ya hay ${vigentesComportamentales} competencia(s) aprobada(s). Máximo permitido: ${MAX_COMPORTAMENTALES}.`
          : `Máximo ${MAX_COMPORTAMENTALES} competencias comportamentales.`
      )
      return
    }
    setComportamentales([...comportamentales, {
      competencia_codigo: codigo,
      competencia_nombre: comp.nombre || comp.descripcion || '',
      decreto: comp.decreto || '815/2018',
    }])
  }

  function eliminarComportamental(idx: number) {
    setComportamentales(prev => prev.filter((_, i) => i !== idx))
  }

  const totalPeso = funcionales.reduce((acc, f) => acc + (Number(f.peso) || 0), 0)

  // Cupos disponibles en la concertación (vigentes + nuevos propios <= MAX)
  const cupoFuncionalesDisponible = MAX_FUNCIONALES - vigentesFuncionales
  const cupoComportamentalesDisponible = MAX_COMPORTAMENTALES - vigentesComportamentales

  // Reglas:
  // 1) Total nuevos + vigentes <= MAX (cupo)
  // 2) Si NO hay vigentes, los NUEVOS deben respetar el mínimo del Acuerdo 617
  //    (1 funcional mínimo no se exige en frontend; comportamentales mínimo 3)
  // 3) Si YA hay vigentes, el evaluado puede proponer solo los que faltan
  //    para llenar hasta MAX (sin mínimo adicional)
  const cumpleMinimoFuncionales = funcionales.length >= 1
  const cumpleMinimoComportamentales =
    vigentesComportamentales >= MIN_COMPORTAMENTALES  // ya hay vigentes, OK
    || comportamentales.length >= MIN_COMPORTAMENTALES // propuesta nueva cumple
  const cumpleMaximo =
    (vigentesFuncionales + funcionales.length) <= MAX_FUNCIONALES
    && (vigentesComportamentales + comportamentales.length) <= MAX_COMPORTAMENTALES
  const cumplePesos = Math.abs(totalPeso - 100) < 0.01

  async function enviarPropuesta() {
    if (!contexto.evaluacion_id && !contexto.concertacion_id) {
      toast.error('Seleccione una evaluación para proponer compromisos.')
      return
    }
    if (!contexto.evaluador_id) {
      toast.error('No se encontró el evaluador asignado para esta evaluación.')
      return
    }

    // --- Recopilar TODAS las validaciones faltantes ---
    const errores: string[] = []

    // Funcionales
    if (funcionales.length < 1) {
      errores.push('• Al menos 1 compromiso funcional (máx. 3)')
    } else {
      const funcIncompletos = funcionales.filter(f => !f.descripcion?.trim() || !(Number(f.peso) > 0))
      if (funcIncompletos.length > 0) {
        errores.push('• Todos los funcionales: descripción y peso > 0')
      }
      if (!cumplePesos) {
        errores.push(`• Suma de pesos funcionales = 100% (actual: ${totalPeso}%)`)
      }
      const funcSinMeta = funcionales.filter(f => !f.meta_id)
      if (funcSinMeta.length > 0) {
        errores.push('• Meta institucional en TODOS los funcionales')
      }
      if (vigentesFuncionales + funcionales.length > MAX_FUNCIONALES) {
        errores.push(`• Máx. ${MAX_FUNCIONALES} funcionales totales (vigentes + nuevos)`)
      }
    }

    // Comportamentales
    const totalComp = vigentesComportamentales + comportamentales.length
    if (vigentesComportamentales < MIN_COMPORTAMENTALES && comportamentales.length < MIN_COMPORTAMENTALES) {
      errores.push(`• Mínimo ${MIN_COMPORTAMENTALES} comportamentales (lleva ${comportamentales.length} propuestos + ${vigentesComportamentales} vigentes)`)
    } else if (vigentesComportamentales >= MIN_COMPORTAMENTALES && comportamentales.length === 0) {
      errores.push('• Al menos 1 comportamental nuevo (ya hay mínimos vigentes)')
    }
    if (totalComp > MAX_COMPORTAMENTALES) {
      errores.push(`• Máx. ${MAX_COMPORTAMENTALES} comportamentales totales (vigentes + nuevos)`)
    }

    // Si hay errores, mostrar TODOS en un toast agrupado
    if (errores.length > 0) {
      toast.error(
        <div style={{ textAlign: 'left', maxWidth: '380px' }}>
          <strong>Faltan requisitos para enviar:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0, lineHeight: 1.8 }}>
            {errores.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>,
        { duration: 8000 }
      )
      return
    }

    setGuardando(true)
    try {
      // Enviar cada funcional individualmente (backend requiere POST unitario)
      for (const f of funcionales) {
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
      // Enviar cada competencia individualmente
      for (const c of comportamentales) {
        await api.post('/compromisos-comportamentales/enviar', {
          evaluacion_id: contexto.evaluacion_id,
          concertacion_id: contexto.concertacion_id,
          competencia_codigo: c.competencia_codigo,
          descripcion: c.competencia_nombre,
          observaciones_evaluado: observaciones.trim() || null,
        })
      }

      toast.success(
        `Propuesta enviada: ${funcionales.length} funcional(es) y ${comportamentales.length} comportamental(es). ` +
        `El Jefe de Dependencia revisará su propuesta.`
      )
      setObservaciones('')
      setFuncionales([])
      setComportamentales([])
      // Recargar contadores (los enviados pasan a "pendientes")
      await cargarContextoEvaluacion(contexto.evaluacion_id!)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al enviar la propuesta'
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
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
  const esTerminal = ESTADOS_TERMINALES.has(evaluacionSeleccionadaObj?.estado || '')
  const puedeProponer = !esTerminal && evaluacionSeleccionadaObj?.puede_proponer !== 0

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
              className="edl-select"
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
              className="edl-select"
              disabled={evaluaciones.length === 0 || cargandoEvaluaciones}
            >
              {evaluaciones.length === 0 ? (
                <option value={0}>
                  {periodoSeleccionado > 0
                    ? 'No hay evaluaciones en este período...'
                    : 'Seleccione primero un período...'}
                </option>
              ) : (
                <>
                  <option value={0}>Seleccione tipo de evaluación...</option>
                  {evaluaciones.map(ev => {
                    const terminal = ESTADOS_TERMINALES.has(ev.estado)
                    const puedeProponer = !terminal && ev.puede_proponer !== 0
                    const prefijo = terminal ? '[NO DISPONIBLE] ' : (!puedeProponer ? '[BLOQUEADO] ' : '')
                    return (
                      <option
                        key={ev.id}
                        value={ev.id}
                        disabled={terminal || !puedeProponer}
                      >
                        {prefijo}{TIPO_EVALUACION_LABEL[ev.tipo] || ev.tipo} ({ev.estado})
                      </option>
                    )
                  })}
                </>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-inst-texto-claro">
              {cargandoEvaluaciones && <span className="flex items-center gap-1 text-inst-azul"><span className="material-icons text-sm animate-spin">sync</span>Cargando...</span>}
              {!cargandoEvaluaciones && periodoSeleccionado > 0 && (
                (() => {
                  const tienePrimero = evaluaciones.some(e => e.tipo === 'parcial_primer_semestre')
                  const tieneSegundo = evaluaciones.some(e => e.tipo === 'parcial_segundo_semestre')
                  if (tienePrimero && tieneSegundo) return null
                  return (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {!tienePrimero && (
                        <button
                          type="button"
                          onClick={() => iniciarEvaluacion('parcial_primer_semestre')}
                          disabled={iniciando}
                          className="edl-btn-primary text-sm flex items-center gap-1 flex-1 justify-center"
                        >
                          <span className="material-icons text-base">{iniciando ? 'sync' : 'play_arrow'}</span>
                          {iniciando ? 'Iniciando...' : '1er Semestre'}
                        </button>
                      )}
                      {!tieneSegundo && (
                        <button
                          type="button"
                          onClick={() => iniciarEvaluacion('parcial_segundo_semestre')}
                          disabled={iniciando}
                          className="edl-btn-outline text-sm flex items-center gap-1 flex-1 justify-center"
                        >
                          <span className="material-icons text-base">{iniciando ? 'sync' : 'play_arrow'}</span>
                          {iniciando ? 'Iniciando...' : '2do Semestre'}
                        </button>
                      )}
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {evaluacionSeleccionada > 0 && (
        <div className="edl-card mb-4 bg-inst-azul/5 border-l-4 border-l-inst-azul-osc">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-inst-texto-claro block text-xs uppercase font-bold tracking-wide">Período</span>
              <span className="font-medium text-inst-azul-osc">{contexto.periodo_nombre || '—'}</span>
            </div>
            <div>
              <span className="text-inst-texto-claro block text-xs uppercase font-bold tracking-wide">Jefe de Dependencia (revisor)</span>
              <span className="font-medium text-inst-azul-osc">{contexto.evaluador_nombre || '—'}</span>
            </div>
            <div>
              <span className="text-inst-texto-claro block text-xs uppercase font-bold tracking-wide">Tipo de Evaluación</span>
              <span className="font-medium text-inst-azul-osc">{tipoEvaluacionLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* VISTA SOLO LECTURA: evaluación terminal (calificada/cerrada/anulada) */}
      {evaluacionSeleccionada > 0 && esTerminal && (
        <div className="edl-card mb-4 bg-gray-100 border-l-4 border-l-gray-500">
          <div className="flex gap-3">
            <span className="material-icons text-gray-700" style={{ fontSize: '40px' }}>lock</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1 text-base">
                Esta evaluación ya fue {evaluacionSeleccionadaObj?.estado === 'calificada' ? 'calificada' :
                  evaluacionSeleccionadaObj?.estado === 'aprobada_comision' ? 'aprobada por la comisión evaluadora' :
                  evaluacionSeleccionadaObj?.estado === 'cerrada' ? 'cerrada' : 'anulada'}.
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                No es posible proponer nuevos compromisos ni modificar los existentes.
                La concertación de este periodo ya está finalizada.
              </p>
              {evaluacionSeleccionadaObj?.calificacion_definitiva && (
                <div className="bg-white p-3 rounded border border-gray-300 inline-block">
                  <span className="text-xs uppercase font-bold text-gray-500 block">Calificación definitiva</span>
                  <span className="text-2xl font-bold text-inst-azul-osc">
                    {Number(evaluacionSeleccionadaObj.calificacion_definitiva).toFixed(2)}
                  </span>
                  {evaluacionSeleccionadaObj?.nivel_resultado && (
                    <span className="ml-2 text-sm text-gray-600 capitalize">
                      ({String(evaluacionSeleccionadaObj.nivel_resultado).replace(/_/g, ' ')})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA BLOQUEADO: evaluación con concertación activa */}
      {evaluacionSeleccionada > 0 && !esTerminal && !puedeProponer && (
        <div className="edl-card mb-4 bg-amber-50 border-l-4 border-l-amber-500">
          <div className="flex gap-3">
            <span className="material-icons text-amber-600" style={{ fontSize: '40px' }}>lock</span>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 mb-1 text-base">
                Concertación en curso
              </h4>
              <p className="text-sm text-amber-700">
                Esta evaluación ya tiene una concertación activa. No puede proponer nuevos compromisos
                hasta que acepte o rechace la concertación actual desde la sección "Mis Compromisos".
              </p>
            </div>
          </div>
        </div>
      )}

      {evaluacionSeleccionada > 0 && puedeProponer && (
        <>
          {/* COMPROMISOS FUNCIONALES (máx 3) */}
          <div className="edl-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-inst-azul-osc flex items-center gap-2">
                <span className="material-icons">task_alt</span>
                Compromisos Funcionales (máx. 3)
              </h3>
              {vigentesFuncionales + funcionales.length < MAX_FUNCIONALES && (
                <button
                  type="button"
                  className="edl-btn-outline"
                  onClick={agregarFuncional}
                  title="Agregar un nuevo compromiso funcional"
                >
                  <span className="material-icons text-base">add</span>
                  Agregar funcional
                </button>
              )}
            </div>

            {funcionales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro italic">
                No hay compromisos funcionales en esta propuesta. Agregue al menos 1 y máximo {cupoFuncionalesDisponible}.
              </p>
            ) : (
              <div className="space-y-3">
                {funcionales.map((f, idx) => (
                  <div key={idx} className="border border-inst-borde rounded-lg p-4 relative bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-inst-texto-claro">
                        Compromiso #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="edl-label">Descripción <span className="text-inst-rojo">*</span></label>
                        <textarea
                          value={f.descripcion}
                          onChange={e => actualizarFuncional(idx, 'descripcion', e.target.value)}
                          className="edl-textarea"
                          style={{ minHeight: '60px' }}
                          placeholder="Verbo en infinitivo + objeto + condición. Ej: Elaborar un informe mensual de indicadores según el cronograma."
                        />
                      </div>
                      <div>
                        <label className="edl-label">Resultado esperado</label>
                        <input
                          value={f.resultado_esperado}
                          onChange={e => actualizarFuncional(idx, 'resultado_esperado', e.target.value)}
                          className="edl-input"
                          placeholder="Qué se espera lograr"
                        />
                      </div>
                      <div>
                        <label className="edl-label">Medio de verificación</label>
                        <input
                          value={f.medio_verificacion}
                          onChange={e => actualizarFuncional(idx, 'medio_verificacion', e.target.value)}
                          className="edl-input"
                          placeholder="Cómo se verificará"
                        />
                      </div>
                      <div>
                        <label className="edl-label">Meta institucional</label>
                        <select
                          value={f.meta_id != null ? String(f.meta_id) : ''}
                          onChange={e => actualizarFuncional(idx, 'meta_id', e.target.value ? Number(e.target.value) : null)}
                          className="edl-select"
                        >
                          <option value="">Sin meta específica</option>
                          {metas.map(m => (
                            <option key={m.id} value={String(m.id)}>
                              {(m.descripcion || m.nombre || '').slice(0, 80)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="edl-label">Peso (%) <span className="text-inst-rojo">*</span></label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={f.peso}
                          onChange={e => actualizarFuncional(idx, 'peso', Number(e.target.value))}
                          className="edl-input"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => eliminarFuncional(idx)}
                        className="edl-btn-ghost text-inst-rojo hover:bg-red-50"
                        title="Eliminar este compromiso"
                      >
                        <span className="material-icons text-base">delete_outline</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                <div className={`text-sm font-medium flex items-center gap-2 p-2 rounded ${cumplePesos ? 'text-green-700 bg-green-50' : 'text-inst-rojo bg-red-50'}`}>
                  <span className="material-icons text-base">{cumplePesos ? 'check_circle' : 'warning'}</span>
                  Total pesos: {totalPeso}% {Math.abs(totalPeso - 100) > 0.01 && '(debe sumar exactamente 100%)'}
                </div>
              </div>
            )}
          </div>

          {/* COMPETENCIAS COMPORTAMENTALES (mín 3, máx 5) */}
          <div className="edl-card mb-4">
            <h3 className="font-heading font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
              <span className="material-icons">psychology</span>
              Competencias Comportamentales (mín. 3, máx. 5)
            </h3>

            {comportamentales.length > 0 && (
              <div className="space-y-2 mb-4">
                {comportamentales.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-3 border border-inst-borde rounded-lg p-3 bg-white">
                    <span className="material-icons text-inst-azul-osc mt-1">psychology</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-inst-texto">{c.competencia_nombre}</span>
                        <span className="text-xs text-inst-texto-claro">
                          ({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarComportamental(idx)}
                      className="text-inst-texto-claro hover:text-inst-rojo p-1"
                      title="Eliminar"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                ))}
                <div className={`text-sm font-medium flex items-center gap-2 p-2 rounded ${cumpleMinimoComportamentales ? 'text-green-700 bg-green-50' : 'text-inst-rojo bg-red-50'}`}>
                  <span className="material-icons text-base">{cumpleMinimoComportamentales ? 'check_circle' : 'info'}</span>
                  Propuestos en esta sesión: {comportamentales.length}
                  {vigentesComportamentales > 0 && (
                    <span className="text-xs font-normal ml-2">
                      (más {vigentesComportamentales} vigente(s) aprobado(s) en esta concertación)
                    </span>
                  )}
                  {!cumpleMinimoComportamentales && vigentesComportamentales === 0 && (
                    <span className="text-xs font-normal ml-2">(mínimo 3 requerido)</span>
                  )}
                </div>
              </div>
            )}

            {vigentesComportamentales + comportamentales.length < MAX_COMPORTAMENTALES && (
              <div className="mt-3 pt-3 border-t border-inst-borde">
                <label className="edl-label">Agregar competencia</label>
                <p className="text-xs text-inst-texto-claro mb-2">
                  {comportamentales.length} propuesto(s) en esta sesión.
                  {vigentesComportamentales > 0 && ` ${vigentesComportamentales} vigente(s) ya aprobado(s).`}
                  {' '}Cupo total: {MAX_COMPORTAMENTALES}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                  {competenciasDisponibles.slice(0, 30).map(comp => {
                    const codigo = comp.codigo || comp.id
                    return (
                      <button
                        key={codigo}
                        type="button"
                        onClick={() => agregarComportamental(comp)}
                        className="text-left text-sm p-3 border border-inst-borde rounded-lg hover:border-inst-azul-osc hover:bg-inst-azul/5 transition-colors bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-inst-texto">{comp.nombre || comp.descripcion}</span>
                          <span className="material-icons text-inst-texto-claro text-base">add_circle_outline</span>
                        </div>
                        <span className="text-xs text-inst-texto-claro">
                          {comp.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* OBSERVACIONES */}
          <div className="edl-card mb-4">
            <h3 className="font-semibold text-inst-azul-osc mb-3 flex items-center gap-2">
              <span className="material-icons">note</span>
              Observaciones para el Jefe de Dependencia
            </h3>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="edl-textarea"
              style={{ minHeight: '80px' }}
              placeholder="Aclaraciones, contexto o justificación de sus propuestas (opcional)"
            />
          </div>

          {/* ACCIONES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              type="button"
              className="edl-btn-primary"
              onClick={enviarPropuesta}
              disabled={guardando}
            >
              <span className="material-icons">{guardando ? 'sync' : 'send'}</span>
              {guardando ? 'Enviando...' : 'Enviar propuesta al Jefe de Dependencia'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
