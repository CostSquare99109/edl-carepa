import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, PaginatedData } from '../../lib/api';

interface Usuario {
 id: number;
 documento: string;
 tipo_documento: string;
 nombres: string;
 apellidos: string;
 email: string;
 cargo: string;
 estado: string;
 roles: { codigo: string; nombre: string }[];
}

const ROLES_SISTEMA = [
	{ codigo: 'admin', nombre: 'Administrador' },
	{ codigo: 'jefe_personal', nombre: 'Jefe de Personal' },
	{ codigo: 'evaluador', nombre: 'Evaluador' },
	{ codigo: 'evaluado', nombre: 'Evaluado' },
	{ codigo: 'cargador', nombre: 'Cargador' },
	{ codigo: 'comision_evaluadora', nombre: 'Comision Evaluadora' },
];

const ROLE_COLORS: Record<string, string> = {
	admin: 'bg-red-100 text-red-800 border-red-200',
	jefe_personal: 'bg-purple-100 text-purple-800 border-purple-200',
	evaluador: 'bg-green-100 text-green-800 border-green-200',
	evaluado: 'bg-blue-100 text-blue-800 border-blue-200',
	cargador: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	comision_evaluadora: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const ROLE_SHORT: Record<string, string> = {
	admin: 'Admin',
	jefe_personal: 'Jefe',
	evaluador: 'Eval.',
	evaluado: 'Evaldo.',
	cargador: 'Carg.',
	comision_evaluadora: 'Comision',
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
 email: '', cargo: '', password: '', estado: 'activo',
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
 } catch (e: any) { setError(e.message); }
 setCargando(false);
 }, [pagina, busqueda, filtroRol]);

 useEffect(() => { cargar(); }, [cargar]);

 const abrirCrear = () => {
 setEditando(null);
 setForm({ documento: '', tipo_documento: 'CC', nombres: '', apellidos: '', email: '', cargo: '', password: '', estado: 'activo', roles: ['evaluado'] });
 setModalAbierto(true);
 };

 const abrirEditar = (u: Usuario) => {
 setEditando(u);
 setForm({
 documento: u.documento, tipo_documento: u.tipo_documento || 'CC',
 nombres: u.nombres, apellidos: u.apellidos, email: u.email || '',
 cargo: u.cargo || '', password: '', estado: u.estado || 'activo',
 roles: u.roles?.map(r => r.codigo) || ['evaluado'],
 });
 setModalAbierto(true);
 };

 const guardar = async () => {
 setGuardando(true);
 try {
 if (editando) {
 const payload: any = { ...form };
 if (!form.password) delete payload.password;
 await api.put(`/usuarios/${editando.id}`, payload);
 } else {
 await api.post('/usuarios', form);
 }
 setModalAbierto(false); cargar();
 } catch (e: any) { alert(e.message); }
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
 try { await api.put(`/usuarios/${u.id}`, { estado: nuevo }); cargar(); }
 catch (e: any) { alert(e.message); }
 };

 const totalPages = Math.ceil(total / 20);

 return (
 <div className="space-y-4 p-4 lg:p-6">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-users mr-2" />Usuarios</h2>
 <button onClick={abrirCrear} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 flex items-center gap-1">
 <span className="material-icons text-base">person_add</span> Nuevo Usuario
 </button>
 </div>

 {/* Filtros */}
 <div className="flex gap-2 flex-wrap items-center">
 <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
 placeholder="Buscar por nombre o documento..." className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
 <select value={filtroRol} onChange={e => { setFiltroRol(e.target.value); setPagina(1); }}
 className="border rounded-lg px-3 py-2 text-sm">
 <option value="">Todos los roles</option>
 {ROLES_SISTEMA.map(r => <option key={r.codigo} value={r.codigo}>{r.nombre}</option>)}
 </select>
 </div>

 {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

 {cargando ? (
 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
 ) : (
 <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
 <table className="w-full text-sm">
 <thead><tr className="border-b bg-inst-gris">
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Documento</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Nombre</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Email</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Cargo</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Rol</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Estado</th>
 <th className="text-center px-4 py-3 font-semibold text-inst-texto-claro">Acciones</th>
 </tr></thead>
 <tbody>
 {usuarios.map(u => (
 <tr key={u.id} className="border-b hover:bg-inst-gris/50 transition">
 <td className="px-4 py-3 font-mono text-xs">{u.documento}</td>
 <td className="px-4 py-3">{u.nombres} {u.apellidos}</td>
 <td className="px-4 py-3 text-inst-texto-claro">{u.email || '—'}</td>
 <td className="px-4 py-3 text-inst-texto-claro">{u.cargo || '—'}</td>
				<td className="px-4 py-3">
					<div className="flex gap-1 flex-wrap">
						{(u.roles || []).map(r => (
							<span key={r.codigo} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_COLORS[r.codigo] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
								{ROLE_SHORT[r.codigo] || r.nombre || r.codigo}
							</span>
						))}
						{(!u.roles || u.roles.length === 0) && (
							<span className="text-xs text-gray-400">Sin rol</span>
						)}
					</div>
				</td>
 <td className="px-4 py-3">
 <button onClick={() => toggleEstado(u)}
 className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
 {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
 </button>
 </td>
 <td className="px-4 py-3 text-center">
 <button onClick={() => abrirEditar(u)}
 className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#003366] text-white hover:opacity-90 transition"
 title="Editar usuario">
 <span className="material-icons text-sm">edit</span> Editar
 </button>
 </td>
 </tr>
 ))}
 {usuarios.length === 0 && (
 <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No se encontraron usuarios</td></tr>
 )}
 </tbody>
 </table>

 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 p-3 border-t">
 {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
 <button key={p} onClick={() => setPagina(p)}
 className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-[#003366] text-white' : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Modal Crear/Editar */}
 {modalAbierto && (
 <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAbierto(false)}>
 <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
 <div className="px-6 py-4 border-b flex items-center justify-between">
 <h3 className="font-bold text-[#003366]">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
 <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600"><span className="material-icons">close</span></button>
 </div>
 <div className="px-6 py-4 space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Tipo Documento</label>
 <select value={form.tipo_documento} onChange={e => setForm({...form, tipo_documento: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value="CC">Cédula de Ciudadanía</option>
 <option value="CE">Cédula de Extranjería</option>
 <option value="TI">Tarjeta de Identidad</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Documento</label>
 <input value={form.documento} onChange={e => setForm({...form, documento: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" disabled={!!editando} />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombres</label>
 <input value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Apellidos</label>
 <input value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Email</label>
 <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Cargo</label>
 <input list="cargos-list" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Jefe de Dependencia" />
 <datalist id="cargos-list">
 {CARGOS_SUGERIDOS.map(c => <option key={c} value={c} />)}
 </datalist>
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Contraseña {editando ? '(dejar vacío para no cambiar)' : ''}</label>
 <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
				<div>
					<label className="block text-xs font-medium text-inst-texto-claro mb-2">Roles</label>
					<p className="text-[10px] text-inst-texto-claro mb-2">Solo 3 roles: Admin, Evaluador, Evaluado. El cargo define la posición del funcionario.</p>
					<div className="flex gap-2 flex-wrap">
						{ROLES_SISTEMA.map(r => (
							<button key={r.codigo} type="button" onClick={() => toggleRol(r.codigo)}
								className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition ${
									form.roles.includes(r.codigo)
										? `${ROLE_COLORS[r.codigo]} border-current`
										: 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400'
								}`}>
								{r.nombre}
							</button>
						))}
					</div>
				</div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
 <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value="activo">Activo</option>
 <option value="inactivo">Inactivo</option>
 </select>
 </div>
 </div>
 <div className="px-6 py-4 border-t flex justify-end gap-2">
 <button onClick={() => setModalAbierto(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Cancelar</button>
 <button onClick={guardar} disabled={guardando}
 className="px-4 py-2 rounded-lg text-sm bg-[#003366] text-white hover:opacity-90 disabled:opacity-50">
 {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
