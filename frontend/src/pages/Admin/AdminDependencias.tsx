import { useState, useEffect, useCallback } from 'react';
import { api, PaginatedData } from '../../lib/api';

interface Dependencia {
  id: number;
  entidad_id: number;
  codigo: string;
  nombre: string;
  jefe_id: number | null;
  estado: string;
}

const ESTADO_BADGE: Record<string, string> = { activa: 'bg-green-100 text-green-800', inactiva: 'bg-gray-100 text-gray-800' };

export default function AdminDependencias() {
  const [deps, setDeps] = useState<Dependencia[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(15);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ codigo: '', nombre: '', entidad_id: '', estado: 'activa' });

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const params = new URLSearchParams({ pagina: String(pagina), por_pagina: String(porPagina) });
      if (busqueda) params.set('busqueda', busqueda);
      const res = await api.get<PaginatedData<Dependencia>>(`/dependencias?${params}`);
      setDeps(res.data || []); setTotal(res.total);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, [pagina, porPagina, busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setEditId(null); setForm({ codigo:'', nombre:'', entidad_id:'', estado:'activa' }); setModal(true); };
  const abrirEditar = (d: Dependencia) => { setEditId(d.id); setForm({ codigo: d.codigo, nombre: d.nombre, entidad_id: String(d.entidad_id || ''), estado: d.estado }); setModal(true); };

  const guardar = async () => {
    setGuardando(true);
    try {
      const body = { ...form, entidad_id: form.entidad_id ? Number(form.entidad_id) : null };
      if (editId) await api.put(`/dependencias/${editId}`, body);
      else await api.post('/dependencias', body);
      setModal(false); cargar();
    } catch (e: any) { alert(e.message); }
    setGuardando(false);
  };

  const toggleEstado = async (d: Dependencia) => {
    try { await api.put(`/dependencias/${d.id}`, { estado: d.estado === 'activa' ? 'inactiva' : 'activa' }); cargar(); }
    catch (e: any) { alert(e.message); }
  };

  const totalPages = Math.ceil(total / porPagina);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-sitemap mr-2" />Gestión de Dependencias</h2>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            className="border rounded-lg px-3 py-2 text-sm w-48 focus:ring-2 focus:ring-[#003366] focus:outline-none" />
          <button onClick={abrirCrear} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"><i className="fas fa-plus mr-1" />Nueva</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
      ) : deps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-400">No hay dependencias registradas</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Código</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Entidad</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deps.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{d.codigo}</td>
                  <td className="px-4 py-3 font-medium">{d.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">#{d.entidad_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[d.estado] || 'bg-gray-100'}`}>{d.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrirEditar(d)} className="text-blue-600 hover:text-blue-800" title="Editar"><i className="fas fa-edit" /></button>
                      <button onClick={() => toggleEstado(d)} className={d.estado === 'activa' ? 'text-yellow-600' : 'text-green-600'} title={d.estado === 'activa' ? 'Desactivar' : 'Activar'}>
                        <i className={`fas ${d.estado === 'activa' ? 'fa-ban' : 'fa-check'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">{total} dependencia(s)</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
                  <button key={p} onClick={() => setPagina(p)} className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-[#003366] text-white' : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b"><h3 className="text-lg font-bold text-[#003366]">{editId ? 'Editar Dependencia' : 'Nueva Dependencia'}</h3></div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs text-gray-500">Código</label><input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Nombre</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">ID Entidad</label><input type="number" value={form.entidad_id} onChange={e => setForm({...form, entidad_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Estado</label><select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>activa</option><option>inactiva</option></select></div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
