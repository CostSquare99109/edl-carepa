import { useEffect, useState } from 'react'
import { api, type PaginatedData } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Select, Alert, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface Meta {
 id: number
 periodo_id: number
 dependencia_id: number | null
 descripcion: string
}

interface DependenciaOption {
 id: number
 nombre: string
 codigo: string
}

export default function MetaList() {
  const { usuario, rolActivo } = useAuth();
  const [items, setItems] = useState<Meta[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Meta | null>(null)
  const [creando, setCreando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dependencias, setDependencias] = useState<DependenciaOption[]>([])
  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([])
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState<Meta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dependenciasVisibles = (rolActivo === 'jefe_dependencia' && usuario?.dependencia_id)
    ? dependencias.filter(d => d.id === usuario.dependencia_id)
    : dependencias;

  const [formNueva, setFormNueva] = useState({
    periodo_id: '' as string | number,
    dependencia_id: '' as string | number,
    descripcion: '',
  });

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

  function cargarPeriodos() {
  api.get<PaginatedData<{ id: number; nombre: string }>>('/periodos?por_pagina=100')
  .then(d => setPeriodos(d.data || []))
  .catch(() => {})
  }

  useEffect(() => { cargar(); cargarDependencias(); cargarPeriodos(); }, [pagina])

  function abrirCrear() {
    const periodoActual = periodos.length > 0 ? periodos[0].id : '';
    setFormNueva({
      periodo_id: periodoActual,
      dependencia_id: '',
      descripcion: '',
    });
    setCreando(true);
  }

  function contarPalabras(texto: string): number {
    return texto.trim() ? texto.trim().split(/\s+/).length : 0;
  }

  async function crearMeta() {
    if (!formNueva.periodo_id) { toast.error('Seleccione un período'); return; }
    if (!formNueva.dependencia_id) { toast.error('Seleccione una dependencia'); return; }
    const palabras = contarPalabras(formNueva.descripcion);
    if (palabras > 20) { toast.error(`La descripción no debe exceder 20 palabras (actual: ${palabras})`); return; }
    if (!formNueva.descripcion.trim()) { toast.error('La descripción es obligatoria'); return; }
    if (!usuario) { toast.error('No hay sesión activa'); return; }
    setSaving(true);
    try {
      await api.post('/metas', {
        periodo_id: Number(formNueva.periodo_id),
        dependencia_id: Number(formNueva.dependencia_id),
        funcionario_id: usuario.id,
        evaluador_id: usuario.id,
        descripcion: formNueva.descripcion.trim(),
      });
      toast.success('Meta creada correctamente');
      setCreando(false);
      cargar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la meta');
    } finally {
      setSaving(false);
    }
  }

  async function eliminarMeta() {
    if (!eliminando) return;
    setDeleting(true);
    try {
      await api.delete(`/metas/${eliminando.id}`);
      toast.success('Meta eliminada correctamente');
      setEliminando(null);
      cargar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar la meta');
    } finally {
      setDeleting(false);
    }
  }

  async function guardar() {
    if (!editando) return
    if (!editando.descripcion.trim()) {
     toast.error('La descripción es obligatoria');
     return;
    }
    const palabras = contarPalabras(editando.descripcion);
    if (palabras > 20) { toast.error(`La descripción no debe exceder 20 palabras (actual: ${palabras})`); return; }
    setSaving(true)
    try {
      await api.put(`/metas/${editando.id}`, {
        dependencia_id: editando.dependencia_id,
        descripcion: editando.descripcion,
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
     key: 'acciones',
     header: 'Acciones',
     align: 'center',
     render: (m) => (
      <div className="flex items-center justify-center gap-1">
       <Tooltip content="Editar meta">
        <Button
         variant="ghost"
         size="sm"
         onClick={() => setEditando({ ...m })}
         aria-label={`Editar meta ${m.descripcion.slice(0, 30)}`}
        >
         <span className="material-icons text-base">edit</span>
        </Button>
       </Tooltip>
       <Tooltip content="Eliminar meta">
        <Button
         variant="ghost"
         size="sm"
         onClick={() => setEliminando(m)}
         aria-label={`Eliminar meta ${m.descripcion.slice(0, 30)}`}
        >
         <span className="material-icons text-base text-inst-rojo">delete</span>
        </Button>
       </Tooltip>
      </div>
     ),
    },
  ];

  return (
   <div className="space-y-6">
    <div className="animate-fadeIn">
     <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
       <h2 className="edl-section-title">
        <span className="material-icons align-middle mr-2 text-xl">flag</span>
        Metas
       </h2>
       <p className="text-sm text-inst-texto-claro ml-7">
        Las metas son fijadas por el jefe de la entidad para todos los servidores de una dependencia. Se evalúan como compromisos funcionales.
       </p>
      </div>
      <Button variant="primary" iconLeft={<span className="material-icons text-base">add</span>} onClick={abrirCrear}>
       Nueva Meta
      </Button>
     </div>
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
      <div className="space-y-3">
       <Select
         label="Dependencia"
         value={editando.dependencia_id || ''}
         onChange={e => setEditando({ ...editando, dependencia_id: e.target.value ? Number(e.target.value) : null })}
         placeholder="Seleccione una dependencia..."
         options={dependenciasVisibles.map(d => ({ value: String(d.id), label: d.nombre }))}
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

      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
       <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
       <Button variant="primary" loading={saving} onClick={guardar}>Guardar</Button>
      </div>
     </Modal>
    ) : null}
    {creando ? (
      <Modal
        open={true}
        onClose={() => setCreando(false)}
        title="Nueva Meta"
        size="md"
      >
        <div className="space-y-3">
          <Select
            label="Dependencia *"
            value={formNueva.dependencia_id}
            onChange={e => setFormNueva({ ...formNueva, dependencia_id: e.target.value })}
            placeholder="Seleccione una dependencia..."
            options={dependenciasVisibles.map(d => ({ value: String(d.id), label: d.nombre }))}
          />
          <div>
            <label htmlFor="nueva-meta-desc" className="edl-label">
              Descripción *
              <span className={`text-xs ml-2 ${contarPalabras(formNueva.descripcion) <= 20 ? 'text-inst-azul-osc' : 'text-inst-rojo'}`}>
                ({contarPalabras(formNueva.descripcion)}/20 palabras)
              </span>
            </label>
            <textarea
              id="nueva-meta-desc"
              value={formNueva.descripcion}
              onChange={e => setFormNueva({ ...formNueva, descripcion: e.target.value })}
              className="edl-input w-full"
              rows={4}
              placeholder="Descripción de la meta (máximo 20 palabras)..."
            />
            {contarPalabras(formNueva.descripcion) > 20 && (
              <p className="text-xs text-inst-rojo mt-1">Ha excedido el máximo de 20 palabras.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
          <Button variant="outline" onClick={() => setCreando(false)}>Cancelar</Button>
          <Button variant="primary" loading={saving} onClick={crearMeta}>
            Crear Meta
          </Button>
        </div>
      </Modal>
    ) : null}
    {eliminando ? (
      <Modal
        open={true}
        onClose={() => setEliminando(null)}
        title="Eliminar Meta"
        size="sm"
      >
        <p className="text-sm">
          ¿Está seguro de eliminar la meta <strong>"{eliminando.descripcion.slice(0, 80)}"</strong>?
        </p>
        <p className="text-xs text-inst-texto-claro mt-1">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
          <Button variant="outline" onClick={() => setEliminando(null)} disabled={deleting}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={eliminarMeta}>Eliminar</Button>
        </div>
      </Modal>
    ) : null}
   </div>
  )
}
