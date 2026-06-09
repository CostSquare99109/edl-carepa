import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Periodo {
 id: number
 nombre: string
 fecha_inicio: string
 fecha_fin: string
 estado: string
 fecha_inicio_concertacion: string | null
 fecha_fin_concertacion: string | null
 fecha_inicio_evaluacion: string | null
 fecha_fin_evaluacion: string | null
}

interface EtapaEDL {
 key: string
 label: string
 icon: string
 descripcion: string
 color: string
 bgColor: string
}

const ETAPAS_EDL: EtapaEDL[] = [
 {
  key: 'concertacion',
  label: 'Concertacion de compromisos',
  icon: 'handshake',
  descripcion: 'El jefe inmediato y el evaluado acuerdan los compromisos funcionales y competencias comportamentales que seran evaluados.',
  color: 'text-inst-azul',
  bgColor: 'bg-blue-50 border-blue-200',
 },
 {
  key: 'seguimiento',
  label: 'Seguimiento',
  icon: 'visibility',
  descripcion: 'Seguimiento continuo al cumplimiento de compromisos y competencias concertadas. Registro de evidencias.',
  color: 'text-inst-verde',
  bgColor: 'bg-green-50 border-green-200',
 },
 {
  key: 'evaluacion_parcial_1',
  label: 'Evaluacion parcial 1er semestre',
  icon: 'rate_review',
  descripcion: 'Evaluacion parcial del desempeño al finalizar el primer semestre. Calificacion de compromisos funcionales y comportamentales.',
  color: 'text-yellow-700',
  bgColor: 'bg-yellow-50 border-yellow-200',
 },
 {
  key: 'calificacion_parcial_1',
  label: 'Calificacion parcial 1er semestre',
  icon: 'grading',
  descripcion: 'Aprobacion o rechazo de la calificacion parcial por la Comision de Evaluacion y Desempeno.',
  color: 'text-orange-700',
  bgColor: 'bg-orange-50 border-orange-200',
 },
 {
  key: 'evaluacion_parcial_2',
  label: 'Evaluacion parcial 2do semestre',
  icon: 'rate_review',
  descripcion: 'Evaluacion parcial del desempeño al finalizar el segundo semestre.',
  color: 'text-yellow-700',
  bgColor: 'bg-yellow-50 border-yellow-200',
 },
 {
  key: 'calificacion_definitiva',
  label: 'Calificacion definitiva',
  icon: 'fact_check',
  descripcion: 'Calificacion definitiva del desempeño laboral. Aprobacion por la Comision de Evaluacion. Recursos de reposicion.',
  color: 'text-inst-rojo',
  bgColor: 'bg-red-50 border-red-200',
 },
]

const ESTADO_ETAPA_MAP: Record<string, string> = {
 configuracion: 'concertacion',
 concertacion: 'concertacion',
 seguimiento: 'seguimiento',
 evaluacion: 'evaluacion_parcial_1',
 calificacion: 'calificacion_parcial_1',
 cerrado: 'calificacion_definitiva',
}

function fmtDate(d: string | null | undefined): string {
 if (!d) return '--'
 return new Date(d + 'T00:00:00').toLocaleDateString('es-CO')
}

export default function PeriodoList() {
 const [items, setItems] = useState<Periodo[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)

 function cargar() {
  setLoading(true)
  api.get<PaginatedData<Periodo>>(`/periodos?pagina=${pagina}&por_pagina=20`)
   .then(d => { setItems(d.data || []); setTotal(d.total); })
   .catch(() => {})
   .finally(() => setLoading(false))
 }

 useEffect(() => { cargar() }, [pagina])

 const estadoBadge = (e: string) => {
  const m: Record<string, string> = {
   configuracion: 'bg-blue-100 text-blue-800',
   concertacion: 'bg-blue-100 text-blue-800',
   seguimiento: 'bg-green-100 text-green-800',
   evaluacion: 'bg-yellow-100 text-yellow-800',
   calificacion: 'bg-orange-100 text-orange-800',
   cerrado: 'bg-gray-100 text-gray-700',
  }
  return m[e] || 'bg-gray-100 text-gray-700'
 }

 const estadoLabel = (e: string) => {
  const m: Record<string, string> = {
   configuracion: 'Configuracion',
   concertacion: 'Concertacion',
   seguimiento: 'Seguimiento',
   evaluacion: 'Evaluacion',
   calificacion: 'Calificacion',
   cerrado: 'Cerrado',
  }
  return m[e] || e
 }

 return (
  <div className="space-y-6">
   <div>
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul text-xl">date_range</span>
     <h2 className="edl-section-title">Periodos de Evaluacion</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Etapas del proceso EDL segun Acuerdo 617 de 2018 - Solo lectura
    </p>
   </div>

   {/* Etapas EDL informativas */}
   <div className="edl-card">
    <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
     <span className="material-icons">timeline</span>
     Etapas del Proceso EDL
    </h3>
    <div className="space-y-3">
     {ETAPAS_EDL.map((etapa, idx) => (
      <div key={etapa.key} className={`border rounded-lg p-3 flex items-start gap-3 ${etapa.bgColor}`}>
       <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-inst-texto-claro">{idx + 1}</span>
        <span className={`material-icons ${etapa.color}`}>{etapa.icon}</span>
       </div>
       <div>
        <p className={`font-semibold text-sm ${etapa.color}`}>{etapa.label}</p>
        <p className="text-xs text-inst-texto-claro mt-0.5">{etapa.descripcion}</p>
       </div>
      </div>
     ))}
    </div>
   </div>

   {/* Tabla de periodos - solo lectura */}
   {loading ? (
    <p className="text-inst-texto-claro text-sm">Cargando...</p>
   ) : items.length === 0 ? (
    <div className="text-center py-10 text-gray-400">
     <span className="material-icons text-4xl block mb-2">event_busy</span>
     No hay periodos registrados
    </div>
   ) : (
    <div className="edl-card overflow-hidden p-0">
     <table className="edl-table">
      <thead>
       <tr>
        <th>Periodo</th>
        <th>Inicio</th>
        <th>Fin</th>
        <th>Concertacion</th>
        <th>Evaluacion</th>
        <th>Estado</th>
       </tr>
      </thead>
      <tbody>
       {items.map(p => {
        const etapaActual = ESTADO_ETAPA_MAP[p.estado] || ''
        return (
         <tr key={p.id} className={p.estado === 'cerrado' ? 'opacity-60' : ''}>
          <td className="font-medium text-inst-azul">{p.nombre}</td>
          <td>{fmtDate(p.fecha_inicio)}</td>
          <td>{fmtDate(p.fecha_fin)}</td>
          <td className="text-xs">
           {fmtDate(p.fecha_inicio_concertacion)} - {fmtDate(p.fecha_fin_concertacion)}
          </td>
          <td className="text-xs">
           {fmtDate(p.fecha_inicio_evaluacion)} - {fmtDate(p.fecha_fin_evaluacion)}
          </td>
          <td>
           <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoBadge(p.estado)}`}>
            {estadoLabel(p.estado)}
           </span>
           {etapaActual && p.estado !== 'cerrado' && (
            <p className="text-[10px] text-inst-texto-claro mt-0.5">
             Etapa: {ETAPAS_EDL.find(e => e.key === etapaActual)?.label || ''}
            </p>
           )}
          </td>
         </tr>
        )
       })}
      </tbody>
     </table>
    </div>
   )}

   {total > 20 && (
    <div className="flex justify-center gap-2">
     <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
      className="edl-btn-outline text-sm disabled:opacity-50">Anterior</button>
     <span className="text-sm text-inst-texto-claro py-2">Pagina {pagina}</span>
     <button onClick={() => setPagina(p => p + 1)} disabled={pagina >= Math.ceil(total / 20)}
      className="edl-btn-outline text-sm disabled:opacity-50">Siguiente</button>
    </div>
   )}
  </div>
 )
}
