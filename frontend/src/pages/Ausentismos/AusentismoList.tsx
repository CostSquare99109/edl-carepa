import { useState, useEffect } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

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
 { value: 'comision', label: 'Comisión' },
 { value: 'encargo', label: 'Encargo' },
 { value: 'suspension', label: 'Suspensión' },
 { value: 'licencias', label: 'Licencias' },
 { value: 'vacaciones', label: 'Vacaciones' },
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
    toast.error('No se encontró un funcionario con ese documento.')
   }
  } catch (e: any) {
   toast.error(e instanceof Error ? e.message : 'Error en la búsqueda')
  }
  setBuscando(false)
 }

 async function guardar() {
  if (!formFuncionarioId || !formTipo || !formFechaInicio || !formFechaFin) {
   toast.error('Todos los campos son obligatorios excepto observaciones.')
   return
  }
  const inicio = new Date(formFechaInicio)
  const fin = new Date(formFechaFin)
  if (fin <= inicio) {
   toast.error('La fecha fin debe ser posterior a la fecha inicio.')
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
   toast.error(e instanceof Error ? e.message : 'Error al guardar')
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
   toast.error(e instanceof Error ? e.message : 'Error al actualizar')
  }
  setGuardando(false)
 }

 async function eliminar(id: number) {
  if (!confirm('¿Está seguro de eliminar este ausentismo?')) return
  try {
   await api.delete(`/ausentismos/${id}`)
   cargar()
  } catch (e: any) {
   toast.error(e instanceof Error ? e.message : 'Error al eliminar')
  }
 }

 const totalPages = Math.ceil(total / 20)
 const puedeCrear = rolActivo === 'admin'

 const columns: DataTableColumn<Ausentismo>[] = [
  { key: 'funcionario', header: 'Funcionario', render: (a) => <span className="font-medium">{a.funcionario_nombre || '-'}</span> },
  { key: 'documento', header: 'Documento', render: (a) => a.funcionario_documento || '-' },
  { key: 'tipo', header: 'Motivo', render: (a) => TIPOS_AUSENTISMO.find(t => t.value === a.tipo)?.label || a.tipo },
  { key: 'fecha_inicio', header: 'Fecha inicio', render: (a) => a.fecha_inicio?.substring(0, 10) },
  { key: 'fecha_fin', header: 'Fecha fin', render: (a) => a.fecha_fin?.substring(0, 10) },
  { key: 'dias', header: 'Días hábiles', align: 'center', render: (a) => a.dias_habiles },
  {
   key: 'afecta',
   header: 'Afecta evaluación',
   align: 'center',
   render: (a) => a.afecta_evaluacion
    ? <Badge tone="danger">Sí</Badge>
    : <Badge tone="success">No</Badge>,
  },
  { key: 'obs', header: 'Observaciones', render: (a) => <span className="max-w-[200px] truncate inline-block">{a.observaciones || '-'}</span> },
  {
   key: 'acciones',
   header: 'Acciones',
   align: 'center',
   render: (a) => (
    <div className="flex items-center justify-center gap-1">
     <Tooltip content="Editar">
      <button onClick={() => setEditando({ ...a })} className="p-1 rounded hover:bg-inst-gris text-inst-azul-osc" aria-label="Editar">
       <span className="material-icons text-lg">edit</span>
      </button>
     </Tooltip>
     {puedeCrear ? (
      <Tooltip content="Eliminar">
       <button onClick={() => eliminar(a.id)} className="p-1 rounded hover:bg-inst-gris text-inst-rojo" aria-label="Eliminar">
        <span className="material-icons text-lg">delete</span>
       </button>
      </Tooltip>
     ) : null}
    </div>
   ),
  },
 ];

 return (
  <div className="space-y-6">
   <div className="animate-fadeIn">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul-osc text-xl">event_busy</span>
     <h2 className="edl-section-title">Ausentismos</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Periodos no evaluables superiores a 30 días (Decreto 815 Art. 36).
    </p>
   </div>

   <Card>
    <div className="flex flex-wrap items-end gap-4">
     <div className="flex-1 min-w-[200px]">
      <Input
       label="Buscar funcionario por documento"
       type="text"
       value={busquedaDoc}
       onChange={e => setBusquedaDoc(e.target.value)}
       onKeyDown={e => e.key === 'Enter' && buscarFuncionario()}
       placeholder="Número de documento"
       iconRight={
        <Button
         variant="primary"
         size="sm"
         loading={buscando}
         disabled={!busquedaDoc.trim()}
         onClick={buscarFuncionario}
        >
         Buscar
        </Button>
       }
      />
     </div>
    </div>
   </Card>

   {mostrarForm && formFuncionarioId > 0 ? (
    <Card className="border border-inst-azul-osc/20">
     <div className="flex items-center justify-between mb-4">
      <h3 className="font-heading font-semibold text-inst-azul-osc">Registrar ausentismo</h3>
      <Button variant="ghost" size="sm" iconLeft={<span className="material-icons">close</span>} onClick={() => setMostrarForm(false)}>
       Cerrar
      </Button>
     </div>
     <Card className="border-l-4 border-l-inst-azul-osc mb-4">
      <div className="flex items-center gap-2">
       <span className="material-icons text-inst-azul-osc">account_circle</span>
       <span className="font-heading font-bold text-inst-texto">{formFuncionarioNombre}</span>
       <span className="text-sm text-inst-texto-claro">— {formFuncionarioDoc}</span>
      </div>
     </Card>
     <div className="space-y-3">
      <Select
       label="Motivo"
       required
       value={formTipo}
       onChange={e => setFormTipo(e.target.value)}
       placeholder="Seleccione un motivo"
       options={TIPOS_AUSENTISMO.map(t => ({ value: t.value, label: t.label }))}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <Input label="Fecha inicio" type="date" required value={formFechaInicio} onChange={e => setFormFechaInicio(e.target.value)} />
       <Input label="Fecha fin" type="date" required value={formFechaFin} onChange={e => setFormFechaFin(e.target.value)} />
      </div>
      <div>
       <label htmlFor="obs-aus" className="edl-label">Observaciones (opcional)</label>
       <textarea
        id="obs-aus"
        value={formObservaciones}
        onChange={e => setFormObservaciones(e.target.value)}
        className="edl-input min-h-[60px]"
        placeholder="Observaciones sobre el ausentismo"
       />
      </div>
      <div className="flex justify-end gap-3 pt-2">
       <Button variant="outline" onClick={() => setMostrarForm(false)}>Cancelar</Button>
       <Button variant="primary" loading={guardando} onClick={guardar}>Guardar</Button>
      </div>
     </div>
    </Card>
   ) : null}

   <Card>
    {loading ? (
     <SkeletonText lines={6} />
    ) : items.length === 0 ? (
     <EmptyState
      icon={<span className="material-icons text-3xl">event_available</span>}
      title="Sin ausentismos registrados"
      description="No hay ausentismos para mostrar. Use el buscador para registrar uno nuevo."
     />
    ) : (
     <DataTable<Ausentismo>
      columns={columns}
      data={items}
      rowKey={(a) => a.id}
      ariaLabel="Lista de ausentismos"
      caption="Ausentismos registrados"
     />
    )}

    {totalPages > 1 && !loading && items.length > 0 ? (
     <div className="flex items-center justify-center gap-2 p-3">
      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
       <button
        key={p}
        onClick={() => setPagina(p)}
        className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-inst-azul-osc text-white' : 'bg-white border hover:bg-inst-gris'}`}
       >
        {p}
       </button>
      ))}
     </div>
    ) : null}
   </Card>

   {editando ? (
    <Modal open={true} onClose={() => setEditando(null)} title="Editar Ausentismo" size="md">
     <div className="space-y-3">
      <Select
       label="Motivo"
       required
       value={editando.tipo}
       onChange={e => setEditando({ ...editando, tipo: e.target.value })}
       options={TIPOS_AUSENTISMO.map(t => ({ value: t.value, label: t.label }))}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <Input
        label="Fecha inicio"
        type="date"
        value={editando.fecha_inicio?.substring(0, 10)}
        onChange={e => setEditando({ ...editando, fecha_inicio: e.target.value })}
       />
       <Input
        label="Fecha fin"
        type="date"
        value={editando.fecha_fin?.substring(0, 10)}
        onChange={e => setEditando({ ...editando, fecha_fin: e.target.value })}
       />
      </div>
      <div>
       <label htmlFor="obs-edit" className="edl-label">Observaciones</label>
       <textarea
        id="obs-edit"
        value={editando.observaciones || ''}
        onChange={e => setEditando({ ...editando, observaciones: e.target.value })}
        className="edl-input min-h-[60px]"
       />
      </div>
     </div>
     <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
      <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
      <Button variant="primary" loading={guardando} onClick={actualizar}>Guardar</Button>
     </div>
    </Modal>
   ) : null}
  </div>
 )
}
