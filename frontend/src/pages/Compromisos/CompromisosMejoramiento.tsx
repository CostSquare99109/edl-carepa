import { useState, useEffect, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Mejoramiento {
 id: number
 concertacion_id: number
 compromiso_id: number | null
 compromiso_competencia: string
 motivo: string
 aspecto_corregir: string
 acciones_mejoramiento: string
 observacion: string | null
 plazo_cumplimiento: string | null
 estado: string
 registrado_por: number
 registrado_nombre?: string
 creado_en: string
}

interface Evaluado {
 id: number
 documento: string
 nombres: string
 apellidos: string
 cargo: string
 dependencia: string
 evaluacion_id: number | null
}

interface Compromiso {
 id: number
 tipo: string
 descripcion: string
 compromiso_competencia?: string
}

const MOTIVOS = [
 { value: 'nivel_no_satisfactorio', label: 'Nivel no satisfactorio' },
 { value: 'nivel_satisfactorio', label: 'Nivel satisfactorio' },
 { value: 'solicitud_evaluado', label: 'Solicitud del evaluado' },
]

export default function CompromisosMejoramiento() {
 const { rolActivo } = useAuth()
 const [items, setItems] = useState<Mejoramiento[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)

 const [documento, setDocumento] = useState('')
 const [evaluado, setEvaluado] = useState<Evaluado | null>(null)
 const [buscando, setBuscando] = useState(false)
 const [errorBusqueda, setErrorBusqueda] = useState('')

 const [compromisos, setCompromisos] = useState<Compromiso[]>([])

 const [mostrarForm, setMostrarForm] = useState(false)
 const [formCompromiso, setFormCompromiso] = useState('')
 const [formMotivo, setFormMotivo] = useState('')
 const [formAspecto, setFormAspecto] = useState('')
 const [formAcciones, setFormAcciones] = useState('')
 const [formObservacion, setFormObservacion] = useState('')
 const [guardando, setGuardando] = useState(false)

 const [editando, setEditando] = useState<Mejoramiento | null>(null)

 async function cargar() {
  setLoading(true)
  try {
   const res = await api.get<PaginatedData<Mejoramiento>>(`/compromisos-mejoramiento?pagina=${pagina}&por_pagina=20`)
   setItems(res.data || [])
   setTotal(res.total || 0)
  } catch {}
  setLoading(false)
 }

 useEffect(() => { cargar() }, [pagina])

 async function buscarEvaluado() {
  if (!documento.trim()) return
  setBuscando(true)
  setErrorBusqueda('')
  setEvaluado(null)
  setCompromisos([])
  try {
   const data: any = await api.get(`/compromisos/buscar-evaluado?documento=${documento.trim()}`)
   if (data.evaluado) {
    setEvaluado(data.evaluado)
    if (data.evaluado.evaluacion_id) {
     const compRes = await api.get<PaginatedData<Compromiso>>(
      `/compromisos/evaluacion/${data.evaluado.evaluacion_id}?por_pagina=50`
     )
     setCompromisos(compRes.data || [])
    }
   } else {
    setErrorBusqueda('No se encontro un evaluado con ese documento.')
   }
  } catch (e: any) {
   setErrorBusqueda(e.message || 'Error en la busqueda')
  }
  setBuscando(false)
 }

 async function guardar() {
  if (!formMotivo || !formAspecto.trim() || !formAcciones.trim()) {
   alert('Motivo, aspecto a corregir y acciones de mejoramiento son obligatorios.')
   return
  }
  if (!evaluado?.evaluacion_id) {
   alert('Debe buscar un evaluado con evaluacion activa.')
   return
  }
  setGuardando(true)
  try {
   const compromisoSel = compromisos.find(c => c.descripcion === formCompromiso || c.compromiso_competencia === formCompromiso)
   await api.post(`/concertaciones/${evaluado.evaluacion_id}/compromisos-mejoramiento`, {
    compromiso_id: compromisoSel?.id || null,
    compromiso_competencia: formCompromiso,
    motivo: formMotivo,
    aspecto_corregir: formAspecto.trim(),
    acciones_mejoramiento: formAcciones.trim(),
    observacion: formObservacion.trim() || null,
   })
   setMostrarForm(false)
   setFormCompromiso('')
   setFormMotivo('')
   setFormAspecto('')
   setFormAcciones('')
   setFormObservacion('')
   cargar()
  } catch (e: any) {
   alert(e.message || 'Error al guardar')
  }
  setGuardando(false)
 }

 async function actualizar() {
  if (!editando) return
  setGuardando(true)
  try {
   await api.put(`/compromisos-mejoramiento/${editando.id}`, {
    aspecto_corregir: editando.aspecto_corregir,
    acciones_mejoramiento: editando.acciones_mejoramiento,
    observacion: editando.observacion,
   })
   setEditando(null)
   cargar()
  } catch (e: any) {
   alert(e.message || 'Error al actualizar')
  }
  setGuardando(false)
 }

 const totalPages = Math.ceil(total / 20)

 return (
  <div>
   <div className="flex items-center gap-2 mb-1">
    <span className="material-icons text-inst-azul text-xl">trending_up</span>
    <h2 className="edl-section-title">Compromisos de Mejoramiento</h2>
   </div>
   <p className="text-sm text-inst-texto-claro mb-4 ml-7">
    Registro de compromisos de mejoramiento segun resultado de evaluacion.
   </p>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <label className="edl-label">Documento del evaluado</label>
      <div className="flex gap-2">
       <input type="text" value={documento} onChange={e => setDocumento(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
        className="edl-input flex-1" placeholder="Numero de documento" />
       <button onClick={buscarEvaluado} disabled={buscando || !documento.trim()}
        className="edl-btn-primary whitespace-nowrap disabled:opacity-50">
        {buscando ? 'Buscando...' : 'Buscar evaluado'}
       </button>
      </div>
      {errorBusqueda && <p className="text-xs text-inst-rojo mt-1">{errorBusqueda}</p>}
     </div>
     {evaluado && !mostrarForm && (
      <button onClick={() => setMostrarForm(true)} className="edl-btn-primary">
       <span className="material-icons text-sm mr-1">add</span>Crear compromiso
      </button>
     )}
    </div>
   </div>

   {evaluado && (
    <div className="edl-card mb-6 border-l-4 border-l-inst-azul">
     <div className="flex items-center gap-2 mb-2">
      <span className="material-icons text-inst-azul text-lg">account_circle</span>
      <span className="font-heading font-bold text-inst-texto">{evaluado.nombres} {evaluado.apellidos}</span>
     </div>
     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm ml-7">
      <div><span className="text-inst-texto-claro">Documento:</span> <span className="font-medium">{evaluado.documento}</span></div>
      <div><span className="text-inst-texto-claro">Cargo:</span> <span className="font-medium">{evaluado.cargo}</span></div>
      <div><span className="text-inst-texto-claro">Dependencia:</span> <span className="font-medium">{evaluado.dependencia}</span></div>
     </div>
    </div>
   )}

   {mostrarForm && evaluado && (
    <div className="edl-card mb-6 border border-inst-azul/20">
     <div className="flex items-center justify-between mb-4">
      <h3 className="font-heading font-semibold text-inst-azul">Crear compromiso de mejoramiento</h3>
      <button onClick={() => setMostrarForm(false)} className="text-inst-texto-claro hover:text-inst-rojo">
       <span className="material-icons">close</span>
      </button>
     </div>
     <div className="space-y-3">
      <div>
       <label className="edl-label">Compromiso o competencia</label>
       <select value={formCompromiso} onChange={e => setFormCompromiso(e.target.value)} className="edl-input">
        <option value="">Seleccione...</option>
        {compromisos.map(c => (
         <option key={c.id} value={c.compromiso_competencia || c.descripcion}>
          {c.compromiso_competencia || c.descripcion}
         </option>
        ))}
       </select>
      </div>
      <div>
       <label className="edl-label">Motivo</label>
       <select value={formMotivo} onChange={e => setFormMotivo(e.target.value)} className="edl-input">
        <option value="">Seleccione un motivo</option>
        {MOTIVOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
       </select>
      </div>
      <div>
       <label className="edl-label">Aspecto a corregir</label>
       <textarea value={formAspecto} onChange={e => setFormAspecto(e.target.value)}
        className="edl-input min-h-[80px]" placeholder="Describa el aspecto que requiere mejora" />
      </div>
      <div>
       <label className="edl-label">Acciones de mejoramiento</label>
       <textarea value={formAcciones} onChange={e => setFormAcciones(e.target.value)}
        className="edl-input min-h-[80px]" placeholder="Describa las acciones de mejoramiento propuestas" />
      </div>
      <div>
       <label className="edl-label">Observacion (opcional)</label>
       <textarea value={formObservacion} onChange={e => setFormObservacion(e.target.value)}
        className="edl-input min-h-[60px]" placeholder="Observaciones adicionales" />
      </div>
      <div className="flex justify-end gap-3">
       <button onClick={() => setMostrarForm(false)} className="edl-btn-outline">Cancelar</button>
       <button onClick={guardar} disabled={guardando} className="edl-btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar'}
       </button>
      </div>
     </div>
    </div>
   )}

   {loading ? (
    <p className="text-inst-texto-claro text-sm">Cargando...</p>
   ) : items.length === 0 ? (
    <p className="text-inst-texto-claro text-sm">No hay compromisos de mejoramiento registrados</p>
   ) : (
    <div className="overflow-x-auto">
     <table className="edl-table">
      <thead>
       <tr>
        <th>Compromiso</th>
        <th>Motivo</th>
        <th>Aspecto a corregir</th>
        <th>Acciones</th>
        <th>Estado</th>
        <th>Fecha</th>
        <th className="text-center w-16">Editar</th>
       </tr>
      </thead>
      <tbody>
       {items.map(cm => (
        <tr key={cm.id}>
         <td className="max-w-[180px] truncate">{cm.compromiso_competencia || '-'}</td>
         <td className="text-xs">{MOTIVOS.find(m => m.value === cm.motivo)?.label || cm.motivo}</td>
         <td className="max-w-[200px] truncate">{cm.aspecto_corregir}</td>
         <td className="max-w-[200px] truncate">{cm.acciones_mejoramiento}</td>
         <td>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
           cm.estado === 'completado' ? 'bg-green-100 text-green-700' :
           cm.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
           'bg-amber-100 text-amber-700'
          }`}>{cm.estado}</span>
         </td>
         <td className="text-xs">{new Date(cm.creado_en).toLocaleDateString('es-CO')}</td>
         <td className="text-center">
          <button onClick={() => setEditando({ ...cm })}
           className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
           title="Editar">
           <span className="material-icons text-lg">edit</span>
          </button>
         </td>
        </tr>
       ))}
      </tbody>
     </table>

     {totalPages > 1 && (
      <div className="flex items-center justify-center gap-2 p-3">
       {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
        <button key={p} onClick={() => setPagina(p)}
         className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
       ))}
      </div>
     )}
    </div>
   )}

   {editando && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
     <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-inst-borde">
       <h3 className="edl-section-title text-base">Editar Compromiso de Mejoramiento</h3>
       <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
        <span className="material-icons text-xl text-inst-texto-claro">close</span>
       </button>
      </div>
      <div className="p-4 space-y-3">
       <div>
        <label className="edl-label">Aspecto a corregir</label>
        <textarea value={editando.aspecto_corregir}
         onChange={e => setEditando({ ...editando, aspecto_corregir: e.target.value })}
         className="edl-input min-h-[80px]" />
       </div>
       <div>
        <label className="edl-label">Acciones de mejoramiento</label>
        <textarea value={editando.acciones_mejoramiento}
         onChange={e => setEditando({ ...editando, acciones_mejoramiento: e.target.value })}
         className="edl-input min-h-[80px]" />
       </div>
       <div>
        <label className="edl-label">Observacion</label>
        <textarea value={editando.observacion || ''}
         onChange={e => setEditando({ ...editando, observacion: e.target.value })}
         className="edl-input min-h-[60px]" />
       </div>
      </div>
      <div className="flex justify-end gap-3 p-4 border-t border-inst-borde">
       <button onClick={() => setEditando(null)} className="edl-btn-outline">Cancelar</button>
       <button onClick={actualizar} disabled={guardando} className="edl-btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
