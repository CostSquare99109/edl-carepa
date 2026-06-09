import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

interface Movilidad {
 id: number
 funcionario_id: number
 funcionario_documento: string
 funcionario_nombres: string
 funcionario_apellidos: string
 funcionario_cargo: string
 tipo: string
 dependencia_origen: string | null
 dependencia_destino: string | null
 fecha_movimiento: string
 acto_administrativo: string | null
 observaciones: string | null
 estado: string
}

const TIPOS = ['ascenso', 'traslado', 'encargo', 'comision', 'reintegro', 'retiro', 'otro']
const ESTADOS = ['tramite', 'aprobado', 'ejecutado', 'anulado']

const TIPO_LABEL: Record<string, string> = {
 ascenso: 'Ascenso', traslado: 'Traslado', encargo: 'Encargo',
 comision: 'Comision', reintegro: 'Reintegro', retiro: 'Retiro', otro: 'Otro',
}
const ESTADO_COLOR: Record<string, string> = {
 tramite: 'bg-yellow-100 text-yellow-800', aprobado: 'bg-blue-100 text-blue-800',
 ejecutado: 'bg-green-100 text-green-800', anulado: 'bg-red-100 text-red-800',
}

export default function MovilidadList() {
 const { rolActivo } = useAuth()
 const [movilidades, setMovilidades] = useState<Movilidad[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [cargando, setCargando] = useState(true)
 const [busqueda, setBusqueda] = useState('')
 const [filtroTipo, setFiltroTipo] = useState('')
 const [filtroEstado, setFiltroEstado] = useState('')
 const [modal, setModal] = useState<'crear' | 'editar' | null>(null)
 const [editando, setEditando] = useState<Movilidad | null>(null)
 const [procesando, setProcesando] = useState(false)
 const [form, setForm] = useState({
  funcionario_id: '', tipo: 'traslado', dependencia_origen_id: '', dependencia_destino_id: '',
  fecha_movimiento: '', acto_administrativo: '', observaciones: '', estado: 'tramite',
 })

 useEffect(() => { cargar() }, [pagina, filtroTipo, filtroEstado])

 async function cargar() {
  setCargando(true)
  try {
   let url = `/movilidades?por_pagina=20&pagina=${pagina}`
   if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`
   if (filtroTipo) url += `&tipo=${filtroTipo}`
   if (filtroEstado) url += `&estado=${filtroEstado}`
   const res = await api.get<PaginatedData<Movilidad>>(url)
   setMovilidades(res.data || [])
   setTotal(res.total || 0)
  } catch (e: any) { console.error(e) }
  setCargando(false)
 }

 function abrirCrear() {
  setEditando(null)
  setForm({ funcionario_id: '', tipo: 'traslado', dependencia_origen_id: '', dependencia_destino_id: '', fecha_movimiento: '', acto_administrativo: '', observaciones: '', estado: 'tramite' })
  setModal('crear')
 }

 function abrirEditar(m: Movilidad) {
  setEditando(m)
  setForm({
   funcionario_id: String(m.funcionario_id), tipo: m.tipo,
   dependencia_origen_id: '', dependencia_destino_id: '',
   fecha_movimiento: m.fecha_movimiento,
   acto_administrativo: m.acto_administrativo || '',
   observaciones: m.observaciones || '', estado: m.estado,
  })
  setModal('editar')
 }

 async function guardar() {
  setProcesando(true)
  try {
   const payload = {
    funcionario_id: Number(form.funcionario_id),
    tipo: form.tipo,
    fecha_movimiento: form.fecha_movimiento,
    acto_administrativo: form.acto_administrativo || null,
    observaciones: form.observaciones || null,
    estado: form.estado,
   }
   if (editando) {
    await api.put(`/movilidades/${editando.id}`, payload)
   } else {
    await api.post('/movilidades', payload)
   }
   setModal(null)
   cargar()
  } catch (e: any) { alert(e.message || 'Error al guardar') }
  setProcesando(false)
 }

 async function ejecutar(m: Movilidad) {
  if (!confirm(`Ejecutar movilidad de ${m.funcionario_nombres}? Esto actualizara la dependencia del funcionario.`)) return
  setProcesando(true)
  try {
   await api.put(`/movilidades/${m.id}/ejecutar`, {})
   cargar()
  } catch (e: any) { alert(e.message || 'Error al ejecutar') }
  setProcesando(false)
 }

 const totalPages = Math.ceil(total / 20)

 return (
  <div className="min-h-screen">
   <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul text-xl">swap_horiz</span>
     <h2 className="edl-section-title">Movilidad de Funcionarios</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">Registro de ascensos, traslados, encargos y retiros</p>
   </div>

   <div className="edl-card mb-6">
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
       onKeyDown={e => e.key === 'Enter' && cargar()}
       className="edl-input" placeholder="Buscar funcionario..." />
     </div>
     <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }}
      className="edl-input w-auto">
      <option value="">Todo tipo</option>
      {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
     </select>
     <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}
      className="edl-input w-auto">
      <option value="">Todo estado</option>
      {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
     </select>
     <button onClick={abrirCrear} className="edl-btn-primary text-sm">
      <span className="material-icons text-sm mr-1">add</span> Registrar
     </button>
    </div>
   </div>

   {cargando ? (
    <div className="edl-card text-center py-12 text-inst-texto-claro">
     <span className="material-icons text-4xl animate-spin text-inst-azul block mx-auto">refresh</span>
    </div>
   ) : movilidades.length === 0 ? (
    <div className="edl-card text-center py-12 text-inst-texto-claro">
     <span className="material-icons text-5xl text-inst-borde block mx-auto mb-3">swap_horiz</span>
     <p className="text-lg font-medium">No hay movilidades registradas</p>
    </div>
   ) : (
    <div className="edl-card overflow-x-auto">
     <table className="w-full text-sm">
      <thead>
       <tr className="border-b border-inst-borde text-left text-inst-texto-claro">
        <th className="py-3 px-3">Funcionario</th>
        <th className="py-3 px-3">Tipo</th>
        <th className="py-3 px-3">Origen</th>
        <th className="py-3 px-3">Destino</th>
        <th className="py-3 px-3">Fecha</th>
        <th className="py-3 px-3">Estado</th>
        <th className="py-3 px-3">Acciones</th>
       </tr>
      </thead>
      <tbody>
       {movilidades.map(m => (
        <tr key={m.id} className="border-b border-inst-borde/50 hover:bg-inst-gris/50">
         <td className="py-2 px-3">
          <div className="font-medium text-inst-texto">{m.funcionario_nombres} {m.funcionario_apellidos}</div>
          <div className="text-xs text-inst-texto-claro">{m.funcionario_documento} - {m.funcionario_cargo}</div>
         </td>
         <td className="py-2 px-3">{TIPO_LABEL[m.tipo] || m.tipo}</td>
         <td className="py-2 px-3 text-xs">{m.dependencia_origen || '-'}</td>
         <td className="py-2 px-3 text-xs">{m.dependencia_destino || '-'}</td>
         <td className="py-2 px-3">{m.fecha_movimiento}</td>
         <td className="py-2 px-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLOR[m.estado] || ''}`}>{m.estado}</span>
         </td>
         <td className="py-2 px-3">
          <div className="flex gap-1">
           <button onClick={() => abrirEditar(m)} className="p-1 rounded hover:bg-inst-gris text-inst-texto-claro" title="Editar">
            <span className="material-icons text-base">edit</span>
           </button>
           {m.estado === 'aprobado' && (
            <button onClick={() => ejecutar(m)} className="p-1 rounded hover:bg-green-50 text-green-600" title="Ejecutar">
             <span className="material-icons text-base">check_circle</span>
            </button>
           )}
          </div>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   )}

   {totalPages > 1 && (
    <div className="flex items-center justify-center gap-2 mt-4">
     {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
      <button key={p} onClick={() => setPagina(p)}
       className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul text-white' : 'bg-white border hover:bg-inst-gris'}`}>{p}</button>
     ))}
    </div>
   )}

   {modal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
     <div className="bg-white rounded-xl shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
      <div className="px-6 py-4 border-b border-inst-borde">
       <h3 className="font-heading font-bold text-inst-texto">{editando ? 'Editar Movilidad' : 'Registrar Movilidad'}</h3>
      </div>
      <div className="px-6 py-4 space-y-3">
       <div>
        <label className="edl-label">ID Funcionario</label>
        <input type="number" value={form.funcionario_id} onChange={e => setForm({ ...form, funcionario_id: e.target.value })}
         className="edl-input" disabled={!!editando} required />
       </div>
       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="edl-label">Tipo</label>
         <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="edl-input">
          {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
         </select>
        </div>
        <div>
         <label className="edl-label">Estado</label>
         <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="edl-input">
          {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
         </select>
        </div>
       </div>
       <div>
        <label className="edl-label">Fecha del movimiento</label>
        <input type="date" value={form.fecha_movimiento} onChange={e => setForm({ ...form, fecha_movimiento: e.target.value })}
         className="edl-input" required />
       </div>
       <div>
        <label className="edl-label">Acto administrativo</label>
        <input value={form.acto_administrativo} onChange={e => setForm({ ...form, acto_administrativo: e.target.value })}
         className="edl-input" placeholder="Resolucion, Decreto..." />
       </div>
       <div>
        <label className="edl-label">Observaciones</label>
        <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
         className="edl-input min-h-[60px]" />
       </div>
      </div>
      <div className="px-6 py-4 border-t border-inst-borde flex justify-between">
       <button onClick={() => setModal(null)} className="edl-btn-outline">Cancelar</button>
       <button onClick={guardar} disabled={procesando} className="edl-btn-primary disabled:opacity-50">
        {procesando ? 'Guardando...' : 'Guardar'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
