import { useState, useEffect, useCallback } from 'react';
import { api, PaginatedData } from '../../lib/api';
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui';
import type { DataTableColumn } from '../../components/ui';
import { toast } from 'sonner';

interface Dependencia {
 id: number;
 entidad_id: number;
 codigo: string;
 nombre: string;
 estado: string;
 usuarios_count?: number;
}

interface Entidad {
 id: number;
 nombre: string;
}

export default function AdminDependencias() {
 const [dependencias, setDependencias] = useState<Dependencia[]>([]);
 const [total, setTotal] = useState(0);
 const [pagina, setPagina] = useState(1);
 const [busqueda, setBusqueda] = useState('');
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState('');
 const [modalAbierto, setModalAbierto] = useState(false);
 const [editando, setEditando] = useState<Dependencia | null>(null);
 const [guardando, setGuardando] = useState(false);
 const [entidades, setEntidades] = useState<Entidad[]>([]);
 const [form, setForm] = useState({ entidad_id: 0, codigo: '', nombre: '', estado: 'activa' });

 const cargar = useCallback(async () => {
 setCargando(true); setError('');
 try {
 const res = await api.get<PaginatedData<Dependencia>>(`/dependencias?pagina=${pagina}&por_pagina=20${busqueda ? `&busqueda=${encodeURIComponent(busqueda)}` : ''}`);
 setDependencias(res.data || []);
 setTotal(res.total || 0);
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Error de conexión');
 }
 setCargando(false);
 }, [pagina, busqueda]);

 const cargarEntidades = useCallback(async () => {
 try {
 const res = await api.get<PaginatedData<Entidad>>('/entidades?por_pagina=100');
 setEntidades(res.data || []);
 } catch {}
 }, []);

 useEffect(() => { cargar(); }, [cargar]);
 useEffect(() => { cargarEntidades(); }, [cargarEntidades]);

 const abrirCrear = () => {
 setEditando(null);
 setForm({ entidad_id: entidades[0]?.id || 0, codigo: '', nombre: '', estado: 'activa' });
 setModalAbierto(true);
 };

 const abrirEditar = (d: Dependencia) => {
 setEditando(d);
 setForm({ entidad_id: d.entidad_id || 0, codigo: d.codigo || '', nombre: d.nombre || '', estado: d.estado || 'activa' });
 setModalAbierto(true);
 };

 const guardar = async () => {
 if (!form.nombre.trim()) {
 toast.error('El nombre es obligatorio');
 return;
 }
 setGuardando(true);
 try {
 if (editando) {
 await api.put(`/dependencias/${editando.id}`, form);
 toast.success('Dependencia actualizada');
 } else {
 await api.post('/dependencias', form);
 toast.success('Dependencia creada');
 }
 setModalAbierto(false); cargar();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al guardar');
 }
 setGuardando(false);
 };

  const eliminar = async (d: Dependencia) => {
    if (!confirm(`¿Eliminar permanentemente la dependencia "${d.nombre}"?\n\nEsta acción no se puede deshacer. Se eliminarán también las metas asociadas.`)) return;
    try {
      await api.delete(`/dependencias/${d.id}`);
      toast.success('Dependencia eliminada correctamente');
      cargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const toggleEstado = async (d: Dependencia) => {
    const nuevo = d.estado === 'activa' ? 'inactiva' : 'activa';

    // Modal de confirmación CNSC: si va a inactivar, advertir sobre restricción
    const mensaje = nuevo === 'inactiva'
      ? `¿Está seguro de inactivar la dependencia "${d.nombre}"?\n\nRecuerde que, conforme al Anexo Técnico del Acuerdo 617 de 2018, solo se puede inactivar si NO tiene usuarios activos asociados. Si los tiene, la operación será rechazada por el sistema.`
      : `¿Activar la dependencia "${d.nombre}"?`;

    if (!confirm(mensaje)) return;

    try {
      // Usar endpoint dedicado cambiarEstado para validación de usuarios activos
      await api.put(`/dependencias/${d.id}/estado`, { estado: nuevo });
      toast.success(`Dependencia ${nuevo === 'activa' ? 'activada' : 'inactivada'} correctamente`);
      cargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cambiar estado');
    }
  };

 const totalPages = Math.ceil(total / 20);

 const columns: DataTableColumn<Dependencia>[] = [
 { key: 'codigo', header: 'Código', render: (d) => <span className="font-mono text-xs">{d.codigo || '—'}</span> },
 { key: 'nombre', header: 'Nombre', render: (d) => d.nombre },
 {
   key: 'usuarios',
   header: 'Usuarios activos',
   align: 'center',
   render: (d) => {
     const count = d.usuarios_count ?? 0;
     return (
       <Badge tone={count > 0 ? 'info' : 'neutral'}>
         {count}
       </Badge>
     );
   },
 },
 {
 key: 'estado',
 header: 'Estado',
 render: (d) => (
 <button
 type="button"
 onClick={() => toggleEstado(d)}
 className="focus:outline-none focus:ring-2 focus:ring-inst-azul-osc rounded-full"
 aria-label={`Cambiar estado de ${d.nombre}`}
 >
 <Badge tone={d.estado === 'activa' ? 'success' : 'neutral'} dot>
 {d.estado === 'activa' ? 'Activa' : 'Inactiva'}
 </Badge>
 </button>
 ),
 },
 {
  key: 'acciones',
  header: 'Acciones',
  align: 'center',
  render: (d) => (
  <div className="flex items-center justify-center gap-2">
  <Tooltip content="Editar dependencia">
  <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-sm">edit</span>} onClick={() => abrirEditar(d)}>
  Editar
  </Button>
  </Tooltip>
  <Tooltip content="Eliminar dependencia">
  <Button variant="danger" size="sm" iconLeft={<span className="material-icons text-sm">delete</span>} onClick={() => eliminar(d)}>
  Eliminar
  </Button>
  </Tooltip>
  </div>
  ),
  },
 ];

 return (
 <div className="space-y-6 p-4 lg:p-6">
 <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
 <h2 className="text-xl font-heading font-bold text-inst-azul-osc">
 <span className="material-icons align-middle mr-2 text-2xl">account_tree</span>
 Dependencias
 </h2>
 <Button variant="primary" iconLeft={<span className="material-icons text-base">add_business</span>} onClick={abrirCrear}>
 Nueva Dependencia
 </Button>
 </div>

 <Card>
 <Input
 label="Buscar"
 type="search"
 value={busqueda}
 onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
 placeholder="Buscar por nombre o código..."
 iconLeft={<span className="material-icons text-base">search</span>}
 />
 </Card>

 {error ? (
 <Alert tone="danger" title="Error de conexión" onDismiss={() => setError('')}>
 {error}
 <Button variant="outline" size="sm" className="mt-2" onClick={cargar}>Reintentar</Button>
 </Alert>
 ) : null}

 <Card>
 {cargando ? (
 <SkeletonText lines={6} />
 ) : dependencias.length === 0 ? (
 <EmptyState
 icon={<span className="material-icons text-3xl">account_tree</span>}
 title="Sin dependencias"
 description="No hay dependencias registradas. Cree una con el botón superior."
 />
 ) : (
 <DataTable<Dependencia>
 columns={columns}
 data={dependencias}
 rowKey={(d) => d.id}
 ariaLabel="Lista de dependencias"
 caption="Dependencias del sistema"
 />
 )}

 {totalPages > 1 && !cargando && dependencias.length > 0 ? (
 <div className="flex items-center justify-center gap-2 p-3 mt-3 border-t border-inst-borde">
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

 {modalAbierto ? (
 <Modal
 open={true}
 onClose={() => setModalAbierto(false)}
 title={editando ? 'Editar Dependencia' : 'Nueva Dependencia'}
 size="md"
 >
 <div className="space-y-3">
 <Select
 label="Entidad"
 value={form.entidad_id || ''}
 onChange={e => setForm({...form, entidad_id: Number(e.target.value)})}
 placeholder="Seleccione una entidad"
 options={entidades.map(ent => ({ value: String(ent.id), label: ent.nombre }))}
 />
 <Input
 label="Código"
 type="text"
 value={form.codigo}
 onChange={e => setForm({...form, codigo: e.target.value})}
 placeholder="Ej: DEP-001"
 />
 <Input
 label="Nombre"
 type="text"
 required
 value={form.nombre}
 onChange={e => setForm({...form, nombre: e.target.value})}
 placeholder="Nombre de la dependencia"
 />
 <Select
 label="Estado"
 value={form.estado}
 onChange={e => setForm({...form, estado: e.target.value})}
 options={[
 { value: 'activa', label: 'Activa' },
 { value: 'inactiva', label: 'Inactiva' },
 ]}
 />
 </div>
 <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
 <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
 <Button variant="primary" loading={guardando} onClick={guardar}>
 {editando ? 'Actualizar' : 'Crear'}
 </Button>
 </div>
 </Modal>
 ) : null}
 </div>
 );
}
