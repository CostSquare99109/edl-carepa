import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'

interface Parametro {
 id: number
 clave: string
 valor: string
 tipo: string
 descripcion: string | null
}

export default function AdminConfiguracion() {
 const [params, setParams] = useState<Parametro[]>([])
 const [cargando, setCargando] = useState(true)
 const [error, setError] = useState('')
 const [editando, setEditando] = useState<Record<string, string>>({})
 const [guardando, setGuardando] = useState(false)
 const [nuevo, setNuevo] = useState({ clave: '', valor: '', tipo: 'texto', descripcion: '' })
 const [mostrarNuevo, setMostrarNuevo] = useState(false)

 const cargar = useCallback(async () => {
  setCargando(true); setError('')
  try {
   const res = await api.get<Parametro[]>('/parametros')
   setParams(res)
   const ed: Record<string, string> = {}
   res.forEach(p => { ed[p.clave] = p.valor })
   setEditando(ed)
  } catch (e: any) { setError(e.message) }
  setCargando(false)
 }, [])

 useEffect(() => { cargar() }, [cargar])

 const guardarParametro = async (clave: string) => {
  setGuardando(true)
  try {
   const p = params.find(x => x.clave === clave)
   await api.post('/parametros', { clave, valor: editando[clave], tipo: p?.tipo || 'texto', descripcion: p?.descripcion || null })
   cargar()
  } catch (e: any) { alert(e.message) }
  setGuardando(false)
 }

 const guardarTodos = async () => {
  setGuardando(true)
  try {
   const parametros = Object.entries(editando).map(([clave, valor]) => {
    const p = params.find(x => x.clave === clave)
    return { clave, valor, tipo: p?.tipo || 'texto', descripcion: p?.descripcion || null }
   })
   await api.put('/parametros/masivo', { parametros })
   cargar()
  } catch (e: any) { alert(e.message) }
  setGuardando(false)
 }

 const crearParametro = async () => {
  if (!nuevo.clave || !nuevo.valor) { alert('Clave y valor son requeridos'); return }
  setGuardando(true)
  try {
   await api.post('/parametros', nuevo)
   setNuevo({ clave: '', valor: '', tipo: 'texto', descripcion: '' })
   setMostrarNuevo(false)
   cargar()
  } catch (e: any) { alert(e.message) }
  setGuardando(false)
 }

 const eliminarParametro = async (id: number) => {
  if (!confirm('Eliminar este parametro?')) return
  try { await api.delete(`/parametros/${id}`); cargar() }
  catch (e: any) { alert(e.message) }
 }

 const edlParams = params.filter(p => ['peso', 'umbral', 'compromisos', 'dias_habiles'].some(k => p.clave.includes(k)))
 const systemParams = params.filter(p => !edlParams.includes(p))

 return (
  <div className="space-y-6">
   <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-inst-azul">
     <span className="material-icons text-lg align-middle mr-1">settings</span>
     Configuracion del Sistema
    </h2>
    <div className="flex gap-2">
     <button onClick={() => setMostrarNuevo(true)} className="edl-btn-primary text-sm">
      <span className="material-icons text-base align-middle mr-1">add</span>Nuevo
     </button>
     <button onClick={guardarTodos} disabled={guardando} className="edl-btn-primary text-sm bg-inst-verde hover:bg-inst-verde/90">
      <span className="material-icons text-base align-middle mr-1">save</span>Guardar Todo
     </button>
    </div>
   </div>

   {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

   {edlParams.length > 0 && (
    <div>
     <h3 className="text-sm font-semibold text-inst-azul mb-2 uppercase tracking-wider">
      <span className="material-icons text-sm align-middle mr-1">tune</span>
      Parametros EDL - Acuerdo 617 de 2018
     </h3>
     <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="border-b bg-inst-gris">
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Parametro</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Valor</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Tipo</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Descripcion</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro w-20"></th>
        </tr>
       </thead>
       <tbody>
        {edlParams.map(p => (
         <tr key={p.id} className="border-b hover:bg-inst-gris/50">
          <td className="px-4 py-3 font-mono text-xs font-semibold">{p.clave}</td>
          <td className="px-4 py-3">
           {p.tipo === 'booleano' ? (
            <input type="checkbox" checked={editando[p.clave] === 'true'} onChange={e => setEditando({...editando, [p.clave]: e.target.checked ? 'true' : 'false'})} className="rounded" />
           ) : p.tipo === 'numero' ? (
            <input type="number" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="edl-input w-24" />
           ) : (
            <input type="text" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="edl-input max-w-xs" />
           )}
          </td>
          <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-inst-azul/10 text-inst-azul">{p.tipo}</span></td>
          <td className="px-4 py-3 text-inst-texto-claro text-xs">{p.descripcion || '---'}</td>
          <td className="px-4 py-3">
           <button onClick={() => guardarParametro(p.clave)} disabled={guardando} className="text-inst-verde hover:text-inst-verde/80" title="Guardar">
            <span className="material-icons text-base">save</span>
           </button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {systemParams.length > 0 && (
    <div>
     <h3 className="text-sm font-semibold text-inst-texto-claro mb-2 uppercase tracking-wider">
      <span className="material-icons text-sm align-middle mr-1">admin_panel_settings</span>
      Parametros del Sistema
     </h3>
     <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="border-b bg-inst-gris">
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Parametro</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Valor</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Tipo</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Descripcion</th>
         <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro w-20"></th>
        </tr>
       </thead>
       <tbody>
        {systemParams.map(p => (
         <tr key={p.id} className="border-b hover:bg-inst-gris/50">
          <td className="px-4 py-3 font-mono text-xs font-semibold">{p.clave}</td>
          <td className="px-4 py-3">
           {p.tipo === 'booleano' ? (
            <input type="checkbox" checked={editando[p.clave] === 'true'} onChange={e => setEditando({...editando, [p.clave]: e.target.checked ? 'true' : 'false'})} className="rounded" />
           ) : p.tipo === 'numero' ? (
            <input type="number" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="edl-input w-24" />
           ) : (
            <input type="text" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="edl-input max-w-xs" />
           )}
          </td>
          <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-inst-azul/10 text-inst-azul">{p.tipo}</span></td>
          <td className="px-4 py-3 text-inst-texto-claro text-xs">{p.descripcion || '---'}</td>
          <td className="px-4 py-3 flex items-center gap-2">
           <button onClick={() => guardarParametro(p.clave)} disabled={guardando} className="text-inst-verde hover:text-inst-verde/80" title="Guardar">
            <span className="material-icons text-base">save</span>
           </button>
           <button onClick={() => eliminarParametro(p.id)} className="text-inst-rojo hover:text-inst-rojo/80" title="Eliminar">
            <span className="material-icons text-base">delete</span>
           </button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {cargando && (
    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-inst-azul" /></div>
   )}

   {mostrarNuevo && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setMostrarNuevo(false)}>
     <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="p-5 border-b">
       <h3 className="text-lg font-bold text-inst-azul">Nuevo Parametro</h3>
      </div>
      <div className="p-5 space-y-3">
       <div>
        <label className="text-xs text-inst-texto-claro">Clave</label>
        <input value={nuevo.clave} onChange={e => setNuevo({...nuevo, clave: e.target.value})} placeholder="ej: peso_funcionales" className="edl-input w-full" />
       </div>
       <div>
        <label className="text-xs text-inst-texto-claro">Valor</label>
        <input value={nuevo.valor} onChange={e => setNuevo({...nuevo, valor: e.target.value})} className="edl-input w-full" />
       </div>
       <div>
        <label className="text-xs text-inst-texto-claro">Tipo</label>
        <select value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value})} className="edl-input w-full">
         <option>texto</option><option>numero</option><option>booleano</option><option>json</option>
        </select>
       </div>
       <div>
        <label className="text-xs text-inst-texto-claro">Descripcion</label>
        <input value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} className="edl-input w-full" />
       </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-3">
       <button onClick={() => setMostrarNuevo(false)} className="edl-btn-outline">Cancelar</button>
       <button onClick={crearParametro} disabled={guardando} className="edl-btn-primary">{guardando ? 'Guardando...' : 'Crear'}</button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
