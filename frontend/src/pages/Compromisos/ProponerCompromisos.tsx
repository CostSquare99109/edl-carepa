import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface CompromisoFuncional {
 id?: number
 tipo: string
 descripcion: string
 resultado_esperado: string
 medio_verificacion: string
 peso: number
}

interface CompetenciaComportamental {
 id?: number
 competencia_id: number
 competencia_nombre: string
 decreto: string
 conductas: string
 es_propuesto_jefe: boolean
}

const VALORACION_OPTIONS = [
 { value: 'nunca', label: 'Nunca' },
 { value: 'algunas_veces', label: 'Algunas veces' },
 { value: 'frecuentemente', label: 'Frecuentemente' },
 { value: 'siempre', label: 'Siempre' },
]

export default function ProponerCompromisos() {
 const { usuario, rolActivo } = useAuth()
 const [evaluacionId, setEvaluacionId] = useState(0)
 const [loading, setLoading] = useState(true)

 const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([])
 const [comportamentales, setComportamentales] = useState<CompetenciaComportamental[]>([])
 const [competencias, setCompetencias] = useState<any[]>([])

 const [guardando, setGuardando] = useState(false)

 useEffect(() => {
  buscarMiEvaluacion()
 }, [])

 async function buscarMiEvaluacion() {
  setLoading(true)
  try {
   const res = await api.get<PaginatedData<any>>('/evaluaciones?evaluado=me&por_pagina=5')
   const evals = res.data || []
   if (evals.length > 0) {
    const ev = evals[0]
    setEvaluacionId(ev.id)
    await cargarCompromisos(ev.id)
    await cargarCompetencias()
   }
  } catch {}
  setLoading(false)
 }

 async function cargarCompromisos(evId: number) {
  try {
   const res = await api.get<PaginatedData<any>>(`/compromisos/evaluacion/${evId}?por_pagina=50`)
   const datos = res.data || []
   setFuncionales(datos.filter((c: any) => c.tipo === 'funcional').map((c: any) => ({
    id: c.id, tipo: 'funcional', descripcion: c.descripcion,
    resultado_esperado: c.resultado_esperado || '', medio_verificacion: c.medio_verificacion || '', peso: c.peso || 0
   })))
   setComportamentales(datos.filter((c: any) => c.tipo === 'comportamental').map((c: any) => ({
    id: c.id, competencia_id: c.competencia_id || 0,
    competencia_nombre: c.compromiso_competencia || c.descripcion,
    decreto: c.decreto || '', conductas: '', es_propuesto_jefe: false
   })))
  } catch {}
 }

 async function cargarCompetencias() {
  try {
   const res = await api.get<any>('/compromisos/competencias-comportamentales')
   setCompetencias(res.data || [])
  } catch {}
 }

 function agregarFuncional() {
  setFuncionales([...funcionales, {
   tipo: 'funcional', descripcion: '', resultado_esperado: '',
   medio_verificacion: '', peso: 0
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
  if (comportamentales.find(c => c.competencia_id === comp.id)) return
  setComportamentales([...comportamentales, {
   competencia_id: comp.id,
   competencia_nombre: comp.nombre || comp.descripcion,
   decreto: comp.decreto || '',
   conductas: '',
   es_propuesto_jefe: false
  }])
 }

 function eliminarComportamental(idx: number) {
  setComportamentales(comportamentales.filter((_, i) => i !== idx))
 }

 function togglePropuestoJefe(idx: number) {
  const nuevos = [...comportamentales]
  nuevos[idx] = { ...nuevos[idx], es_propuesto_jefe: !nuevos[idx].es_propuesto_jefe }
  setComportamentales(nuevos)
 }

 const totalPeso = funcionales.reduce((acc, f) => acc + (Number(f.peso) || 0), 0)

 async function guardarPropuesta() {
  if (funcionales.length < 1) {
   alert('Debe ingresar al menos 1 compromiso funcional.')
   return
  }
  if (comportamentales.length < 3) {
   alert('Debe seleccionar al menos 3 competencias comportamentales.')
   return
  }
  if (totalPeso !== 100) {
   alert('La suma de los pesos de los compromisos funcionales debe ser igual a 100.')
   return
  }
  if (!evaluacionId) {
   alert('No se encontro una evaluacion activa para su usuario.')
   return
  }

  setGuardando(true)
  try {
   for (const f of funcionales) {
    if (f.id) {
     await api.put(`/compromisos/${f.id}`, {
      descripcion: f.descripcion, resultado_esperado: f.resultado_esperado,
      medio_verificacion: f.medio_verificacion, peso: f.peso, tipo: 'funcional'
     })
    } else {
     await api.post('/compromisos/funcional', {
      evaluacion_id: evaluacionId, descripcion: f.descripcion,
      resultado_esperado: f.resultado_esperado, medio_verificacion: f.medio_verificacion,
      peso: f.peso, es_propuesto_evaluado: true
     })
    }
   }

   for (const c of comportamentales) {
    if (c.id) continue
    await api.post('/compromisos/comportamental', {
     evaluacion_id: evaluacionId, competencia_id: c.competencia_id,
     compromiso_competencia: c.competencia_nombre,
     es_propuesto_jefe: c.es_propuesto_jefe, es_propuesto_evaluado: true
    })
   }

   alert('Propuesta de compromisos enviada correctamente.')
   buscarMiEvaluacion()
  } catch (e: any) {
   alert(e.message || 'Error al guardar la propuesta')
  }
  setGuardando(false)
 }

 const competenciasDisponibles = competencias.filter(
  c => !comportamentales.find(b => b.competencia_id === c.id)
 )

 if (loading) {
  return <div className="text-inst-texto-claro text-sm py-8 text-center">Cargando...</div>
 }

 if (!evaluacionId) {
  return (
   <div>
    <h2 className="edl-section-title">Proponer Compromisos</h2>
    <p className="text-inst-texto-claro text-sm mt-2">No tiene una evaluacion activa para proponer compromisos.</p>
   </div>
  )
 }

 return (
  <div>
   <div className="flex items-center gap-2 mb-1">
    <span className="material-icons text-inst-azul text-xl">rate_review</span>
    <h2 className="edl-section-title">Proponer Compromisos</h2>
   </div>
   <p className="text-sm text-inst-texto-claro mb-4 ml-7">
    Ingrese los compromisos funcionales y competencias comportamentales que desea proponer.
   </p>

   <div className="edl-card mb-6">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-heading font-semibold text-inst-azul">Compromisos Funcionales</h3>
     <button onClick={agregarFuncional} className="edl-btn-outline text-sm flex items-center gap-1">
      <span className="material-icons text-sm">add</span>Agregar
     </button>
    </div>
    {funcionales.length === 0 ? (
     <p className="text-sm text-inst-texto-claro">No hay compromisos funcionales. Agregue al menos 1.</p>
    ) : (
     <div className="space-y-4">
      {funcionales.map((f, idx) => (
       <div key={idx} className="border border-inst-borde rounded p-4 relative">
        <button onClick={() => eliminarFuncional(idx)}
         className="absolute top-2 right-2 text-inst-texto-claro hover:text-inst-rojo">
         <span className="material-icons text-lg">close</span>
        </button>
        <div className="space-y-3">
         <div>
          <label className="edl-label">Descripcion</label>
          <textarea value={f.descripcion} onChange={e => actualizarFuncional(idx, 'descripcion', e.target.value)}
           className="edl-input min-h-[60px]" placeholder="Descripcion del compromiso funcional" />
         </div>
         <div>
          <label className="edl-label">Resultado esperado</label>
          <input value={f.resultado_esperado} onChange={e => actualizarFuncional(idx, 'resultado_esperado', e.target.value)}
           className="edl-input" placeholder="Resultado esperado" />
         </div>
         <div>
          <label className="edl-label">Medio de verificacion</label>
          <input value={f.medio_verificacion} onChange={e => actualizarFuncional(idx, 'medio_verificacion', e.target.value)}
           className="edl-input" placeholder="Medio de verificacion" />
         </div>
         <div className="w-32">
          <label className="edl-label">Peso (%)</label>
          <input type="number" min={0} max={100} value={f.peso}
           onChange={e => actualizarFuncional(idx, 'peso', Number(e.target.value))}
           className="edl-input" />
         </div>
        </div>
       </div>
      ))}
      <div className={`text-sm font-medium ${totalPeso === 100 ? 'text-inst-verde' : 'text-inst-rojo'}`}>
       Total pesos: {totalPeso}% {totalPeso !== 100 && '(debe sumar 100%)'}
      </div>
     </div>
    )}
   </div>

   <div className="edl-card mb-6">
    <h3 className="font-heading font-semibold text-inst-azul mb-4">Competencias Comportamentales</h3>
    {comportamentales.length > 0 && (
     <div className="space-y-2 mb-4">
      {comportamentales.map((c, idx) => (
       <div key={idx} className="flex items-center gap-3 border border-inst-borde rounded p-3">
        <div className="flex-1">
         <span className="font-medium text-sm text-inst-texto">{c.competencia_nombre}</span>
         <span className="text-xs text-inst-texto-claro ml-2">({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})</span>
        </div>
        <label className="flex items-center gap-1 text-xs">
         <input type="checkbox" checked={c.es_propuesto_jefe}
          onChange={() => togglePropuestoJefe(idx)} className="rounded" />
         Propuesto por el jefe
        </label>
        <button onClick={() => eliminarComportamental(idx)} className="text-inst-texto-claro hover:text-inst-rojo">
         <span className="material-icons text-lg">close</span>
        </button>
       </div>
      ))}
     </div>
    )}
    {competenciasDisponibles.length > 0 && (
     <div>
      <label className="edl-label">Agregar competencia</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
       {competenciasDisponibles.slice(0, 15).map(comp => (
        <button key={comp.id} onClick={() => agregarComportamental(comp)}
         className="text-left text-sm p-2 border border-inst-borde rounded hover:border-inst-azul hover:bg-inst-azul/5 transition-colors">
         {comp.nombre || comp.descripcion}
         <span className="text-xs text-inst-texto-claro block">
          {comp.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'}
         </span>
        </button>
       ))}
      </div>
     </div>
    )}
    <p className="text-xs text-inst-texto-claro mt-2">
     Seleccionadas: {comportamentales.length} (minimo 3, maximo 5)
    </p>
   </div>

   <div className="flex justify-end">
    <button onClick={guardarPropuesta} disabled={guardando}
     className="edl-btn-primary flex items-center gap-2 disabled:opacity-50">
     <span className="material-icons text-sm">send</span>
     {guardando ? 'Enviando...' : 'Enviar propuesta'}
    </button>
   </div>
  </div>
 )
}
