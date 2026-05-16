import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

interface Parametro {
  id: number;
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string | null;
}

export default function AdminConfiguracion() {
  const [params, setParams] = useState<Parametro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const res = await api.get<Parametro[]>('/parametros');
      setParams(res);
      // Inicializar valores editables
      const ed: Record<string, string> = {};
      res.forEach(p => { ed[p.clave] = p.valor; });
      setEditando(ed);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarParametro = async (clave: string) => {
    setGuardando(true);
    try {
      const p = params.find(x => x.clave === clave);
      await api.post('/parametros', { clave, valor: editando[clave], tipo: p?.tipo || 'texto', descripcion: p?.descripcion || null });
      cargar();
    } catch (e: any) { alert(e.message); }
    setGuardando(false);
  };

  const guardarTodos = async () => {
    setGuardando(true);
    try {
      const parametros = Object.entries(editando).map(([clave, valor]) => {
        const p = params.find(x => x.clave === clave);
        return { clave, valor, tipo: p?.tipo || 'texto', descripcion: p?.descripcion || null };
      });
      await api.put('/parametros/masivo', { parametros });
      cargar();
    } catch (e: any) { alert(e.message); }
    setGuardando(false);
  };

  // Nuevo parámetro
  const [nuevo, setNuevo] = useState({ clave: '', valor: '', tipo: 'texto', descripcion: '' });
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const crearParametro = async () => {
    if (!nuevo.clave || !nuevo.valor) { alert('Clave y valor son requeridos'); return; }
    setGuardando(true);
    try {
      await api.post('/parametros', nuevo);
      setNuevo({ clave: '', valor: '', tipo: 'texto', descripcion: '' });
      setMostrarNuevo(false);
      cargar();
    } catch (e: any) { alert(e.message); }
    setGuardando(false);
  };

  const eliminarParametro = async (id: number) => {
    if (!confirm('¿Eliminar este parámetro?')) return;
    try { await api.delete(`/parametros/${id}`); cargar(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-cogs mr-2" />Configuración del Sistema</h2>
        <div className="flex gap-2">
          <button onClick={() => setMostrarNuevo(true)} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"><i className="fas fa-plus mr-1" />Nuevo</button>
          <button onClick={guardarTodos} disabled={guardando} className="bg-[#1E5A3C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><i className="fas fa-save mr-1" />Guardar Todo</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
      ) : params.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-400">No hay parámetros configurados. Agregue el primero.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Clave</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Valor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Descripción</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {params.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{p.clave}</td>
                  <td className="px-4 py-3">
                    {p.tipo === 'booleano' ? (
                      <input type="checkbox" checked={editando[p.clave] === 'true'} onChange={e => setEditando({...editando, [p.clave]: e.target.checked ? 'true' : 'false'})} className="rounded" />
                    ) : p.tipo === 'numero' ? (
                      <input type="number" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="border rounded px-2 py-1 text-sm w-24" />
                    ) : (
                      <input type="text" value={editando[p.clave] || ''} onChange={e => setEditando({...editando, [p.clave]: e.target.value})} className="border rounded px-2 py-1 text-sm w-full max-w-xs" />
                    )}
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{p.tipo}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.descripcion || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => guardarParametro(p.clave)} disabled={guardando} className="text-green-600 hover:text-green-800" title="Guardar"><i className="fas fa-save" /></button>
                      <button onClick={() => eliminarParametro(p.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nuevo parámetro modal */}
      {mostrarNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setMostrarNuevo(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b"><h3 className="text-lg font-bold text-[#003366]">Nuevo Parámetro</h3></div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs text-gray-500">Clave</label><input value={nuevo.clave} onChange={e => setNuevo({...nuevo, clave: e.target.value})} placeholder="ej: app.nombre" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Valor</label><input value={nuevo.valor} onChange={e => setNuevo({...nuevo, valor: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Tipo</label><select value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>texto</option><option>numero</option><option>booleano</option><option>json</option></select></div>
              <div><label className="text-xs text-gray-500">Descripción</label><input value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => setMostrarNuevo(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={crearParametro} disabled={guardando} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">{guardando ? 'Guardando...' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
