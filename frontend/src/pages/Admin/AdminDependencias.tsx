import { useState, useEffect, useCallback } from 'react';
import { COLORES_TAILWIND } from '../../styles/colors';
import { api, PaginatedData } from '../../lib/api';

interface Dependencia {
 id: number;
 entidad_id: number;
 codigo: string;
 nombre: string;
 estado: string;
}

interface Entidad {
 id: number;
 nombre: string;
}

export default function AdminDependencias() {
 const [dependencias, setDependencias] = useState<Dependencia[]>([]);
 const [entidades, setEntidades] = useState<Entidad[]>([]);
 const [total, setTotal] = useState(0);
 const [pagina, setPagina] = useState(1);
 const [busqueda, setBusqueda] = useState('');
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState('');
 const [modalAbierto, setModalAbierto] = useState(false);
 const [editando, setEditando] = useState<Dependencia | null>(null);
 const [guardando, setGuardando] = useState(false);
 const [form, setForm] = useState({ entidad_id: 0, codigo: '', nombre: '', estado: 'activa' });

 const cargar = useCallback(async () => {
 setCargando(true); setError('');
 try {
 let url = `/dependencias?pagina=${pagina}&por_pagina=20`;
 if (busqueda) url += `&nombre=${encodeURIComponent(busqueda)}`;
 const res = await api.get<PaginatedData<Dependencia>>(url);
 const data = res.data || res.items || res;
 setDependencias(Array.isArray(data) ? data : []);
 setTotal(res.total || (Array.isArray(data) ? data.length : 0));
 } catch (e: any) {
 setError(e.message || 'No se pudo conectar con el servidor');
 }
 setCargando(false);
 }, [pagina, busqueda]);

 const cargarEntidades = useCallback(async () => {
 try {
 const res = await api.get<any>('/entidades?por_pagina=100');
 const data = res.data || res.items || res;
 setEntidades(Array.isArray(data) ? data : []);
 } catch { /* silencioso */ }
 }, []);

 useEffect(() => { cargar(); cargarEntidades(); }, [cargar, cargarEntidades]);

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
 if (!form.nombre.trim()) { alert('El nombre es obligatorio'); return; }
 setGuardando(true);
 try {
 if (editando) {
 await api.put(`/dependencias/${editando.id}`, form);
 } else {
 await api.post('/dependencias', form);
 }
 setModalAbierto(false); cargar();
 } catch (e: any) { alert(e.message); }
 setGuardando(false);
 };

 const toggleEstado = async (d: Dependencia) => {
 const nuevo = d.estado === 'activa' ? 'inactiva' : 'activa';
 try { await api.put(`/dependencias/${d.id}`, { estado: nuevo }); cargar(); }
 catch (e: any) { alert(e.message); }
 };

 const totalPages = Math.ceil(total / 20);

 return (
 <div className="space-y-4 p-4 lg:p-6">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <h2 className={`text-xl font-bold ${COLORES_TAILWIND.azulClaroText}`}><i className="fas fa-sitemap mr-2" />Dependencias</h2>
 <button onClick={abrirCrear} className={`${COLORES_TAILWIND.azulClaro} text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 flex items-center gap-1`}>
 <span className="material-icons text-base">add_business</span> Nueva Dependencia
 </button>
 </div>

 <div className="flex gap-2 flex-wrap items-center">
 <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
 placeholder="Buscar por nombre..." className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
 </div>

 {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
 <p className="font-medium">Error de conexion</p><p className="text-sm mt-1">{error}</p>
 <button onClick={cargar} className="text-xs underline mt-1">Reintentar</button>
 </div>}

 {cargando ? (
 <div className="flex justify-center py-20"><div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${COLORES_TAILWIND.azulClaroBorder}`} /></div>
 ) : (
 <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
 <table className="w-full text-sm">
 <thead><tr className="border-b bg-inst-gris">
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Codigo</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Nombre</th>
 <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Estado</th>
 <th className="text-center px-4 py-3 font-semibold text-inst-texto-claro">Acciones</th>
 </tr></thead>
 <tbody>
 {dependencias.map(d => (
 <tr key={d.id} className="border-b hover:bg-inst-gris/50 transition">
 <td className="px-4 py-3 font-mono text-xs">{d.codigo || '—'}</td>
 <td className="px-4 py-3">{d.nombre}</td>
 <td className="px-4 py-3">
 <button onClick={() => toggleEstado(d)}
 className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
 {d.estado === 'activa' ? 'Activa' : 'Inactiva'}
 </button>
 </td>
 <td className="px-4 py-3 text-center">
 <button onClick={() => abrirEditar(d)}
 className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${COLORES_TAILWIND.azulClaro} text-white hover:opacity-90 transition`}
 title="Editar dependencia">
 <span className="material-icons text-sm">edit</span> Editar
 </button>
 </td>
 </tr>
 ))}
 {dependencias.length === 0 && (
 <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No se encontraron dependencias</td></tr>
 )}
 </tbody>
 </table>

 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 p-3 border-t">
 {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
 <button key={p} onClick={() => setPagina(p)}
 className={`px-3 py-1 rounded text-sm ${p === pagina ? `${COLORES_TAILWIND.azulClaro} text-white` : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
 ))}
 </div>
 )}
 </div>
 )}

 {modalAbierto && (
 <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAbierto(false)}>
 <div className="bg-white rounded-xl shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
 <div className="px-6 py-4 border-b flex items-center justify-between">
 <h3 className={`font-bold ${COLORES_TAILWIND.azulClaroText}`}>{editando ? 'Editar Dependencia' : 'Nueva Dependencia'}</h3>
 <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600"><span className="material-icons">close</span></button>
 </div>
 <div className="px-6 py-4 space-y-3">
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Entidad</label>
 <select value={form.entidad_id} onChange={e => setForm({...form, entidad_id: Number(e.target.value)})}
 className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value={0}>Seleccione una entidad</option>
 {entidades.map(ent => <option key={ent.id} value={ent.id}>{ent.nombre}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Codigo</label>
 <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: DEP-001" />
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Nombre</label>
 <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nombre de la dependencia" />
 </div>
 <div>
 <label className="block text-xs font-medium text-inst-texto-claro mb-1">Estado</label>
 <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}
 className="w-full border rounded-lg px-3 py-2 text-sm">
 <option value="activa">Activa</option>
 <option value="inactiva">Inactiva</option>
 </select>
 </div>
 </div>
 <div className="px-6 py-4 border-t flex justify-end gap-2">
 <button onClick={() => setModalAbierto(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Cancelar</button>
 <button onClick={guardar} disabled={guardando}
 className={`px-4 py-2 rounded-lg text-sm ${COLORES_TAILWIND.azulClaro} text-white hover:opacity-90 disabled:opacity-50`}>
 {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
