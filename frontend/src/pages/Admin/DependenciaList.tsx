import { useState, useEffect, useCallback } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Dependencia {
 id: number
 entidad_id: number
 codigo: string
 nombre: string
 jefe_id: number | null
 jefe_nombre: string | null
 estado: string
}

interface UsuarioOption {
 id: number
 nombres: string
 apellidos: string
 documento: string
}

export default function DependenciaList() {
 const { rolActivo } = useAuth()
 const [deps, setDeps] = useState<Dependencia[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [busqueda, setBusqueda] = useState('')
 const [filtroEstado, setFiltroEstado] = useState('')
 const [cargando, setCargando] = useState(true)
 const [modalAbierto, setModalAbierto] = useState(false)
 const [editando, setEditando] = useState<Dependencia | null>(null)
 const [guardando, setGuardando] = useState(false)
 const [usuarios, setUsuarios] = useState<UsuarioOption[]>([])

 const [form, setForm] = useState({
  codigo: '', nombre: '', jefe_id: 0, estado: 'activa',
 })

 const cargar = useCallback(async () => {
  setCargando(true)
  try {
   let url = `/dependencias?pagina=${pagina}&por_pagina=20`
   if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
   if (filtroEstado) url += `&estado=${filtroEstado}`
   const res = await api.get<PaginatedData<Dependencia>>(url)
   setDeps(res.data || [])
   setTotal(res.total || 0)
  } catch (e: any) { console.error(e) }
  setCargando(false)
 }, [pagina, busqueda, filtroEstado])

 const cargarUsuarios = useCallback(async () => {
  try {
   const res = await api.get<PaginatedData<UsuarioOption>>('/usuarios?por_pagina=100&estado=activo')
   setUsuarios(res.data || [])
  } catch {}
 }, [])

 useEffect(() => { cargar(); }, [cargar])
 useEffect(() => { if (modalAbierto) cargarUsuarios(); }, [modalAbierto, cargarUsuarios])

 const abrirCrear = () => {
  setEditando(null)
  setForm({ codigo: '', nombre: '', jefe_id: 0, estado: 'activa' })
  setModalAbierto(true)
 }

 const abrirEditar = (d: Dependencia) => {
  setEditando(d)
  setForm({
   codigo: d.codigo, nombre: d.nombre,
   jefe_id: d.jefe_id || 0, estado: d.estado,
  })
  setModalAbierto(true)
 }

 const guardar = async () => {
  setGuardando(true)
  try {
   const payload = { ...form }
   if (!payload.jefe_id) delete (payload as any).jefe_id
   if (editando) {
    await api.put(`/dependencias/${editando.id}`, payload)
   } else {
    await api.post('/dependencias', payload)
   }
   setModalAbierto(false)
   cargar()
  } catch (e: any) { alert(e.message || 'Error al guardar') }
  setGuardando(false)
 }

 const toggleEstado = async (d: Dependencia) => {
  const nuevo = d.estado === 'activa' ? 'inactiva' : 'activa'
  try {
   await api.put(`/dependencias/${d.id}`, { estado: nuevo })
   cargar()
  } catch (e: any) { alert(e.message) }
 }

 const totalPages = Math.ceil(total / 20)

 return (
  <div className="min-h-screen">
   <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul text-xl">account_tree</span>
     <h2 className="edl-section-title">Dependencias</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">Administracion de dependencias de la entidad</p>
   </div>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
       className="edl-input" placeholder="Buscar por nombre o codigo..." />
     </div>
     <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}
      className="edl-input w-auto">
      <option value="">Todos</option>
      <option value="activa">Activas</option>
      <option value="inactiva">Inactivas</option>
     </select>
     <button onClick={abrirCrear} className="edl-btn-primary">
      <span className="material-icons text-base mr-1">add</span> Nueva dependencia
     </button>
    </div>
   </div>

   {cargando ? (
    <div className="edl-card text-center py-12 text-inst-texto-claro">
     <span className="material-icons text-4xl animate-spin text-inst-azul block mx-auto">refresh</span>
    </div>
   ) : (
    <div className="edl-card overflow-x-auto">
     <table className="edl-table">
      <thead>
       <tr>
        <th>Codigo</th>
        <th>Nombre</th>
        <th>Jefe</th>
        <th>Estado</th>
        <th className="text-center">Acciones</th>
       </tr>
      </thead>
      <tbody>
       {deps.map(d => (
        <tr key={d.id}>
         <td className="font-mono text-xs">{d.codigo}</td>
         <td className="font-medium">{d.nombre}</td>
         <td className="text-sm text-inst-texto-claro">{d.jefe_nombre || 'Sin asignar'}</td>
         <td>
          <button onClick={() => toggleEstado(d)}
           className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            d.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
           }`}>
           {d.estado === 'activa' ? 'Activa' : 'Inactiva'}
          </button>
         </td>
         <td className="text-center">
          <button onClick={() => abrirEditar(d)} className="p-1 rounded hover:bg-inst-gris text-inst-azul">
           <span className="material-icons text-lg">edit</span>
          </button>
         </td>
        </tr>
       ))}
       {deps.length === 0 && (
        <tr><td colSpan={5} className="text-center py-10 text-inst-texto-claro">No se encontraron dependencias</td></tr>
       )}
      </tbody>
     </table>
     {totalPages > 1 && (
      <div className="flex items-center justify-center gap-2 p-3 border-t border-inst-borde">
       {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
        <button key={p} onClick={() => setPagina(p)}
         className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-white border hover:bg-inst-gris'}`}>{p}</button>
       ))}
      </div>
     )}
    </div>
   )}

   {modalAbierto && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAbierto(false)}>
     <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="px-6 py-4 border-b border-inst-borde flex items-center justify-between">
       <h3 className="font-heading font-bold text-inst-texto">{editando ? 'Editar Dependencia' : 'Nueva Dependencia'}</h3>
       <button onClick={() => setModalAbierto(false)} className="text-inst-texto-claro hover:text-inst-texto">
        <span className="material-icons">close</span>
       </button>
      </div>
      <div className="px-6 py-4 space-y-3">
       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="edl-label">Codigo</label>
         <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})}
          className="edl-input" placeholder="Ej: DEP-01" />
        </div>
        <div>
         <label className="edl-label">Estado</label>
         <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="edl-input">
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
         </select>
        </div>
       </div>
       <div>
        <label className="edl-label">Nombre</label>
        <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
         className="edl-input" placeholder="Nombre de la dependencia" />
       </div>
       <div>
        <label className="edl-label">Jefe de la dependencia</label>
        <select value={form.jefe_id} onChange={e => setForm({...form, jefe_id: Number(e.target.value)})} className="edl-input">
         <option value={0}>Sin asignar</option>
         {usuarios.map(u => (
          <option key={u.id} value={u.id}>{u.nombres} {u.apellidos} - {u.documento}</option>
         ))}
        </select>
       </div>
      </div>
      <div className="px-6 py-4 border-t border-inst-borde flex justify-end gap-2">
       <button onClick={() => setModalAbierto(false)} className="edl-btn-outline">Cancelar</button>
       <button onClick={guardar} disabled={guardando} className="edl-btn-primary disabled:opacity-50">
        {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
