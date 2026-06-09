import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

interface PeriodoOption { id: number; nombre: string }
interface DependenciaOption { id: number; nombre: string }

export default function ReportesPage() {
 const [tipo, setTipo] = useState('concertacion')
 const [periodoId, setPeriodoId] = useState('')
 const [dependenciaId, setDependenciaId] = useState('')
 const [funcionarioId, setFuncionarioId] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [reporte, setReporte] = useState<any>(null)
 const [periodos, setPeriodos] = useState<PeriodoOption[]>([])
 const [dependencias, setDependencias] = useState<DependenciaOption[]>([])
 const [cargandoFiltros, setCargandoFiltros] = useState(true)

 useEffect(() => {
 (async () => {
 try {
 const [pRes, dRes] = await Promise.all([
 api.get<any>('/periodos?por_pagina=100'),
 api.get<any>('/dependencias?por_pagina=100'),
 ])
 setPeriodos(Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes) ? pRes : [])
 setDependencias(Array.isArray(dRes?.data) ? dRes.data : Array.isArray(dRes) ? dRes : [])
 } catch (e) {
 console.error('Error cargando filtros:', e)
 }
 setCargandoFiltros(false)
 })()
 }, [])

 const generarReporte = async () => {
  setLoading(true)
  setError('')
  setReporte(null)
  try {
   const params = new URLSearchParams()
   if (periodoId) params.set('periodo_id', periodoId)
   if (dependenciaId) params.set('dependencia_id', dependenciaId)

   const endpoints: Record<string, string> = {
    concertacion: `/reportes/concertacion?${params.toString()}`,
    evaluaciones: `/reportes/evaluaciones?${params.toString()}`,
    resumen: `/reportes/resumen?${params.toString()}`,
    compromisos: `/reportes/compromisos?${params.toString()}`,
    funcionario: `/reportes/funcionario/${funcionarioId || '0'}`,
    dependencia: `/reportes/dependencia/${dependenciaId || '0'}?${params.toString()}`,
    entidad: `/reportes/entidad/1?${params.toString()}`,
   }

   const data = await api.get<any>(endpoints[tipo] || endpoints.concertacion)
   setReporte(data)
  } catch (e: any) {
   setError(e.message || 'Error al generar reporte')
  } finally {
   setLoading(false)
  }
 }

 const descargarPDF = async (tipoPdf: string, id: string) => {
  if (!id) { alert('Ingrese el ID'); return }
  try {
   const path = tipoPdf === 'concertacion'
    ? `/reportes/concertacion-pdf/${id}`
    : `/reportes/evaluacion-pdf/${id}`
   const blob = await api.getBlob(path)
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `${tipoPdf}_${id}.pdf`
   a.click()
   URL.revokeObjectURL(url)
  } catch (e: any) {
   alert(e.message || 'Error al generar PDF')
  }
 }

 const descargarExcel = async (tipoExcel: string) => {
  try {
   const blob = await api.getBlob(`/reportes/excel/${tipoExcel}`)
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `reporte_${tipoExcel}.xlsx`
   a.click()
   URL.revokeObjectURL(url)
  } catch (e: any) {
   alert(e.message || 'Error al generar Excel')
  }
 }

 const TIPOS_REPORTE = [
  { value: 'concertacion', label: 'Concertacion', icon: 'handshake' },
  { value: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment' },
  { value: 'resumen', label: 'Resumen General', icon: 'summarize' },
  { value: 'compromisos', label: 'Compromisos', icon: 'task_alt' },
  { value: 'funcionario', label: 'Por Funcionario', icon: 'person' },
  { value: 'dependencia', label: 'Por Dependencia', icon: 'account_tree' },
  { value: 'entidad', label: 'Por Entidad', icon: 'business' },
 ]

 return (
  <div className="space-y-6">
   <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-inst-azul">
     <span className="material-icons text-lg align-middle mr-1">summarize</span>
     Reportes
    </h2>
    <span className="text-xs bg-inst-azul/10 text-inst-azul px-3 py-1.5 rounded-full font-medium">
     Acuerdo 617 de 2018
    </span>
   </div>

   <div className="edl-card">
    <h3 className="text-sm font-semibold text-inst-azul mb-4">Tipo de Reporte</h3>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
     {TIPOS_REPORTE.map(t => (
      <button
       key={t.value}
       onClick={() => setTipo(t.value)}
       className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
        tipo === t.value
         ? 'bg-inst-azul text-white border-inst-azul'
         : 'bg-white text-inst-texto border-inst-borde hover:bg-inst-gris'
       }`}
      >
       <span className="material-icons text-base">{t.icon}</span>
       {t.label}
      </button>
     ))}
    </div>
   </div>

   <div className="edl-card">
    <h3 className="text-sm font-semibold text-inst-azul mb-4">Filtros</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
     {tipo !== 'funcionario' && (
      <div>
       <label className="block text-xs font-medium text-inst-texto-claro mb-1">Periodo</label>
       <select value={periodoId} onChange={e => setPeriodoId(e.target.value)} className="edl-input">
        <option value="">Todos</option>
        {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
       </select>
      </div>
     )}
     {tipo === 'funcionario' && (
      <div>
       <label className="block text-xs font-medium text-inst-texto-claro mb-1">ID Funcionario</label>
       <input type="number" value={funcionarioId} onChange={e => setFuncionarioId(e.target.value)} placeholder="Ej: 1" className="edl-input" />
      </div>
     )}
     {['dependencia', 'concertacion', 'evaluaciones', 'compromisos', 'resumen'].includes(tipo) && (
      <div>
       <label className="block text-xs font-medium text-inst-texto-claro mb-1">Dependencia</label>
       <select value={dependenciaId} onChange={e => setDependenciaId(e.target.value)} className="edl-input">
        <option value="">Todas</option>
        {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
       </select>
      </div>
     )}
    </div>
    <div className="mt-4 flex gap-2 flex-wrap">
     <button onClick={generarReporte} disabled={loading} className="edl-btn-primary">
      <span className="material-icons text-base align-middle mr-1">play_arrow</span>
      {loading ? 'Generando...' : 'Generar Reporte'}
     </button>
    </div>
   </div>

   <div className="edl-card">
    <h3 className="text-sm font-semibold text-inst-azul mb-4">Descargas</h3>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
     <button onClick={() => descargarPDF('concertacion', funcionarioId || '1')} className="edl-btn-outline text-sm flex items-center gap-1">
      <span className="material-icons text-base">picture_as_pdf</span>
      PDF Concertacion
     </button>
     <button onClick={() => descargarPDF('evaluacion', funcionarioId || '1')} className="edl-btn-outline text-sm flex items-center gap-1">
      <span className="material-icons text-base">picture_as_pdf</span>
      PDF Evaluacion
     </button>
     <button onClick={() => descargarExcel('concertacion')} className="edl-btn-outline text-sm flex items-center gap-1">
      <span className="material-icons text-base">table_view</span>
      Excel Concertacion
     </button>
     <button onClick={() => descargarExcel('evaluaciones')} className="edl-btn-outline text-sm flex items-center gap-1">
      <span className="material-icons text-base">table_view</span>
      Excel Evaluaciones
     </button>
    </div>
   </div>

   {error && (
    <div className="bg-red-50 border border-inst-rojo/20 text-inst-rojo text-sm p-3 rounded-lg">{error}</div>
   )}

   {reporte && (
    <div className="edl-card">
     <h3 className="text-sm font-semibold text-inst-azul mb-3">Resultado</h3>
     <pre className="text-xs bg-inst-gris p-4 rounded overflow-auto max-h-96">
      {JSON.stringify(reporte, null, 2)}
     </pre>
    </div>
   )}
  </div>
 )
}
