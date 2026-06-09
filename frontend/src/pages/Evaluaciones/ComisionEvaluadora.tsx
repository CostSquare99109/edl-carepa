import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

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

const NIVEL_LABEL: Record<string, { text: string; color: string }> = {
 sobresaliente: { text: 'Sobresaliente', color: 'bg-green-100 text-green-800' },
 satisfactorio: { text: 'Satisfactorio', color: 'bg-blue-100 text-blue-800' },
 no_satisfactorio: { text: 'No Satisfactorio', color: 'bg-red-100 text-red-800' },
}

export default function ComisionEvaluadora() {
 const { rolActivo } = useAuth()
 const [evaluaciones, setEvaluaciones] = useState<EvaluacionComision[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [cargando, setCargando] = useState(true)
 const [filtroEstado, setFiltroEstado] = useState('calificada')
 const [busqueda, setBusqueda] = useState('')
 const [modalAprobar, setModalAprobar] = useState<EvaluacionComision | null>(null)
 const [observaciones, setObservaciones] = useState('')
 const [procesando, setProcesando] = useState(false)

 useEffect(() => { cargarEvaluaciones() }, [pagina, filtroEstado])

 async function cargarEvaluaciones() {
  setCargando(true)
  try {
   let url = `/evaluaciones?por_pagina=20&pagina=${pagina}`
   if (filtroEstado) url += `&estado=${filtroEstado}`
   if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
   const res = await api.get<PaginatedData<EvaluacionComision>>(url)
   setEvaluaciones(res.data || [])
   setTotal(res.total || 0)
  } catch (e: any) { console.error(e) }
  setCargando(false)
 }

 async function aprobarEvaluacion(accion: 'aprobar' | 'rechazar') {
  if (!modalAprobar) return
  setProcesando(true)
  try {
   await api.put(`/evaluaciones/${modalAprobar.id}/comision`, {
    accion,
    observaciones,
   })
   setModalAprobar(null)
   setObservaciones('')
   cargarEvaluaciones()
  } catch (e: any) { alert(e.message || 'Error al procesar') }
  setProcesando(false)
 }

 const totalPages = Math.ceil(total / 20)

 return (
  <div className="min-h-screen">
   <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul text-xl">gavel</span>
     <h2 className="edl-section-title">Comision Evaluadora</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">Revision y aprobacion de evaluaciones calificadas</p>
   </div>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
       onKeyDown={e => e.key === 'Enter' && cargarEvaluaciones()}
       className="edl-input" placeholder="Buscar evaluado..." />
     </div>
     <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}
      className="edl-input w-auto">
      <option value="calificada">Por aprobar</option>
      <option value="aprobada_comision">Aprobadas</option>
      <option value="rechazada_comision">Rechazadas</option>
      <option value="">Todas</option>
     </select>
    </div>
   </div>

   {cargando ? (
    <div className="edl-card text-center py-12 text-inst-texto-claro">
     <span className="material-icons text-4xl animate-spin text-inst-azul block mx-auto">refresh</span>
    </div>
   ) : evaluaciones.length === 0 ? (
    <div className="edl-card text-center py-12 text-inst-texto-claro">
     <span className="material-icons text-5xl text-inst-borde block mx-auto mb-3">assignment_turned_in</span>
     <p className="text-lg font-medium">No hay evaluaciones pendientes</p>
    </div>
   ) : (
    <div className="space-y-3">
     {evaluaciones.map(ev => {
      const nivel = ev.nivel_resultado ? NIVEL_LABEL[ev.nivel_resultado] : null
      return (
       <div key={ev.id} className="edl-card">
        <div className="flex items-center justify-between">
         <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
           <span className="material-icons text-lg text-inst-azul">person</span>
           <span className="font-heading font-bold text-inst-texto">{ev.evaluado_nombre}</span>
           {nivel && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${nivel.color}`}>{nivel.text}</span>
           )}
           <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{ev.estado.replace('_', ' ')}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-inst-texto-claro ml-7">
           <span>Cargo: {ev.evaluado_cargo}</span>
           <span>Dep: {ev.evaluado_dependencia}</span>
           <span>Evaluador: {ev.evaluador_nombre}</span>
           {ev.calificacion_definitiva !== null && (
            <span className="font-bold">Definitiva: {ev.calificacion_definitiva}%</span>
           )}
           {ev.nota_funcionales !== null && <span>Func: {ev.nota_funcionales}%</span>}
           {ev.nota_comportamentales !== null && <span>Comp: {ev.nota_comportamentales}%</span>}
          </div>
         </div>
         {ev.estado === 'calificada' && (
          <button onClick={() => { setModalAprobar(ev); setObservaciones('') }}
           className="edl-btn-primary text-sm">
           Revisar
          </button>
         )}
        </div>
       </div>
      )
     })}
    </div>
   )}

   {totalPages > 1 && (
    <div className="flex items-center justify-center gap-2 mt-4">
     {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
      <button key={p} onClick={() => setPagina(p)}
       className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-white border hover:bg-inst-gris'}`}>{p}</button>
     ))}
    </div>
   )}

   {modalAprobar && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAprobar(null)}>
     <div className="bg-white rounded-xl shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
      <div className="px-6 py-4 border-b border-inst-borde">
       <h3 className="font-heading font-bold text-inst-texto">Revision de Evaluacion</h3>
       <p className="text-sm text-inst-texto-claro">{modalAprobar.evaluado_nombre} - {modalAprobar.evaluado_cargo}</p>
      </div>
      <div className="px-6 py-4 space-y-3">
       <div className="edl-card bg-inst-gris">
        <div className="grid grid-cols-3 gap-4 text-center">
         <div>
          <p className="text-xs text-inst-texto-claro">Funcionales</p>
          <p className="text-lg font-bold text-inst-azul">{modalAprobar.nota_funcionales ?? '-'}%</p>
         </div>
         <div>
          <p className="text-xs text-inst-texto-claro">Comportamentales</p>
          <p className="text-lg font-bold text-inst-verde">{modalAprobar.nota_comportamentales ?? '-'}%</p>
         </div>
         <div>
          <p className="text-xs text-inst-texto-claro">Definitiva</p>
          <p className="text-lg font-bold text-inst-texto">{modalAprobar.calificacion_definitiva ?? '-'}%</p>
         </div>
        </div>
        {modalAprobar.nivel_resultado && (
         <div className={`text-center py-2 rounded mt-2 text-sm font-bold ${
          (NIVEL_LABEL[modalAprobar.nivel_resultado])?.color || 'bg-gray-100'
         }`}>
          {NIVEL_LABEL[modalAprobar.nivel_resultado]?.text || modalAprobar.nivel_resultado}
         </div>
        )}
       </div>
       <div>
        <label className="edl-label">Observaciones (opcional al aprobar, obligatorio al rechazar)</label>
        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
         className="edl-input min-h-[80px]" placeholder="Observaciones de la comision" />
       </div>
      </div>
      <div className="px-6 py-4 border-t border-inst-borde flex justify-between">
       <button onClick={() => setModalAprobar(null)} className="edl-btn-outline">Cancelar</button>
       <div className="flex gap-3">
        <button onClick={() => aprobarEvaluacion('rechazar')}
         disabled={procesando} className="px-4 py-2 rounded-lg text-sm bg-inst-rojo text-white hover:opacity-90 disabled:opacity-50">
         Rechazar
        </button>
        <button onClick={() => aprobarEvaluacion('aprobar')}
         disabled={procesando} className="edl-btn-primary disabled:opacity-50">
         Aprobar
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
