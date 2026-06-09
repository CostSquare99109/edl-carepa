import { useState, useEffect, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Compromiso {
 id: number
 concertacion_id: number
 tipo: string
 descripcion: string
 resultado_esperado: string | null
 medio_verificacion: string | null
 plazo: string | null
 peso: number
 estado: string
 competencia_codigo: string | null
 es_propuesto_jefe: number
 ed_nombre: string
 ed_apellido: string
 ev_nombre: string
 ev_apellido: string
 periodo_nombre: string
 creado_en: string
}

const ESTADO_COLORS: Record<string, string> = {
 concertado: 'bg-blue-100 text-blue-800',
 propuesto: 'bg-yellow-100 text-yellow-800',
 aprobado: 'bg-green-100 text-green-800',
 devuelto: 'bg-red-100 text-red-800',
 pendiente: 'bg-gray-100 text-gray-700',
 en_progreso: 'bg-indigo-100 text-indigo-800',
 cumplido: 'bg-emerald-100 text-emerald-800',
 incumplido: 'bg-red-200 text-red-900',
}

const ESTADO_LABELS: Record<string, string> = {
 concertado: 'Concertado',
 propuesto: 'Propuesto',
 aprobado: 'Aprobado',
 devuelto: 'Devuelto',
 pendiente: 'Pendiente',
 en_progreso: 'En Progreso',
 cumplido: 'Cumplido',
 incumplido: 'Incumplido',
}

const TIPO_COLORS: Record<string, string> = {
 funcional: 'bg-inst-azul/10 text-inst-azul',
 comportamental: 'bg-inst-verde/10 text-inst-verde',
}

const TIPO_LABELS: Record<string, string> = {
 funcional: 'Funcional',
 comportamental: 'Comportamental',
}

export default function AdminCompromisos() {
 const [compromisos, setCompromisos] = useState<Compromiso[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [busqueda, setBusqueda] = useState('')
 const [filtroEstado, setFiltroEstado] = useState('')
 const [filtroTipo, setFiltroTipo] = useState('')
 const [cargando, setCargando] = useState(true)
 const [error, setError] = useState('')
 const [expandido, setExpandido] = useState<number | null>(null)

 const cargar = useCallback(async () => {
  setCargando(true)
  setError('')
  try {
   let url = `/compromisos?pagina=${pagina}&por_pagina=20`
   if (busqueda) url += `&buscar=${encodeURIComponent(busqueda)}`
   if (filtroEstado) url += `&estado=${encodeURIComponent(filtroEstado)}`
   if (filtroTipo) url += `&tipo=${encodeURIComponent(filtroTipo)}`
   const res = await api.get<PaginatedData<Compromiso>>(url)
   setCompromisos(res.data || [])
   setTotal(res.total || 0)
  } catch (e: any) {
   setError(e.message || 'Error al cargar compromisos')
  }
  setCargando(false)
 }, [pagina, busqueda, filtroEstado, filtroTipo])

 useEffect(() => { cargar() }, [cargar])

 const totalPages = Math.ceil(total / 20)

 const stats = {
  total,
  concertados: compromisos.filter(c => c.estado === 'concertado').length,
  propuestos: compromisos.filter(c => c.estado === 'propuesto').length,
  aprobados: compromisos.filter(c => c.estado === 'aprobado').length,
  devueltos: compromisos.filter(c => c.estado === 'devuelto').length,
 }

 return (
  <div className="space-y-4 p-4 lg:p-6">
   <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-inst-azul">
     <span className="material-icons text-lg align-middle mr-1">task_alt</span>
     Compromisos y Competencias
    </h2>
    <span className="text-xs bg-inst-azul/10 text-inst-azul px-3 py-1.5 rounded-full font-medium">
     Acuerdo 617 de 2018
    </span>
   </div>

   <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {[
     { label: 'Total', value: stats.total, color: 'border-inst-azul' },
     { label: 'Concertados', value: stats.concertados, color: 'border-blue-500' },
     { label: 'Propuestos', value: stats.propuestos, color: 'border-yellow-500' },
     { label: 'Aprobados', value: stats.aprobados, color: 'border-green-500' },
     { label: 'Devueltos', value: stats.devueltos, color: 'border-red-500' },
    ].map(s => (
     <div key={s.label} className={`bg-white rounded-lg shadow-sm p-3 border-l-4 ${s.color}`}>
      <p className="text-2xl font-bold text-inst-azul">{s.value}</p>
      <p className="text-xs text-inst-texto-claro">{s.label}</p>
     </div>
    ))}
   </div>

   <div className="flex gap-2 flex-wrap items-center">
    <input
     value={busqueda}
     onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
     placeholder="Buscar por evaluado o descripcion..."
     className="edl-input flex-1 min-w-[200px]"
    />
    <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }} className="edl-input">
     <option value="">Todos los estados</option>
     {Object.entries(ESTADO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
    <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }} className="edl-input">
     <option value="">Todos los tipos</option>
     {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
    <button onClick={cargar} className="edl-btn-primary flex items-center gap-1">
     <span className="material-icons text-base">refresh</span>
     Actualizar
    </button>
   </div>

   {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

   {cargando ? (
    <div className="flex justify-center py-20">
     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-inst-azul" />
    </div>
   ) : compromisos.length === 0 ? (
    <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400">
     <span className="material-icons text-5xl mb-2 block">task_alt</span>
     No se encontraron compromisos
    </div>
   ) : (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
     <table className="w-full text-sm">
      <thead>
       <tr className="border-b bg-inst-gris">
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Evaluado</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Tipo</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Descripcion</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Peso</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Estado</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Periodo</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Evaluador</th>
        <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro w-10"></th>
       </tr>
      </thead>
      <tbody>
       {compromisos.map(c => (
        <>
         <tr key={c.id} className="border-b hover:bg-inst-gris/50 transition cursor-pointer" onClick={() => setExpandido(expandido === c.id ? null : c.id)}>
          <td className="px-4 py-3">
           <div className="font-medium text-inst-texto">{c.ed_nombre} {c.ed_apellido}</div>
          </td>
          <td className="px-4 py-3">
           <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLORS[c.tipo] || 'bg-gray-100 text-gray-700'}`}>
            {TIPO_LABELS[c.tipo] || c.tipo}
           </span>
          </td>
          <td className="px-4 py-3 max-w-[250px] truncate" title={c.descripcion}>
           {c.descripcion || '---'}
          </td>
          <td className="px-4 py-3 font-semibold text-inst-texto">
           {c.peso > 0 ? `${c.peso}%` : '---'}
          </td>
          <td className="px-4 py-3">
           <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[c.estado] || 'bg-gray-100 text-gray-700'}`}>
            {ESTADO_LABELS[c.estado] || c.estado}
           </span>
          </td>
          <td className="px-4 py-3 text-inst-texto-claro">{c.periodo_nombre || '---'}</td>
          <td className="px-4 py-3 text-inst-texto-claro">{c.ev_nombre} {c.ev_apellido}</td>
          <td className="px-4 py-3">
           <span className="material-icons text-base text-inst-texto-claro">
            {expandido === c.id ? 'expand_less' : 'expand_more'}
           </span>
          </td>
         </tr>
         {expandido === c.id && (
          <tr className="bg-inst-azul/3">
           <td colSpan={8} className="px-6 py-4">
            <div className="space-y-3">
             <h4 className="font-heading font-semibold text-inst-azul text-sm">
              Detalle del Compromiso #{c.id}
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {c.resultado_esperado && (
               <div className="bg-white rounded-lg p-3 border border-inst-borde">
                <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Resultado Esperado</p>
                <p className="text-sm text-inst-texto">{c.resultado_esperado}</p>
               </div>
              )}
              {c.medio_verificacion && (
               <div className="bg-white rounded-lg p-3 border border-inst-borde">
                <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Medio de Verificacion</p>
                <p className="text-sm text-inst-texto">{c.medio_verificacion}</p>
               </div>
              )}
              {c.plazo && (
               <div className="bg-white rounded-lg p-3 border border-inst-borde">
                <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Plazo</p>
                <p className="text-sm text-inst-texto">{c.plazo}</p>
               </div>
              )}
              {c.competencia_codigo && (
               <div className="bg-white rounded-lg p-3 border border-inst-borde">
                <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Competencia</p>
                <p className="text-sm text-inst-texto">{c.competencia_codigo}</p>
               </div>
              )}
             </div>
             {c.es_propuesto_jefe === 1 && (
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 text-xs text-amber-700">
               Propuesto por el jefe
              </div>
             )}
             <div className="text-xs text-inst-texto-claro">
              Creado: {c.creado_en ? new Date(c.creado_en).toLocaleString('es-CO') : '---'}
             </div>
            </div>
           </td>
          </tr>
         )}
        </>
       ))}
      </tbody>
     </table>

     {totalPages > 1 && (
      <div className="flex items-center justify-center gap-2 p-3 border-t">
       <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="edl-btn-outline text-sm">
        <span className="material-icons text-sm align-middle">chevron_left</span>
       </button>
       {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
        <button key={p} onClick={() => setPagina(p)} className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-white border hover:bg-gray-100'}`}>
         {p}
        </button>
       ))}
       <button onClick={() => setPagina(p => Math.min(totalPages, p + 1))} disabled={pagina === totalPages} className="edl-btn-outline text-sm">
        <span className="material-icons text-sm align-middle">chevron_right</span>
       </button>
       <span className="text-xs text-inst-texto-claro ml-2">{total} registro(s) - Pagina {pagina} de {totalPages}</span>
      </div>
     )}
    </div>
   )}
  </div>
 )
}
