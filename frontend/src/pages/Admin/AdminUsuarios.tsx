import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, PaginatedData } from '../../lib/api';
import { Card, Button, Input, Select, Alert, Badge, Modal, EmptyState, DataTable, Tooltip, SkeletonText } from '../../components/ui';
import type { DataTableColumn } from '../../components/ui';
import { toast } from 'sonner';

interface Usuario {
 id: number;
 documento: string;
 tipo_documento: string;
 nombres: string;
 apellidos: string;
 genero: string;
 municipio: string;
 email: string;
 telefono: string;
 telefono_secundario: string;
 cargo: string;
 denominacion_empleo: string;
 codigo_empleo: string;
 grado: string;
 tipo_vinculacion: string;
 es_contratista: number;
 nivel_carrera: string;
 naturaleza: string;
 tipo_nombramiento: string;
 periodo_prueba: number;
 proposito_empleo: string;
 estado: string;
 roles: { codigo: string; nombre: string }[];
}

const ROLES_SISTEMA = [
	{ codigo: 'admin', nombre: 'Administrador' },
	{ codigo: 'evaluador', nombre: 'Evaluador' },
	{ codigo: 'evaluado', nombre: 'Evaluado' },
];

const ROLE_COLORS: Record<string, string> = {
	admin: 'bg-red-100 text-red-800 border-red-200',
	evaluador: 'bg-green-100 text-green-800 border-green-200',
	evaluado: 'bg-blue-100 text-blue-800 border-blue-200',
};

const ROLE_SHORT: Record<string, string> = {
	admin: 'Admin',
	evaluador: 'Eval.',
	evaluado: 'Evaldo.',
};

const CARGOS_SUGERIDOS = [
	'Administrador',
	'Jefe de Entidad',
	'Jefe de Dependencia',
	'Director',
	'Profesional Especializado',
	'Profesional Universitario',
	'Tecnico Operativo',
	'Auxiliar Administrativo',
	'Evaluador Senior',
	'Evaluador Tecnico',
];

export default function AdminUsuarios() {
 const [searchParams] = useSearchParams();
 const filtroInicial = searchParams.get('filtro') || '';
 const [usuarios, setUsuarios] = useState<Usuario[]>([]);
 const [total, setTotal] = useState(0);
 const [pagina, setPagina] = useState(1);
 const [busqueda, setBusqueda] = useState('');
 const [filtroRol, setFiltroRol] = useState(filtroInicial);
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState('');
 const [modalAbierto, setModalAbierto] = useState(false);
 const [editando, setEditando] = useState<Usuario | null>(null);
 const [guardando, setGuardando] = useState(false);
 const [form, setForm] = useState({
 documento: '', tipo_documento: 'CC', nombres: '', apellidos: '',
 genero: '', municipio: '', email: '', telefono: '', telefono_secundario: '',
 cargo: '', denominacion_empleo: '', codigo_empleo: '', grado: '',
 tipo_vinculacion: 'planta', es_contratista: 0,
 nivel_carrera: '', naturaleza: '', tipo_nombramiento: '',
 periodo_prueba: 0, proposito_empleo: '',
 password: '', estado: 'activo',
 roles: ['evaluado'] as string[],
 });

 const cargar = useCallback(async () => {
 setCargando(true); setError('');
 try {
 let url = `/usuarios?pagina=${pagina}&por_pagina=20`;
		if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;
 if (filtroRol) url += `&rol=${encodeURIComponent(filtroRol)}`;
 const res = await api.get<PaginatedData<Usuario>>(url);
 setUsuarios(res.data || []);
 setTotal(res.total || 0);
 } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido'); }
 setCargando(false);
 }, [pagina, busqueda, filtroRol]);

 useEffect(() => { cargar(); }, [cargar]);

 const abrirCrear = () => {
 setEditando(null);
 setForm({ documento: '', tipo_documento: 'CC', nombres: '', apellidos: '',
 genero: '', municipio: '', email: '', telefono: '', telefono_secundario: '',
 cargo: '', denominacion_empleo: '', codigo_empleo: '', grado: '',
 tipo_vinculacion: 'planta', es_contratista: 0,
 nivel_carrera: '', naturaleza: '', tipo_nombramiento: '',
 periodo_prueba: 0, proposito_empleo: '',
 password: '', estado: 'activo', roles: ['evaluado'] });
 setModalAbierto(true);
 };

 const abrirEditar = (u: Usuario) => {
 setEditando(u);
 setForm({
 documento: u.documento, tipo_documento: u.tipo_documento || 'CC',
 nombres: u.nombres, apellidos: u.apellidos,
 genero: u.genero || '', municipio: u.municipio || '',
 email: u.email || '', telefono: u.telefono || '', telefono_secundario: u.telefono_secundario || '',
 cargo: u.cargo || '', denominacion_empleo: u.denominacion_empleo || '',
 codigo_empleo: u.codigo_empleo || '', grado: u.grado || '',
 tipo_vinculacion: u.tipo_vinculacion || 'planta', es_contratista: u.es_contratista || 0,
 nivel_carrera: u.nivel_carrera || '', naturaleza: u.naturaleza || '',
 tipo_nombramiento: u.tipo_nombramiento || '',
 periodo_prueba: u.periodo_prueba || 0, proposito_empleo: u.proposito_empleo || '',
 password: '', estado: u.estado || 'activo',
 roles: u.roles?.map(r => r.codigo) || ['evaluado'],
 });
 setModalAbierto(true);
 };

 const guardar = async () => {
 setGuardando(true);
 try {
 if (editando) {
 const payload: Record<string, unknown> = { ...form };
 if (!form.password) delete payload.password;
 await api.put(`/usuarios/${editando.id}`, payload);
 toast.success('Usuario actualizado correctamente');
 } else {
 await api.post('/usuarios', form);
 toast.success('Usuario creado correctamente');
 }
 setModalAbierto(false); cargar();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al guardar usuario');
 }
 setGuardando(false);
 };

 const toggleRol = (codigo: string) => {
 setForm(prev => ({
 ...prev,
 roles: prev.roles.includes(codigo) ? prev.roles.filter(r => r !== codigo) : [...prev.roles, codigo],
 }));
 };

 const toggleEstado = async (u: Usuario) => {
 const nuevo = u.estado === 'activo' ? 'inactivo' : 'activo';
 try { await api.put(`/usuarios/${u.id}`, { estado: nuevo }); toast.success(`Usuario ${nuevo}`); cargar(); }
 catch (e) { toast.error(e instanceof Error ? e.message : 'Error al cambiar estado'); }
 };

 const restablecerPassword = async (u: Usuario) => {
 if (!confirm(`¿Restablecer contraseña de ${u.nombres} ${u.apellidos}?`)) return;
 try {
 const res = await api.put<{ password_temporal: string }>(`/usuarios/${u.id}/restablecer-password`);
 toast.success(`Contraseña temporal: ${res.password_temporal}`, { duration: 10_000 });
 } catch (e) {
 toast.error(e instanceof Error ? e.message : 'Error al restablecer contraseña');
 }
 };

 const totalPages = Math.ceil(total / 20);

 const columns: DataTableColumn<Usuario>[] = [
  { key: 'documento', header: 'Documento', render: (u) => <span className="font-mono text-xs">{u.documento}</span> },
  { key: 'nombre', header: 'Nombre', render: (u) => `${u.nombres} ${u.apellidos}` },
  { key: 'email', header: 'Email', render: (u) => u.email || <span className="text-inst-texto-claro">—</span> },
  { key: 'cargo', header: 'Cargo', render: (u) => u.cargo || <span className="text-inst-texto-claro">—</span> },
  {
   key: 'roles',
   header: 'Roles',
   render: (u) => (
    <div className="flex gap-1 flex-wrap">
     {(u.roles || []).map((r) => (
      <Badge
       key={r.codigo}
       tone={r.codigo === 'admin' ? 'danger' : r.codigo === 'evaluador' ? 'success' : 'info'}
      >
       {r.nombre || r.codigo}
      </Badge>
     ))}
     {(!u.roles || u.roles.length === 0) ? <span className="text-xs text-inst-texto-claro">Sin rol</span> : null}
    </div>
   ),
  },
  {
   key: 'estado',
   header: 'Estado',
   render: (u) => (
    <button
     type="button"
     onClick={() => toggleEstado(u)}
     className="focus:outline-none focus:ring-2 focus:ring-inst-azul-osc rounded-full"
     aria-label={`Cambiar estado de ${u.nombres} ${u.apellidos}`}
    >
     <Badge tone={u.estado === 'activo' ? 'success' : 'neutral'} dot>
      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
     </Badge>
    </button>
   ),
  },
  {
   key: 'acciones',
   header: 'Acciones',
   align: 'center',
   render: (u) => (
    <div className="flex gap-1 justify-center">
     <Tooltip content="Editar usuario">
      <Button variant="outline" size="sm" iconLeft={<span className="material-icons text-sm">edit</span>} onClick={() => abrirEditar(u)}>
       Editar
      </Button>
     </Tooltip>
     <Tooltip content="Restablecer contraseña">
      <Button
       variant="ghost"
       size="sm"
       onClick={() => restablecerPassword(u)}
       aria-label={`Restablecer contraseña de ${u.nombres} ${u.apellidos}`}
      >
       <span className="material-icons text-base">lock_reset</span>
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
  <span className="material-icons align-middle mr-2 text-2xl">people</span>
  Usuarios
 </h2>
 <Button variant="primary" iconLeft={<span className="material-icons text-base">person_add</span>} onClick={abrirCrear}>
  Nuevo Usuario
 </Button>
 </div>

 <Card>
 <div className="flex gap-3 flex-wrap items-end">
  <div className="flex-1 min-w-[240px]">
  <Input
   label="Buscar"
   type="search"
   value={busqueda}
   onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
   placeholder="Buscar por nombre o documento..."
   iconLeft={<span className="material-icons text-base">search</span>}
  />
  </div>
  <div className="min-w-[180px]">
  <Select
   label="Rol"
   value={filtroRol}
   onChange={e => { setFiltroRol(e.target.value); setPagina(1); }}
   placeholder="Todos los roles"
   options={ROLES_SISTEMA.map(r => ({ value: r.codigo, label: r.nombre }))}
  />
  </div>
 </div>
 </Card>

 {error ? (
 <Alert tone="danger" title="Error al cargar usuarios" onDismiss={() => setError('')}>
  {error}
 </Alert>
 ) : null}

 <Card>
 {cargando ? (
  <SkeletonText lines={8} />
 ) : usuarios.length === 0 ? (
  <EmptyState
   icon={<span className="material-icons text-3xl">person_off</span>}
   title="Sin usuarios"
   description="No se encontraron usuarios con los filtros actuales. Cree uno con el botón superior."
   action={<Button variant="primary" onClick={abrirCrear}>Crear usuario</Button>}
  />
 ) : (
  <DataTable<Usuario>
   columns={columns}
   data={usuarios}
   rowKey={(u) => u.id}
   ariaLabel="Lista de usuarios"
   caption="Usuarios del sistema"
  />
 )}

 {totalPages > 1 && !cargando && usuarios.length > 0 ? (
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
  title={editando ? 'Editar Usuario' : 'Nuevo Usuario'}
  size="lg"
 >
  <div className="space-y-3">
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Select
     label="Tipo de documento"
     value={form.tipo_documento}
     onChange={e => setForm({...form, tipo_documento: e.target.value})}
     options={[
      { value: 'CC', label: 'Cédula de Ciudadanía' },
      { value: 'CE', label: 'Cédula de Extranjería' },
      { value: 'TI', label: 'Tarjeta de Identidad' },
      { value: 'PA', label: 'Pasaporte' },
     ]}
    />
    <Input
     label="Documento"
     type="text"
     required
     value={form.documento}
     onChange={e => setForm({...form, documento: e.target.value})}
     disabled={!!editando}
     helperText={editando ? 'El documento no se puede modificar' : undefined}
    />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <Input label="Nombres" type="text" required value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} />
    <Input label="Apellidos" type="text" required value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
    <Select
     label="Género"
     value={form.genero}
     onChange={e => setForm({...form, genero: e.target.value})}
     placeholder="Sin especificar"
     options={[
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
      { value: 'O', label: 'Otro' },
     ]}
    />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
    <Input label="Municipio" type="text" value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value})} placeholder="Ej: Carepa" />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Input label="Teléfono principal" type="tel" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
    <Input label="Teléfono secundario" type="tel" value={form.telefono_secundario} onChange={e => setForm({...form, telefono_secundario: e.target.value})} />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
     <Input
      label="Cargo"
      type="text"
      list="cargos-list"
      value={form.cargo}
      onChange={e => setForm({...form, cargo: e.target.value})}
      placeholder="Ej: Jefe de Dependencia"
     />
     <datalist id="cargos-list">
      {CARGOS_SUGERIDOS.map(c => <option key={c} value={c} />)}
     </datalist>
    </div>
    <Input label="Denominación empleo" type="text" value={form.denominacion_empleo} onChange={e => setForm({...form, denominacion_empleo: e.target.value})} placeholder="Nombre del empleo" />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <Input label="Código empleo" type="text" value={form.codigo_empleo} onChange={e => setForm({...form, codigo_empleo: e.target.value})} />
    <Input label="Grado" type="text" value={form.grado} onChange={e => setForm({...form, grado: e.target.value})} />
    <Select
     label="Tipo vinculación"
     value={form.tipo_vinculacion}
     onChange={e => setForm({...form, tipo_vinculacion: e.target.value})}
     options={[
      { value: 'planta', label: 'Planta' },
      { value: 'contrato', label: 'Contrato' },
      { value: 'provisional', label: 'Provisional' },
      { value: 'encargo', label: 'Encargo' },
      { value: 'comision', label: 'Comisión' },
     ]}
    />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <Select
     label="Nivel carrera"
     value={form.nivel_carrera}
     onChange={e => setForm({...form, nivel_carrera: e.target.value})}
     placeholder="Sin especificar"
     options={[
      { value: 'operativo', label: 'Operativo' },
      { value: 'tecnico', label: 'Técnico' },
      { value: 'profesional', label: 'Profesional' },
      { value: 'directivo', label: 'Directivo' },
      { value: 'asesor', label: 'Asesor' },
     ]}
    />
    <Select
     label="Naturaleza"
     value={form.naturaleza}
     onChange={e => setForm({...form, naturaleza: e.target.value})}
     placeholder="Sin especificar"
     options={[
      { value: 'carrera', label: 'Carrera' },
      { value: 'libre_nombramiento', label: 'Libre nombramiento' },
      { value: 'provisional', label: 'Provisional' },
      { value: 'temporal', label: 'Temporal' },
      { value: 'contrato_obras', label: 'Contrato obra' },
     ]}
    />
    <Select
     label="Tipo nombramiento"
     value={form.tipo_nombramiento}
     onChange={e => setForm({...form, tipo_nombramiento: e.target.value})}
     placeholder="Sin especificar"
     options={[
      { value: 'propiedad', label: 'Propiedad' },
      { value: 'periodo_prueba', label: 'Periodo de prueba' },
      { value: 'encargo', label: 'Encargo' },
      { value: 'comision', label: 'Comisión' },
      { value: 'interinamente', label: 'Interinamente' },
     ]}
    />
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <label className="flex items-center gap-2 mt-5 cursor-pointer">
     <input
      type="checkbox"
      checked={!!form.es_contratista}
      onChange={e => setForm({...form, es_contratista: e.target.checked ? 1 : 0})}
      className="w-4 h-4 rounded border-inst-borde text-inst-azul-osc focus:ring-inst-azul-osc"
     />
     <span className="text-sm text-inst-texto">Es contratista</span>
    </label>
    <label className="flex items-center gap-2 mt-5 cursor-pointer">
     <input
      type="checkbox"
      checked={!!form.periodo_prueba}
      onChange={e => setForm({...form, periodo_prueba: e.target.checked ? 1 : 0})}
      className="w-4 h-4 rounded border-inst-borde text-inst-azul-osc focus:ring-inst-azul-osc"
     />
     <span className="text-sm text-inst-texto">En periodo de prueba</span>
    </label>
   </div>
   <Input
    label="Propósito del empleo"
    type="text"
    value={form.proposito_empleo}
    onChange={e => setForm({...form, proposito_empleo: e.target.value})}
    placeholder="Propósito principal del empleo"
   />
   <Input
    label={`Contraseña${editando ? ' (dejar vacío para no cambiar)' : ''}`}
    type="password"
    value={form.password}
    onChange={e => setForm({...form, password: e.target.value})}
   />
   <div>
    <label className="block text-sm font-medium text-inst-texto mb-2">Roles</label>
    <p className="text-xs text-inst-texto-claro mb-2">Solo 3 roles: Admin, Evaluador, Evaluado. El cargo define la posición del funcionario.</p>
    <div className="flex gap-2 flex-wrap">
     {ROLES_SISTEMA.map(r => {
      const active = form.roles.includes(r.codigo);
      const tones: Record<string, 'danger' | 'success' | 'info'> = { admin: 'danger', evaluador: 'success', evaluado: 'info' };
      return (
       <button
        key={r.codigo}
        type="button"
        onClick={() => toggleRol(r.codigo)}
        aria-pressed={active}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition ${
         active
          ? `${r.codigo === 'admin' ? 'bg-red-50 text-red-800 border-red-300' : r.codigo === 'evaluador' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-blue-50 text-blue-800 border-blue-300'}`
          : 'bg-inst-gris text-inst-texto-claro border-inst-borde hover:border-inst-azul-osc'
        }`}
       >
        {r.nombre}
       </button>
      );
     })}
    </div>
   </div>
   <Select
    label="Estado"
    value={form.estado}
    onChange={e => setForm({...form, estado: e.target.value})}
    options={[
     { value: 'activo', label: 'Activo' },
     { value: 'inactivo', label: 'Inactivo' },
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
