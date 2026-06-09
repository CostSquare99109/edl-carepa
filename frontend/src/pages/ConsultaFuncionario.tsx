import { useState } from 'react'
import { api } from '../lib/api'

interface DatosFuncionario {
 id: number
 documento: string
 tipo_documento: string
 nombres: string
 apellidos: string
 genero: string | null
 municipio: string | null
 email: string
 cargo: string | null
 denominacion_empleo: string | null
 codigo_empleo: string | null
 grado: string | null
 tipo_vinculacion: string | null
 nivel_carrera: string | null
 naturaleza: string | null
 tipo_nombramiento: string | null
 dependencia_id: number | null
 dependencia_nombre: string | null
 estado: string
 periodo_prueba: number
}

export default function ConsultaFuncionario() {
 const [documento, setDocumento] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [funcionario, setFuncionario] = useState<DatosFuncionario | null>(null)

 const buscar = async () => {
  if (!documento.trim()) return
  setLoading(true)
  setError('')
  setFuncionario(null)
  try {
   const data = await api.get<DatosFuncionario>(`/consulta-funcionario/${documento.trim()}`)
   setFuncionario(data)
  } catch (e: any) {
   setError(e.message || 'Funcionario no encontrado')
  } finally {
   setLoading(false)
  }
 }

 const VINCULACION_LABELS: Record<string, string> = {
  planta: 'Planta',
  contrato: 'Contrato',
  provisional: 'Provisional',
  encargo: 'Encargo',
  comision: 'Comisión',
 }

 const NATURALEZA_LABELS: Record<string, string> = {
  carrera: 'Carrera',
  libre_nombramiento: 'Libre Nombramiento',
  provisional: 'Provisional',
  temporal: 'Temporal',
  contrato_obras: 'Contrato por Obras',
 }

 return (
  <div className="space-y-6">
   <h2 className="text-xl font-bold text-inst-azul">
    <span className="material-icons text-lg align-middle mr-1">search</span>
    Consulta de Funcionario
   </h2>

   <div className="edl-card">
    <div className="flex gap-2 items-end">
     <div className="flex-1">
      <label className="block text-xs font-medium text-inst-texto-claro mb-1">
       Numero de Documento
      </label>
      <input
       type="text"
       value={documento}
       onChange={e => setDocumento(e.target.value)}
       onKeyDown={e => e.key === 'Enter' && buscar()}
       placeholder="Ingrese el numero de documento"
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

   {funcionario && (
    <div className="edl-card">
     <div className="flex items-center gap-3 mb-4">
      <span className="material-icons text-3xl text-inst-azul">badge</span>
      <div>
       <h3 className="text-lg font-bold text-inst-azul">
        {funcionario.nombres} {funcionario.apellidos}
       </h3>
       <p className="text-sm text-inst-texto-claro">
        {funcionario.tipo_documento} {funcionario.documento}
        {funcionario.estado !== 'activo' && (
         <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
          {funcionario.estado}
         </span>
        )}
       </p>
      </div>
     </div>

     <div className="edl-divider" />
     <div className="edl-divider-accent" />

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {[
       { label: 'Cargo', value: funcionario.cargo },
       { label: 'Denominación', value: funcionario.denominacion_empleo },
       { label: 'Código Empleo', value: funcionario.codigo_empleo },
       { label: 'Grado', value: funcionario.grado },
       { label: 'Tipo Vinculación', value: funcionario.tipo_vinculacion ? VINCULACION_LABELS[funcionario.tipo_vinculacion] || funcionario.tipo_vinculacion : null },
       { label: 'Nivel Carrera', value: funcionario.nivel_carrera },
       { label: 'Naturaleza', value: funcionario.naturaleza ? NATURALEZA_LABELS[funcionario.naturaleza] || funcionario.naturaleza : null },
       { label: 'Tipo Nombramiento', value: funcionario.tipo_nombramiento },
       { label: 'Dependencia', value: funcionario.dependencia_nombre },
       { label: 'Municipio', value: funcionario.municipio },
       { label: 'Email', value: funcionario.email },
       { label: 'Período Prueba', value: funcionario.periodo_prueba === 1 ? 'Si' : 'No' },
      ].filter(f => f.value).map(f => (
       <div key={f.label} className="bg-inst-gris rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wider text-inst-texto-claro mb-1">{f.label}</p>
        <p className="text-sm font-medium text-inst-texto">{f.value}</p>
       </div>
      ))}
     </div>
    </div>
   )}
  </div>
 )
}
