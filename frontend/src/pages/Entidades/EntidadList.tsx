import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import DataTable from '../../components/Shared/DataTable'

interface Entidad {
 id: number
 codigo: string
 nombre: string
 tipo: string
 nit: string
 municipio: string
 departamento: string
 estado: string
}

const TIPOS = ['entidad', 'organismo', 'instituto', 'superintendencia', 'agencia', 'otro'] as const
const ESTADOS = ['activa', 'inactiva'] as const

export default function EntidadList() {
 const [items, setItems] = useState<Entidad[]>([])
 const [total, setTotal] = useState(0)
 const [pagina, setPagina] = useState(1)
 const [busqueda, setBusqueda] = useState('')
 const [loading, setLoading] = useState(true)
 const [editando, setEditando] = useState<Entidad | null>(null)
 const [saving, setSaving] = useState(false)

 function cargar() {
  setLoading(true)
  api.get<PaginatedData<Entidad>>(`/entidades?pagina=${pagina}&por_pagina=20&busqueda=${busqueda}`)
   .then(d => { setItems(d.data || []); setTotal(d.total); })
   .catch(() => {})
   .finally(() => setLoading(false))
 }

 useEffect(() => { cargar() }, [pagina, busqueda])

 async function guardar() {
  if (!editando) return
  setSaving(true)
  try {
   await api.put(`/entidades/${editando.id}`, {
    codigo: editando.codigo,
    nombre: editando.nombre,
    tipo: editando.tipo,
    nit: editando.nit,
    municipio: editando.municipio,
    departamento: editando.departamento,
    estado: editando.estado,
   })
   setEditando(null)
   cargar()
  } catch (err) {
   console.error('Error al guardar:', err)
  } finally {
   setSaving(false)
  }
 }

 const columns = [
  { key: 'codigo', label: 'Codigo', className: 'font-mono text-xs' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'nit', label: 'NIT' },
  {
   key: 'estado', label: 'Estado',
   render: (e: Entidad) => (
    <span className={e.estado === 'activa' ? 'edl-badge-activo' : 'edl-badge-inactivo'}>
     {e.estado}
    </span>
   ),
  },
  {
   key: 'acciones', label: 'Editar', className: 'text-center w-16',
   render: (e: Entidad) => (
    <button
     onClick={() => setEditando({ ...e })}
     className="p-1.5 rounded hover:bg-inst-gris transition-colors text-inst-azul hover:text-inst-rojo"
     title="Editar entidad"
    >
     <span className="material-icons text-lg">edit</span>
    </button>
   ),
  },
 ]

 return (
  <div>
   <h2 className="edl-section-title">Entidades</h2>
   <div className="edl-divider" />
   <div className="edl-divider-accent" />

   <DataTable<Entidad>
    columns={columns}
    data={items}
    loading={loading}
    emptyMessage="No se encontraron entidades"
    pagina={pagina}
    total={total}
    porPagina={20}
    onPaginaChange={setPagina}
    busqueda={busqueda}
    onBusquedaChange={v => { setBusqueda(v); setPagina(1); }}
    busquedaPlaceholder="Buscar entidad..."
    rowClassName={e => e.estado === 'inactiva' ? 'opacity-60' : ''}
   />

   {editando && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
     <div className="bg-white rounded-lg shadow-xl border border-inst-borde w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-inst-borde">
       <h3 className="edl-section-title text-base">Editar Entidad</h3>
       <button onClick={() => setEditando(null)} className="p-1 rounded hover:bg-inst-gris">
        <span className="material-icons text-xl text-inst-texto-claro">close</span>
       </button>
      </div>

      <div className="p-4 space-y-3">
       {editando.estado === 'inactiva' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
         <span className="material-icons text-yellow-600">lock</span>
         <p className="text-sm text-yellow-800 font-medium">Esta entidad esta inactiva (bloqueada). Puede reactivarla cambiando el estado.</p>
        </div>
       )}

       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Codigo</label>
        <input value={editando.codigo} onChange={e => setEditando({ ...editando, codigo: e.target.value })} className="edl-input w-full" />
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombre</label>
        <input value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} className="edl-input w-full" />
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo</label>
        <select value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })} className="edl-input w-full">
         {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">NIT</label>
        <input value={editando.nit || ''} onChange={e => setEditando({ ...editando, nit: e.target.value })} className="edl-input w-full" />
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Municipio</label>
        <input value={editando.municipio || ''} onChange={e => setEditando({ ...editando, municipio: e.target.value })} className="edl-input w-full" />
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Departamento</label>
        <input value={editando.departamento || ''} onChange={e => setEditando({ ...editando, departamento: e.target.value })} className="edl-input w-full" />
       </div>
       <div>
        <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
        <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })} className="edl-input w-full">
         {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
       </div>
      </div>

      <div className="flex justify-end gap-3 p-4 border-t border-inst-borde">
       <button onClick={() => setEditando(null)} className="edl-btn-outline">Cancelar</button>
       <button onClick={guardar} disabled={saving} className="edl-btn-primary flex items-center gap-2">
        {saving && <span className="material-icons text-sm animate-spin">sync</span>}
        Guardar
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
