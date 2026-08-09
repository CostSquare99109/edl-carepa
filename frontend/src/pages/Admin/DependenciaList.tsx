import { useState, useEffect, useCallback, useRef } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui'

interface Dependencia {
 id: number
 entidad_id: number
 codigo: string
 nombre: string
 jefe_id: number | null
 jefe_nombre: string | null
 estado: string
}

interface UsuarioResult {
 id: number
 documento: string
 primer_nombre: string
 segundo_nombre: string | null
 primer_apellido: string
 segundo_apellido: string | null
 email: string
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
 const [busquedaJefe, setBusquedaJefe] = useState('')
 const [todosUsuarios, setTodosUsuarios] = useState<UsuarioResult[]>([])
 const [jefeSeleccionado, setJefeSeleccionado] = useState<UsuarioResult | null>(null)
 const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
 const [mostrarResultados, setMostrarResultados] = useState(false)
 const searchRef = useRef<HTMLDivElement>(null)

 const [form, setForm] = useState({
  codigo: '', nombre: '', jefe_id: 0, estado: 'activa',
 })

 async function cargarUsuarios() {
  setCargandoUsuarios(true)
  try {
   const res = await api.get<PaginatedData<UsuarioResult>>('/usuarios?por_pagina=99999&estado=activo')
   setTodosUsuarios(res.data || [])
  } catch (e) {
   console.error('Error al cargar usuarios:', e)
  }
  setCargandoUsuarios(false)
 }

 useEffect(() => {
  cargarUsuarios()
 }, [])

 const resultadosJefe = busquedaJefe.trim()
  ? todosUsuarios.filter(u => {
     const q = busquedaJefe.trim().toLowerCase()
     const palabras = q.split(/\s+/).filter(Boolean)
     const texto = [
      u.primer_nombre, u.segundo_nombre,
      u.primer_apellido, u.segundo_apellido,
      u.documento,
     ].filter(Boolean).join(' ').toLowerCase()
     return palabras.every(p => texto.includes(p))
    })
  : todosUsuarios

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

 useEffect(() => { cargar(); }, [cargar])

 useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
   if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
    setMostrarResultados(false)
   }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [])

 useEffect(() => {
  if (!modalAbierto) {
   setJefeSeleccionado(null)
   setBusquedaJefe('')
  }
 }, [modalAbierto])

 function seleccionarJefe(u: UsuarioResult) {
  setJefeSeleccionado(u)
  setBusquedaJefe(`${u.primer_nombre} ${u.primer_apellido} - ${u.documento}`)
  setMostrarResultados(false)
 }

 function limpiarJefe() {
  setJefeSeleccionado(null)
  setBusquedaJefe('')
 }

 const abrirCrear = () => {
  setEditando(null)
  setForm({ codigo: '', nombre: '', jefe_id: 0, estado: 'activa' })
  setJefeSeleccionado(null)
  setBusquedaJefe('')
  setMostrarResultados(false)
  setModalAbierto(true)
 }

 const abrirEditar = (d: Dependencia) => {
  setEditando(d)
  setForm({
   codigo: d.codigo, nombre: d.nombre,
   jefe_id: d.jefe_id || 0, estado: d.estado,
  })
  setJefeSeleccionado(null)
  setBusquedaJefe('')
  setMostrarResultados(false)
  setModalAbierto(true)
 }

 const guardar = async () => {
  setGuardando(true)
  try {
   const jefeId = jefeSeleccionado ? jefeSeleccionado.id : (editando ? editando.jefe_id : null)
   const payload: any = {
    codigo: form.codigo,
    nombre: form.nombre,
    estado: form.estado,
   }
   if (jefeId) payload.jefe_id = jefeId
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

  const eliminar = async (d: Dependencia) => {
   if (!confirm(`¿Eliminar permanentemente la dependencia "${d.nombre}"?\n\nEsta acción no se puede deshacer. Se eliminarán también las metas asociadas.`)) return;
   try {
    await api.delete(`/dependencias/${d.id}`);
    cargar();
   } catch (e: any) { alert(e.message || 'Error al eliminar') }
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
          <div className="flex items-center justify-center gap-1">
           <button onClick={() => abrirEditar(d)} className="p-1 rounded hover:bg-inst-gris text-inst-azul" title="Editar">
            <span className="material-icons text-lg">edit</span>
           </button>
           <button onClick={() => eliminar(d)} className="p-1 rounded hover:bg-red-50 text-red-600" title="Eliminar">
            <span className="material-icons text-lg">delete</span>
           </button>
          </div>
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
         className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-inst-surface border hover:bg-inst-gris'}`}>{p}</button>
       ))}
      </div>
     )}
    </div>
   )}

   {modalAbierto && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAbierto(false)}>
     <div className="bg-inst-surface rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
         <div ref={searchRef}>
          <label className="edl-label">Jefe de la dependencia</label>
          <div className="relative">
           <Input
            value={busquedaJefe}
            onChange={e => {
             setBusquedaJefe(e.target.value)
             setJefeSeleccionado(null)
             setMostrarResultados(true)
            }}
            onFocus={() => {
             setBusquedaJefe('')
             setMostrarResultados(true)
            }}
            placeholder="Buscar por nombre o documento..."
            iconLeft={<span className="material-icons text-base">search</span>}
            iconRight={jefeSeleccionado ? (
             <button type="button" onClick={limpiarJefe} className="text-inst-texto-claro hover:text-inst-rojo">
              <span className="material-icons text-base">close</span>
             </button>
            ) : undefined}
           />
           {cargandoUsuarios && todosUsuarios.length === 0 && (
            <div className="absolute z-50 mt-1 w-full bg-inst-surface border border-inst-borde rounded-lg shadow-lg p-4 text-center text-sm text-inst-texto-claro">
             Cargando usuarios...
            </div>
           )}
           {mostrarResultados && !cargandoUsuarios && (
            <>
             {resultadosJefe.length > 0 ? (
              <div className="absolute z-50 mt-1 w-full bg-inst-surface border border-inst-borde rounded-lg shadow-lg max-h-60 overflow-y-auto">
               {resultadosJefe.map(u => (
                <button
                 key={u.id}
                 type="button"
                 onClick={() => seleccionarJefe(u)}
                 className="w-full text-left px-4 py-3 hover:bg-inst-azul/5 border-b border-inst-borde/50 last:border-b-0 transition-colors"
                >
                 <p className="text-sm font-medium text-inst-texto">{u.primer_nombre} {u.segundo_nombre} {u.primer_apellido} {u.segundo_apellido}</p>
                 <p className="text-xs text-inst-texto-claro flex items-center gap-3 mt-0.5">
                  <span>{u.documento}</span>
                  <span>{u.email}</span>
                 </p>
                </button>
               ))}
              </div>
             ) : (
              <div className="absolute z-50 mt-1 w-full bg-inst-surface border border-inst-borde rounded-lg shadow-lg p-4 text-center text-sm text-inst-texto-claro">
               No se encontraron usuarios con ese criterio
              </div>
             )}
            </>
           )}
          </div>
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
