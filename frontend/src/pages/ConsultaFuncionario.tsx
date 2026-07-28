import { useState } from 'react'
import { api } from '../lib/api'

interface DatosConsulta {
 nombres: string
 apellidos: string
 documento: string
 tipo_documento: string
 estado_evaluacion: string | null
 nivel_calificacion: string | null
}

export default function ConsultaFuncionario() {
 const [documento, setDocumento] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [datos, setDatos] = useState<DatosConsulta | null>(null)

 const ESTADO_LABELS: Record<string, string> = {
 pendiente: 'Pendiente',
 concertada: 'Concertado',
 propuesta_evaluado: 'Propuesto por Evaluado',
 aprobada_evaluado: 'Aprobado por Evaluado',
 rechazada_evaluado: 'Rechazado por Evaluado',
 fijada: 'Fijado por Evaluador',
 calificada: 'Calificado',
 aprobada_comision: 'Aprobado por Comision',
 cerrada: 'Cerrado',
 }

 const NIVEL_LABELS: Record<string, string> = {
 sobresaliente: 'Sobresaliente',
 satisfactorio: 'Satisfactorio',
 no_satisfactorio: 'No Satisfactorio',
 }

 const NIVEL_COLORS: Record<string, string> = {
 sobresaliente: 'bg-green-100 text-green-800 border-green-200',
 satisfactorio: 'bg-blue-100 text-blue-800 border-blue-200',
 no_satisfactorio: 'bg-red-100 text-red-800 border-red-200',
 }

 const buscar = async () => {
 if (!documento.trim()) return
 setLoading(true)
 setError('')
 setDatos(null)
 try {
 const data = await api.get<DatosConsulta>(`/consulta-funcionario/${documento.trim()}`)
 setDatos(data)
 } catch (e: any) {
 setError(e.message || 'Funcionario no encontrado')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="space-y-6">
 <h2 className="text-xl font-bold text-inst-azul">
 <span className="material-icons text-lg align-middle mr-1">search</span>
 Consulta Publica de Evaluacion
 </h2>

 <div className="edl-card">
 <div className="bg-inst-gris rounded-lg p-3 text-sm text-inst-texto-claro flex items-start gap-2 mb-4">
 <span className="material-icons text-base mt-0.5">info</span>
 <p>Ingrese el numero de cedula para consultar el estado de evaluacion del desempeño laboral.</p>
 </div>

 <div className="flex gap-2 items-end">
 <div className="flex-1">
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">
 Numero de Cedula
 </label>
 <input
 type="text"
 value={documento}
 onChange={e => setDocumento(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && buscar()}
 placeholder="Ingrese el numero de cedula"
 className="edl-input"
 />
 </div>
 <button onClick={buscar} disabled={loading} className="edl-btn-primary">
 <span className="material-icons text-base align-middle mr-1">search</span>
 {loading ? 'Buscando...' : 'Buscar'}
 </button>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-inst-rojo/20 text-inst-rojo text-sm p-3 rounded-lg">
 {error}
 </div>
 )}

 {datos && (
 <div className="edl-card">
 <div className="flex items-center gap-3 mb-4">
 <span className="material-icons text-3xl text-inst-azul">badge</span>
 <div>
 <h3 className="text-lg font-bold text-inst-azul">
 {datos.nombres} {datos.apellidos}
 </h3>
 <p className="text-sm text-inst-texto-claro">
 {datos.tipo_documento} {datos.documento}
 </p>
 </div>
 </div>

 <div className="edl-divider" />
 <div className="edl-divider-accent" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-inst-gris rounded-lg p-4">
 <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Estado de la Evaluacion</p>
 <p className="text-sm font-semibold text-inst-texto">
 {datos.estado_evaluacion
 ? ESTADO_LABELS[datos.estado_evaluacion] || datos.estado_evaluacion
 : 'Sin evaluacion registrada'}
 </p>
 </div>

 <div className="bg-inst-gris rounded-lg p-4">
 <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">Nivel de Calificacion</p>
 {datos.nivel_calificacion ? (
 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${NIVEL_COLORS[datos.nivel_calificacion] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
 {NIVEL_LABELS[datos.nivel_calificacion] || datos.nivel_calificacion}
 </span>
 ) : (
 <p className="text-sm text-inst-texto-claro">Sin calificacion</p>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
