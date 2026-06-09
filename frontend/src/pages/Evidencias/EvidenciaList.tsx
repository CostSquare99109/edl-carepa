import { useState, useEffect, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Compromiso {
 id: number
 tipo: string
 descripcion: string
 compromiso_competencia?: string
}

interface Evidencia {
 id: number
 concertacion_id: number
 compromiso_id: number | null
 compromiso_competencia: string
 descripcion: string
 ubicacion: string | null
 observacion: string | null
 tipo: string
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
 evaluador_nombre: string
 evaluacion_id?: number
}

export default function EvidenciaList() {
 const { rolActivo } = useAuth()
 const [items, setItems] = useState<Evidencia[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)

 const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([])
 const [periodoId, setPeriodoId] = useState(0)
 const [documento, setDocumento] = useState('')
 const [evaluado, setEvaluado] = useState<Evaluado | null>(null)
 const [buscando, setBuscando] = useState(false)
 const [errorBusqueda, setErrorBusqueda] = useState('')

 const [compromisos, setCompromisos] = useState<Compromiso[]>([])

 const [mostrarForm, setMostrarForm] = useState(false)
 const [formCompromiso, setFormCompromiso] = useState('')
 const [formDescripcion, setFormDescripcion] = useState('')
 const [formUbicacion, setFormUbicacion] = useState('')
 const [formObservacion, setFormObservacion] = useState('')
 const [guardando, setGuardando] = useState(false)

 const [editando, setEditando] = useState<Evidencia | null>(null)

 const cargarPeriodos = useCallback(async () => {
  try {
   const res = await api.get<PaginatedData<{ id: number; nombre: string }>>('/periodos?por_pagina=50')
   setPeriodos(res.data || [])
  } catch {}
 }, [])

 useEffect(() => { cargarPeriodos(); cargar() }, [cargarPeriodos])

 async function cargar() {
  setLoading(true)
  try {
   const res = await api.get<PaginatedData<Evidencia>>(`/evidencias?pagina=${pagina}&por_pagina=20`)
   setItems(res.data || [])
   setTotal(res.total || 0)
  } catch {}
  setLoading(false)
 }

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

 async function guardarEvidencia() {
  if (!formCompromiso || !formDescripcion.trim()) {
   alert('Debe seleccionar un compromiso/competencia e ingresar una descripcion.')
   return
  }
  setGuardando(true)
  try {
   const compromisoSel = compromisos.find(c => c.descripcion === formCompromiso || c.compromiso_competencia === formCompromiso)
   await api.post('/evidencias', {
    concertacion_id: evaluado?.evaluacion_id || 0,
    compromiso_id: compromisoSel?.id || null,
    compromiso_competencia: formCompromiso,
    descripcion: formDescripcion.trim(),
    ubicacion: formUbicacion.trim() || null,
    observacion: formObservacion.trim() || null,
    tipo: compromisoSel?.tipo || 'general',
   })
   setMostrarForm(false)
   setFormCompromiso('')
   setFormDescripcion('')
   setFormUbicacion('')
   setFormObservacion('')
   cargar()
  } catch (e: any) {
   alert(e.message || 'Error al guardar evidencia')
  }
  setGuardando(false)
 }

 async function actualizarEvidencia() {
  if (!editando) return
  setGuardando(true)
  try {
   await api.put(`/evidencias/${editando.id}`, {
    descripcion: editando.descripcion,
    ubicacion: editando.ubicacion,
    observacion: editando.observacion,
    compromiso_competencia: editando.compromiso_competencia,
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
    <span className="material-icons text-inst-azul text-xl">folder_open</span>
    <h2 className="edl-section-title">Evidencias</h2>
   </div>
   <p className="text-sm text-inst-texto-claro mb-4 ml-7">
    Registro descriptivo de soportes de cumplimiento. No se cargan archivos.
   </p>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[180px]">
      <label className="edl-label">Periodo</label>
      <select value={periodoId} onChange={e => setPeriodoId(Number(e.target.value))} className="edl-input">
       <option value={0}>Seleccione un periodo</option>
       {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
     </div>
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
       <span className="material-icons text-sm mr-1">add</span>Crear evidencia
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
     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm ml-7">
      <div><span className="text-inst-texto-claro">Documento:</span> <span className="font-medium">{evaluado.documento}</span></div>
      <div><span className="text-inst-texto-claro">Cargo:</span> <span className="font-medium">{evaluado.cargo}</span></div>
      <div><span className="text-inst-texto-claro">Dependencia:</span> <span className="font-medium">{evaluado.dependencia}</span></div>
      <div><span className="text-inst-texto-claro">Evaluador:</span> <span className="font-medium">{evaluado.evaluador_nombre}</span></div>
     </div>
    </div>
   )}

   {mostrarForm && evaluado && (
    <div className="edl-card mb-6 border border-inst-azul/20">
     <div className="flex items-center justify-between mb-4">
      <h3 className="font-heading font-semibold text-inst-azul">Crear evidencia</h3>
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
       <label className="edl-label">Descripcion</label>
       <textarea value={formDescripcion} onChange={e => setFormDescripcion(e.target.value)}
        className="edl-input min-h-[80px]" placeholder="Detalle de la evidencia o soporte" />
      </div>
      <div>
       <label className="edl-label">Ubicacion</label>
       <input type="text" value={formUbicacion} onChange={e => setFormUbicacion(e.target.value)}
        className="edl-input" placeholder="Ubicacion fisica o link digital" />
      </div>
      <div>
       <label className="edl-label">Observacion (opcional)</label>
       <textarea value={formObservacion} onChange={e => setFormObservacion(e.target.value)}
        className="edl-input min-h-[60px]" placeholder="Observaciones adicionales" />
      </div>
      <div className="flex justify-end gap-3">
       <button onClick={() => setMostrarForm(false)} className="edl-btn-outline">Cancelar</button>
       <button onClick={guardarEvidencia} disabled={guardando} className="edl-btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar'}
       </button>
      </div>
     </div>
    </div>
   )}

   {loading ? (
    <p className="text-inst-texto-claro text-sm">Cargando...</p>
   ) : items.length === 0 ? (
    <p className="text-inst-texto-claro text-sm">No hay evidencias registradas</p>
   ) : (
    <div className="overflow-x-auto">
     <table className="edl-table">
      <thead>
       <tr>
        <th>Compromiso/Competencia</th>
        <th>Descripcion</th>
        <th>Ubicacion</th>
        <th>Observacion</th>
        <th>Registrado por</th>
        <th>Fecha</th>
        <th className="text-center w-16">Editar</th>
       </tr>
      </thead>
      <tbody>
       {items.map(ev => (
        <tr key={ev.id}>
         <td className="max-w-[200px] truncate">{ev.compromiso_competencia || '-'}</td>
         <td className="max-w-[250px] truncate">{ev.descripcion || '-'}</td>
         <td className="max-w-[150px] truncate">{ev.ubicacion || '-'}</td>
         <td className="max-w-[150px] truncate">{ev.observacion || '-'}</td>
         <td>{ev.registrado_nombre || '-'}</td>
         <td className="text-xs">{new Date(ev.creado_en).toLocaleDateString('es-CO')}</td>
         <td className="text-center">
          <button onClick={() => setEditando({ ...ev })}
           className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
           title="Editar evidencia">
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
       <h3 className="edl-section-title text-base">Editar Evidencia</h3>
       <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
        <span className="material-icons text-xl text-inst-texto-claro">close</span>
       </button>
      </div>
      <div className="p-4 space-y-3">
       <div>
        <label className="edl-label">Compromiso o competencia</label>
        <input value={editando.compromiso_competencia || ''}
         onChange={e => setEditando({ ...editando, compromiso_competencia: e.target.value })}
         className="edl-input" />
       </div>
       <div>
        <label className="edl-label">Descripcion</label>
        <textarea value={editando.descripcion || ''}
         onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
         className="edl-input min-h-[80px]" />
       </div>
       <div>
        <label className="edl-label">Ubicacion</label>
        <input value={editando.ubicacion || ''}
         onChange={e => setEditando({ ...editando, ubicacion: e.target.value })}
         className="edl-input" />
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
       <button onClick={actualizarEvidencia} disabled={guardando} className="edl-btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
