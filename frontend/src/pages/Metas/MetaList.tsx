import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface Meta {
 id: number
 periodo_id: number
 funcionario_id: number
 dependencia_id: number | null
 descripcion: string
 tipo: string
 peso: number
 indicador: string
 meta_numerica: number | null
 unidad_medida: string
 estado: string
}

interface DependenciaOption {
 id: number
 nombre: string
 codigo: string
}

const TIPOS_META: { value: Meta['tipo']; label: string }[] = [
 { value: 'cualitativa', label: 'Cualitativa' },
 { value: 'cuantitativa', label: 'Cuantitativa' },
 { value: 'mixta', label: 'Mixta' },
];

const ESTADO_META: Record<string, { tone: 'neutral' | 'warning' | 'success' | 'info' | 'danger'; label: string }> = {
 pendiente: { tone: 'warning', label: 'Pendiente' },
 concertada: { tone: 'info', label: 'Concertada' },
 aprobada: { tone: 'success', label: 'Aprobada' },
 en_seguimiento: { tone: 'info', label: 'En seguimiento' },
 evaluada: { tone: 'success', label: 'Evaluada' },
 cerrada: { tone: 'neutral', label: 'Cerrada' },
};

const ESTADOS_META = Object.keys(ESTADO_META);

export default function MetaList() {
  const [items, setItems] = useState<Meta[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Meta | null>(null)
  const [saving, setSaving] = useState(false)
  const [dependencias, setDependencias] = useState<DependenciaOption[]>([])
  const [error, setError] = useState('');

  function cargar() {
  setLoading(true)
  api.get<PaginatedData<Meta>>(`/metas?pagina=${pagina}&por_pagina=20`)
  .then(d => { setItems(d.data || []); setTotal(d.total); setError(''); })
  .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar metas'))
  .finally(() => setLoading(false))
  }

  function cargarDependencias() {
  api.get<PaginatedData<DependenciaOption>>('/dependencias?por_pagina=200')
  .then(d => setDependencias(d.data || []))
  .catch(() => {})
  }

  useEffect(() => { cargar(); cargarDependencias() }, [pagina])

  async function guardar() {
    if (!editando) return
    if (!editando.descripcion.trim()) {
     toast.error('La descripción es obligatoria');
     return;
    }
    setSaving(true)
    try {
      await api.put(`/metas/${editando.id}`, {
      dependencia_id: editando.dependencia_id,
      descripcion: editando.descripcion,
        tipo: editando.tipo,
        peso: editando.peso,
        indicador: editando.indicador,
        meta_numerica: editando.meta_numerica,
        unidad_medida: editando.unidad_medida,
        estado: editando.estado,
      })
      toast.success('Meta actualizada correctamente');
      setEditando(null)
      cargar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar la meta');
    } finally {
      setSaving(false)
    }
  }

  const columns: DataTableColumn<Meta>[] = [
   {
    key: 'dependencia',
    header: 'Dependencia',
    render: (m) => dependencias.find(d => d.id === m.dependencia_id)?.nombre || <span className="text-inst-texto-claro">Sin dependencia</span>,
   },
   {
    key: 'descripcion',
    header: 'Descripción',
    render: (m) => <span className="max-w-md truncate inline-block">{m.descripcion}</span>,
   },
   {
    key: 'tipo',
    header: 'Tipo',
    render: (m) => <Badge tone="neutral">{TIPOS_META.find(t => t.value === m.tipo)?.label || m.tipo}</Badge>,
   },
   { key: 'peso', header: 'Peso', align: 'center', render: (m) => <span className="font-mono">{m.peso}%</span> },
   { key: 'indicador', header: 'Indicador', render: (m) => <span className="max-w-xs truncate inline-block">{m.indicador || '-'}</span> },
   {
    key: 'estado',
    header: 'Estado',
    render: (m) => {
     const e = ESTADO_META[m.estado] ?? { tone: 'neutral' as const, label: m.estado };
     return <Badge tone={e.tone}>{e.label}</Badge>;
    },
   },
   {
    key: 'acciones',
    header: 'Editar',
    align: 'center',
    render: (m) => (
     <Tooltip content={m.estado === 'cerrada' ? 'Reabrir/Editar meta' : 'Editar meta'}>
      <Button
       variant="ghost"
       size="sm"
       onClick={() => setEditando({ ...m })}
       aria-label={`Editar meta ${m.descripcion.slice(0, 30)}`}
      >
       <span className="material-icons text-base">edit</span>
      </Button>
     </Tooltip>
    ),
   },
  ];

  return (
   <div className="space-y-6">
    <div className="animate-fadeIn">
     <h2 className="edl-section-title">
      <span className="material-icons align-middle mr-2 text-xl">flag</span>
      Metas
     </h2>
     <p className="text-sm text-inst-texto-claro ml-7">
      Las metas son fijadas por el jefe de la entidad para todos los servidores de una dependencia. Se evalúan como compromisos funcionales.
     </p>
    </div>

    {error ? (
     <Alert tone="danger" onDismiss={() => setError('')}>{error}</Alert>
    ) : null}

    <Card>
     {loading ? (
      <SkeletonText lines={8} />
     ) : items.length === 0 ? (
      <EmptyState
       icon={<span className="material-icons text-3xl">flag</span>}
       title="Sin metas registradas"
       description="No hay metas para mostrar. Cree metas desde el módulo de Administración."
      />
     ) : (
      <DataTable<Meta>
       columns={columns}
       data={items}
       rowKey={(m) => m.id}
       ariaLabel="Lista de metas"
       caption="Metas de evaluación"
      />
     )}
    </Card>

    {editando ? (
     <Modal
      open={true}
      onClose={() => setEditando(null)}
      title="Editar Meta"
      size="md"
     >
      {editando.estado === 'cerrada' ? (
       <Alert tone="warning" title="Meta cerrada" className="mb-3">
        Esta meta está cerrada. Puede reabrirla cambiando el estado a "Pendiente" o "En seguimiento".
       </Alert>
      ) : null}

      <div className="space-y-3">
       <Select
        label="Dependencia"
        value={editando.dependencia_id || ''}
        onChange={e => setEditando({ ...editando, dependencia_id: e.target.value ? Number(e.target.value) : null })}
        placeholder="Sin dependencia"
        options={dependencias.map(d => ({ value: String(d.id), label: d.nombre }))}
        helperText="Asocia la meta a una dependencia específica"
       />

       <div>
        <label htmlFor="meta-desc" className="edl-label">Descripción <span className="text-inst-rojo">*</span></label>
        <textarea
         id="meta-desc"
         value={editando.descripcion}
         onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
         className="edl-input w-full"
         rows={3}
        />
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
         label="Tipo"
         value={editando.tipo}
         onChange={e => setEditando({ ...editando, tipo: e.target.value })}
         options={TIPOS_META.map(t => ({ value: t.value, label: t.label }))}
        />
        <Input
         label="Peso (%)"
         type="number"
         value={editando.peso}
         onChange={e => setEditando({ ...editando, peso: parseFloat(e.target.value) || 0 })}
         min={0}
         max={100}
         step={0.01}
         helperText="0 a 100"
        />
       </div>

       <Input
        label="Indicador"
        type="text"
        value={editando.indicador || ''}
        onChange={e => setEditando({ ...editando, indicador: e.target.value })}
       />

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
         label="Meta numérica"
         type="number"
         value={editando.meta_numerica ?? ''}
         onChange={e => setEditando({ ...editando, meta_numerica: e.target.value ? parseFloat(e.target.value) : null })}
         step={0.01}
        />
        <Input
         label="Unidad de medida"
         type="text"
         value={editando.unidad_medida || ''}
         onChange={e => setEditando({ ...editando, unidad_medida: e.target.value })}
        />
       </div>

       <Select
        label="Estado"
        value={editando.estado}
        onChange={e => setEditando({ ...editando, estado: e.target.value })}
        options={ESTADOS_META.map(e => ({ value: e, label: ESTADO_META[e]?.label || e }))}
       />
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
       <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
       <Button variant="primary" loading={saving} onClick={guardar}>Guardar</Button>
      </div>
     </Modal>
    ) : null}
   </div>
  )
}
