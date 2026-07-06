import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'

interface Solicitud {
 id: number
 evaluado_id: number
 evaluador_actual_id: number
 evaluador_sugerido_id: number | null
 motivo: string
 descripcion: string
 estado: string
 nuevo_evaluador_id: number | null
 decision_comentario: string | null
 decidido_por: number | null
 creado_en: string
 evaluador_actual_nombres: string
 evaluador_actual_apellidos: string
 evaluado_nombres: string
 evaluado_apellidos: string
 evaluado_documento: string
}

interface UsuarioOption {
 id: number
 documento: string
 label: string
}

const MOTIVO_LABELS: Record<string, string> = {
 retiro_empleado_responsable: 'Retiro del empleado responsable',
 impedimento: 'Impedimento del evaluador',
 recusacion: 'Recusación del evaluado',
}

export default function SolicitudesCambioPage() {
 const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [mensaje, setMensaje] = useState({ tipo: 'success' as 'success' | 'error', texto: '' })

 const [revisionId, setRevisionId] = useState<number | null>(null)
 const [nuevoEvaluadorId, setNuevoEvaluadorId] = useState<number | null>(null)
 const [busquedaEvaluadores, setBusquedaEvaluadores] = useState('')
 const [evaluadores, setEvaluadores] = useState<UsuarioOption[]>([])
 const [buscandoEvaluadores, setBuscandoEvaluadores] = useState(false)
 const [decisionComentario, setDecisionComentario] = useState('')

 useEffect(() => {
  cargarSolicitudes()
 }, [])

 async function cargarSolicitudes() {
  setLoading(true)
  try {
   const res = await api.get<PaginatedData<Solicitud>>('/solicitudes-cambio/pendientes-jefe?por_pagina=100')
   setSolicitudes(res.data || res.items || [])
  } catch (err: any) {
   setMensaje({ tipo: 'error', texto: err.message || 'Error al cargar solicitudes' })
  } finally {
   setLoading(false)
  }
 }

 async function buscarEvaluadores(query: string) {
  if (query.length < 2) { setEvaluadores([]); return }
  setBuscandoEvaluadores(true)
  try {
   const res = await api.get<{ data: UsuarioOption[] }>(`/usuarios/evaluadores-buscar?q=${encodeURIComponent(query)}&por_pagina=20`)
   setEvaluadores(res.data || [])
  } catch {
   setEvaluadores([])
  } finally {
   setBuscandoEvaluadores(false)
  }
 }

 async function handleDecision(id: number, decision: 'aprobar' | 'rechazar') {
  if (decision === 'aprobar' && !nuevoEvaluadorId) {
   setMensaje({ tipo: 'error', texto: 'Debe seleccionar un nuevo evaluador para aprobar la solicitud' })
   return
  }
  setSaving(true)
  try {
   await api.put(`/solicitudes-cambio/${id}/decidir`, {
    decision,
    nuevo_evaluador_id: decision === 'aprobar' ? nuevoEvaluadorId : null,
    decision_comentario: decisionComentario.trim() || null,
   })
   setMensaje({ tipo: 'success', texto: 'Solicitud ' + (decision === 'aprobar' ? 'aprobada' : 'rechazada') + ' exitosamente.' })
   setRevisionId(null)
   setNuevoEvaluadorId(null)
   setDecisionComentario('')
   setBusquedaEvaluadores('')
   setEvaluadores([])
   cargarSolicitudes()
  } catch (err: any) {
   setMensaje({ tipo: 'error', texto: err.message || 'Error al procesar solicitud' })
  } finally {
   setSaving(false)
  }
 }

 function cerrarRevision() {
  setRevisionId(null)
  setNuevoEvaluadorId(null)
  setDecisionComentario('')
  setBusquedaEvaluadores('')
  setEvaluadores([])
 }

 return (
  <div>
   <div className="flex items-center justify-between mb-6">
    <h2 className="edl-section-title">Solicitudes de Cambio de Evaluador</h2>
    <button onClick={cargarSolicitudes} className="edl-btn-secondary flex items-center gap-2 text-sm">
     <span className="material-icons text-lg">refresh</span>
     Actualizar
    </button>
   </div>

   {mensaje.texto && (
    <div className={`edl-card mb-4 border-l-4 ${mensaje.tipo === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
     <p className="text-sm font-medium">{mensaje.texto}</p>
    </div>
   )}

   {loading ? (
    <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
   ) : solicitudes.length === 0 ? (
    <div className="edl-card text-center py-8 text-inst-texto-claro">
     No hay solicitudes de cambio pendientes.
    </div>
   ) : (
    <div className="space-y-4">
     {solicitudes.map(s => (
      <div key={s.id} className="edl-card">
       <div className="flex items-start justify-between">
        <div className="flex-1">
         <div className="flex items-center gap-2 flex-wrap mb-3">
          <h3 className="font-heading font-bold text-inst-azul text-sm">
           {s.evaluado_nombres} {s.evaluado_apellidos}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Pendiente</span>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
          <div>
           <span className="text-xs text-inst-texto-claro block">Documento</span>
           <span className="font-medium">{s.evaluado_documento}</span>
          </div>
          <div>
           <span className="text-xs text-inst-texto-claro block">Evaluador actual</span>
           <span className="font-medium">{s.evaluador_actual_nombres} {s.evaluador_actual_apellidos}</span>
          </div>
          <div>
           <span className="text-xs text-inst-texto-claro block">Motivo</span>
           <span className="font-medium">{MOTIVO_LABELS[s.motivo] || s.motivo}</span>
          </div>
         </div>
         <div className="mb-3">
          <span className="text-xs text-inst-texto-claro block mb-1">Descripción</span>
          <p className="text-sm text-inst-texto bg-gray-50 p-3 rounded border">{s.descripcion}</p>
         </div>
         <div className="text-xs text-inst-texto-claro">
          Creado: {new Date(s.creado_en).toLocaleString()}
         </div>
        </div>
       </div>

       {revisionId === s.id ? (
        <div className="mt-4 border-t border-inst-borde pt-4 space-y-4">
         <div>
          <label className="edl-label">Nuevo evaluador {nuevoEvaluadorId && <span className="text-green-600 text-xs ml-1">✓ Seleccionado</span>}</label>
          <input
           type="text"
           value={busquedaEvaluadores}
           onChange={e => {
            setBusquedaEvaluadores(e.target.value)
            if (e.target.value.length >= 2) buscarEvaluadores(e.target.value)
            else setEvaluadores([])
           }}
           className="edl-input"
           placeholder="Buscar evaluador por nombre o documento..."
          />
          {buscandoEvaluadores && <p className="text-xs text-inst-texto-claro mt-1">Buscando...</p>}
          {evaluadores.length > 0 && (
           <div className="max-h-40 overflow-y-auto border rounded mt-1">
            {evaluadores.map(ev => (
             <button
              key={ev.id}
              onClick={() => {
               setNuevoEvaluadorId(ev.id)
               setBusquedaEvaluadores(ev.label)
               setEvaluadores([])
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-50 last:border-0"
             >
              {ev.label}
             </button>
            ))}
           </div>
          )}
         </div>

         <div>
          <label className="edl-label">Comentario (opcional)</label>
          <textarea
           value={decisionComentario}
           onChange={e => setDecisionComentario(e.target.value)}
           className="edl-input min-h-[60px]"
           placeholder="Comentario sobre la decisión..."
          />
         </div>

         <div className="flex gap-3 pt-2">
          <button
           onClick={() => handleDecision(s.id, 'aprobar')}
           disabled={saving || !nuevoEvaluadorId}
           className="edl-btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
           <span className="material-icons text-lg">check_circle</span>
           {saving ? 'Aprobando...' : 'Aprobar'}
          </button>
          <button
           onClick={() => handleDecision(s.id, 'rechazar')}
           disabled={saving}
           className="edl-btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
           <span className="material-icons text-lg">cancel</span>
           {saving ? 'Rechazando...' : 'Rechazar'}
          </button>
          <button onClick={cerrarRevision} className="edl-btn-secondary">
           Cancelar
          </button>
         </div>
        </div>
       ) : (
        <div className="mt-4 border-t border-inst-borde pt-3 flex gap-2">
         <button
          onClick={() => {
           setRevisionId(s.id)
           setNuevoEvaluadorId(null)
           setDecisionComentario('')
           setBusquedaEvaluadores('')
           setEvaluadores([])
          }}
          className="edl-btn-primary flex items-center gap-2"
         >
          <span className="material-icons text-lg">visibility</span>
          Revisar Solicitud
         </button>
        </div>
       )}
      </div>
     ))}
    </div>
   )}
  </div>
 )
}
