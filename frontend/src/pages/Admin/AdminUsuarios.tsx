import { useState, useEffect, useCallback } from 'react';
import { api, PaginatedData } from '../../lib/api';

/* ─── Tipos ─── */
interface Usuario {
  id: number;
  documento: string;
  tipo_documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  estado: string;
  cargo: string | null;
  entidad_id: number | null;
  dependencia_id: number | null;
  roles: { id: number; codigo: string; nombre: string }[];
}

interface RolOption { id: number; codigo: string; nombre: string }

const ESTADO_BADGE: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  inactivo: 'bg-gray-100 text-gray-800',
  bloqueado: 'bg-red-100 text-red-800',
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(15);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ documento:'', tipo_documento:'CC', nombres:'', apellidos:'', email:'', password:'', telefono:'', estado:'activo', cargo:'', roles: [] as string[] });

  // Roles disponibles
  const [rolesDisp, setRolesDisp] = useState<RolOption[]>([]);

  const cargarRoles = useCallback(() => {
    api.get<RolOption[]>('/auth/roles').then(setRolesDisp).catch(() => {});
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const params = new URLSearchParams({ pagina: String(pagina), por_pagina: String(porPagina) });
      if (busqueda) params.set('busqueda', busqueda);
      const res = await api.get<PaginatedData<Usuario>>(`/usuarios?${params}`);
      setUsuarios(res.data || []);
      setTotal(res.total);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, [pagina, porPagina, busqueda]);

  useEffect(() => { cargarRoles(); }, [cargarRoles]);
  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditId(null);
    setForm({ documento:'', tipo_documento:'CC', nombres:'', apellidos:'', email:'', password:'', telefono:'', estado:'activo', cargo:'', roles:[] });
    setModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditId(u.id);
    setForm({
      documento: u.documento, tipo_documento: u.tipo_documento,
      nombres: u.nombres, apellidos: u.apellidos, email: u.email,
      password: '', telefono: u.telefono || '', estado: u.estado,
      cargo: u.cargo || '', roles: u.roles?.map(r => r.codigo) || [],
    });
    setModal(true);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const body: any = { ...form };
      if (!body.password) delete body.password;
      if (editId) {
        await api.put(`/usuarios/${editId}`, body);
      } else {
        if (!body.password) { alert('La contraseña es requerida para nuevos usuarios'); setGuardando(false); return; }
        await api.post('/usuarios', body);
      }
      setModal(false);
      cargar();
    } catch (e: any) { alert(e.message); }
    setGuardando(false);
  };

  const toggleEstado = async (u: Usuario) => {
    const nuevo = u.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await api.put(`/usuarios/${u.id}`, { estado: nuevo });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  const totalPages = Math.ceil(total / porPagina);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-users mr-2" />Gestión de Usuarios</h2>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            className="border rounded-lg px-3 py-2 text-sm w-48 focus:ring-2 focus:ring-[#003366] focus:outline-none" />
          <button onClick={abrirCrear} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            <i className="fas fa-plus mr-1" />Nuevo
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {/* Tabla */}
      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-400">No hay usuarios registrados</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cargo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Roles</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{u.tipo_documento}-{u.documento}</td>
                  <td className="px-4 py-3 font-medium">{u.nombres} {u.apellidos}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.cargo || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{r.nombre}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[u.estado] || 'bg-gray-100 text-gray-800'}`}>{u.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrirEditar(u)} className="text-blue-600 hover:text-blue-800" title="Editar"><i className="fas fa-edit" /></button>
                      <button onClick={() => toggleEstado(u)} className={u.estado === 'activo' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} title={u.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                        <i className={`fas ${u.estado === 'activo' ? 'fa-ban' : 'fa-check'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">{total} usuario(s)</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
                  <button key={p} onClick={() => setPagina(p)}
                    className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-[#003366] text-white' : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal CRUD */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b"><h3 className="text-lg font-bold text-[#003366]">{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3></div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Tipo Doc.</label><select value={form.tipo_documento} onChange={e => setForm({...form, tipo_documento: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"><option>CC</option><option>CE</option><option>TI</option><option>PA</option><option>NIT</option></select></div>
                <div><label className="text-xs text-gray-500">Documento</label><input value={form.documento} onChange={e => setForm({...form, documento: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm" disabled={!!editId} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Nombres</label><input value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Apellidos</label><input value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-xs text-gray-500">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              {!editId && <div><label className="text-xs text-gray-500">Contraseña</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Estado</label><select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>activo</option><option>inactivo</option><option>bloqueado</option></select></div>
              </div>
              <div><label className="text-xs text-gray-500">Cargo</label><input value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {rolesDisp.map(r => (
                    <label key={r.id} className="inline-flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={form.roles.includes(r.codigo)} onChange={e => {
                        const roles = e.target.checked ? [...form.roles, r.codigo] : form.roles.filter(c => c !== r.codigo);
                        setForm({...form, roles});
                      }} className="rounded" />{r.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
