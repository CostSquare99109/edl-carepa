import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Ausentismo {
 id: number
 funcionario_id: number
 funcionario_nombre: string
 funcionario_documento: string
 tipo: string
 fecha_inicio: string
 fecha_fin: string
 dias_habiles: number
 observaciones: string | null
 afecta_evaluacion: number
 estado: string
 creado_en: string
}

const TIPOS_AUSENTISMO = [
 { value: 'incapacidad', label: 'Incapacidad' },
 { value: 'comision', label: 'Comision' },
 { value: 'encargo', label: 'Encargo' },
 { value: 'suspension', label: 'Suspension' },
 { value: 'licencia', label: 'Licencia' },
 { value: 'vacacion', label: 'Vacaciones' },
 { value: 'permiso', label: 'Permiso' },
 { value: 'otro', label: 'Otros' },
]

export default function AusentismoList() {
 const { rolActivo } = useAuth()
 const [items, setItems] = useState<Ausentismo[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [loading, setLoading] = useState(true)

 const [busquedaDoc, setBusquedaDoc] = useState('')
 const [buscando, setBuscando] = useState(false)

 const [mostrarForm, setMostrarForm] = useState(false)
 const [formFuncionarioId, setFormFuncionarioId] = useState(0)
 const [formFuncionarioDoc, setFormFuncionarioDoc] = useState('')
 const [formFuncionarioNombre, setFormFuncionarioNombre] = useState('')
 const [formTipo, setFormTipo] = useState('')
 const [formFechaInicio, setFormFechaInicio] = useState('')
 const [formFechaFin, setFormFechaFin] = useState('')
 const [formObservaciones, setFormObservaciones] = useState('')
 const [guardando, setGuardando] = useState(false)

 const [editando, setEditando] = useState<Ausentismo | null>(null)

 async function cargar() {
  setLoading(true)
  try {
   const res = await api.get<PaginatedData<Ausentismo>>(`/ausentismos?pagina=${pagina}&por_pagina=20`)
   setItems(res.data || [])
   setTotal(res.total || 0)
  } catch {}
  setLoading(false)
 }

 useEffect(() => { cargar() }, [pagina])

 async function buscarFuncionario() {
  if (!busquedaDoc.trim()) return
  setBuscando(true)
  try {
   const res = await api.get<PaginatedData<any>>(`/usuarios?documento=${busquedaDoc.trim()}&por_pagina=5`)
   const usuarios = res.data || []
   if (usuarios.length > 0) {
    const u = usuarios[0]
    setFormFuncionarioId(u.id)
    setFormFuncionarioDoc(u.documento)
    setFormFuncionarioNombre(`${u.nombres} ${u.apellidos}`)
    setMostrarForm(true)
   } else {
    alert('No se encontro un funcionario con ese documento.')
   }
  } catch (e: any) {
   alert(e.message || 'Error en la busqueda')
  }
  setBuscando(false)
 }

 async function guardar() {
  if (!formFuncionarioId || !formTipo || !formFechaInicio || !formFechaFin) {
   alert('Todos los campos son obligatorios excepto observaciones.')
   return
  }
  const inicio = new Date(formFechaInicio)
  const fin = new Date(formFechaFin)
  if (fin <= inicio) {
   alert('La fecha fin debe ser posterior a la fecha inicio.')
   return
  }
  const diffTime = Math.abs(fin.getTime() - inicio.getTime())
  const diasHabiles = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  setGuardando(true)
  try {
   await api.post('/ausentismos', {
    funcionario_id: formFuncionarioId,
    tipo: formTipo,
    fecha_inicio: formFechaInicio,
    fecha_fin: formFechaFin,
    dias_habiles: diasHabiles,
    observaciones: formObservaciones.trim() || null,
   })
   setMostrarForm(false)
   setFormFuncionarioId(0)
   setFormFuncionarioDoc('')
   setFormFuncionarioNombre('')
   setFormTipo('')
   setFormFechaInicio('')
   setFormFechaFin('')
   setFormObservaciones('')
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
   await api.put(`/ausentismos/${editando.id}`, {
    tipo: editando.tipo,
    fecha_inicio: editando.fecha_inicio,
    fecha_fin: editando.fecha_fin,
    observaciones: editando.observaciones,
   })
   setEditando(null)
   cargar()
  } catch (e: any) {
   alert(e.message || 'Error al actualizar')
  }
  setGuardando(false)
 }

 async function eliminar(id: number) {
  if (!confirm('Esta seguro de eliminar este ausentismo?')) return
  try {
   await api.delete(`/ausentismos/${id}`)
   cargar()
  } catch (e: any) {
   alert(e.message || 'Error al eliminar')
  }
 }

 const totalPages = Math.ceil(total / 20)
 const puedeCrear = ['admin', 'jefe_personal'].includes(rolActivo || '')

 return (
  <div>
   <div className="flex items-center gap-2 mb-1">
    <span className="material-icons text-inst-azul text-xl">event_busy</span>
    <h2 className="edl-section-title">Ausentismos</h2>
   </div>
   <p className="text-sm text-inst-texto-claro mb-4 ml-7">
    Periodos no evaluables superiores a 30 dias (Decreto 815 Art. 36).
   </p>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <label className="edl-label">Buscar funcionario por documento</label>
      <div className="flex gap-2">
       <input type="text" value={busquedaDoc} onChange={e => setBusquedaDoc(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscarFuncionario()}
        className="edl-input flex-1" placeholder="Numero de documento" />
       <button onClick={buscarFuncionario} disabled={buscando || !busquedaDoc.trim()}
        className="edl-btn-primary whitespace-nowrap disabled:opacity-50">
        {buscando ? 'Buscando...' : 'Buscar'}
       </button>
      </div>
     </div>
    </div>
   </div>

   {mostrarForm && formFuncionarioId > 0 && (
    <div className="edl-card mb-6 border border-inst-azul/20">
     <div className="flex items-center justify-between mb-4">
      <h3 className="font-heading font-semibold text-inst-azul">Registrar ausentismo</h3>
      <button onClick={() => setMostrarForm(false)} className="text-inst-texto-claro hover:text-inst-rojo">
       <span className="material-icons">close</span>
      </button>
     </div>
     <div className="edl-card border-l-4 border-l-inst-azul mb-4">
      <div className="flex items-center gap-2">
       <span className="material-icons text-inst-azul">account_circle</span>
       <span className="font-heading font-bold text-inst-texto">{formFuncionarioNombre}</span>
       <span className="text-sm text-inst-texto-claro">- {formFuncionarioDoc}</span>
      </div>
     </div>
     <div className="space-y-3">
      <div>
       <label className="edl-label">Motivo</label>
       <select value={formTipo} onChange={e => setFormTipo(e.target.value)} className="edl-input">
        <option value="">Seleccione un motivo</option>
        {TIPOS_AUSENTISMO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
       </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
       <div>
        <label className="edl-label">Fecha inicio</label>
        <input type="date" value={formFechaInicio} onChange={e => setFormFechaInicio(e.target.value)} className="edl-input" />
       </div>
       <div>
        <label className="edl-label">Fecha fin</label>
        <input type="date" value={formFechaFin} onChange={e => setFormFechaFin(e.target.value)} className="edl-input" />
       </div>
      </div>
      <div>
       <label className="edl-label">Observaciones (opcional)</label>
       <textarea value={formObservaciones} onChange={e => setFormObservaciones(e.target.value)}
        className="edl-input min-h-[60px]" placeholder="Observaciones sobre el ausentismo" />
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
    <p className="text-inst-texto-claro text-sm">No hay ausentismos registrados</p>
   ) : (
    <div className="overflow-x-auto">
     <table className="edl-table">
      <thead>
       <tr>
        <th>Funcionario</th>
        <th>Documento</th>
        <th>Motivo</th>
        <th>Fecha inicio</th>
        <th>Fecha fin</th>
        <th>Dias habiles</th>
        <th>Afecta evaluacion</th>
        <th>Observaciones</th>
        <th className="text-center w-24">Acciones</th>
       </tr>
      </thead>
      <tbody>
       {items.map(a => (
        <tr key={a.id}>
         <td className="font-medium">{a.funcionario_nombre || '-'}</td>
         <td className="text-sm">{a.funcionario_documento || '-'}</td>
         <td className="text-xs">{TIPOS_AUSENTISMO.find(t => t.value === a.tipo)?.label || a.tipo}</td>
         <td className="text-sm">{a.fecha_inicio?.substring(0, 10)}</td>
         <td className="text-sm">{a.fecha_fin?.substring(0, 10)}</td>
         <td className="text-center">{a.dias_habiles}</td>
         <td className="text-center">
          {a.afecta_evaluacion ? (
           <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Si</span>
          ) : (
           <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">No</span>
          )}
         </td>
         <td className="max-w-[150px] truncate text-sm">{a.observaciones || '-'}</td>
         <td className="text-center">
          <div className="flex items-center justify-center gap-1">
           <button onClick={() => setEditando({ ...a })} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Editar">
            <span className="material-icons text-lg">edit</span>
           </button>
           {puedeCrear && (
            <button onClick={() => eliminar(a.id)} className="p-1 rounded hover:bg-inst-gris text-inst-rojo" title="Eliminar">
             <span className="material-icons text-lg">delete</span>
            </button>
           )}
          </div>
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
       <h3 className="edl-section-title text-base">Editar Ausentismo</h3>
       <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
        <span className="material-icons text-xl text-inst-texto-claro">close</span>
       </button>
      </div>
      <div className="p-4 space-y-3">
       <div>
        <label className="edl-label">Motivo</label>
        <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input">
         {TIPOS_AUSENTISMO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
         <label className="edl-label">Fecha inicio</label>
         <input type="date" value={editando.fecha_inicio?.substring(0, 10)}
          onChange={e => setEditando({ ...editando, fecha_inicio: e.target.value })} className="edl-input" />
        </div>
        <div>
         <label className="edl-label">Fecha fin</label>
         <input type="date" value={editando.fecha_fin?.substring(0, 10)}
          onChange={e => setEditando({ ...editando, fecha_fin: e.target.value })} className="edl-input" />
        </div>
       </div>
       <div>
        <label className="edl-label">Observaciones</label>
        <textarea value={editando.observaciones || ''}
         onChange={e => setEditando({ ...editando, observaciones: e.target.value })}
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
