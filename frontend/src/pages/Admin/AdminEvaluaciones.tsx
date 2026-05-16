import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, PaginatedData } from '../../lib/api';

interface Evaluacion {
  id: number;
  evaluado: string;
  evaluador: string;
  tipo: string;
  estado: string;
  periodo: string;
  fecha: string;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-100 text-gray-600',
};

export default function AdminEvaluaciones() {
  const [searchParams] = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || '';
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(filtroInicial);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      let url = `/evaluaciones?pagina=${pagina}&por_pagina=20`;
      if (busqueda) url += `&buscar=${encodeURIComponent(busqueda)}`;
      if (filtroEstado) url += `&estado=${encodeURIComponent(filtroEstado)}`;
      if (filtroTipo) url += `&tipo=${encodeURIComponent(filtroTipo)}`;
      const res = await api.get<PaginatedData<Evaluacion>>(url);
      setEvaluaciones(res.data || res.items || []);
      setTotal(res.total || 0);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, [pagina, busqueda, filtroEstado, filtroTipo]);

  useEffect(() => { cargar(); }, [cargar]);

  const stats = {
    total: total,
    pendientes: evaluaciones.filter(e => e.estado === 'pendiente').length,
    enProgreso: evaluaciones.filter(e => e.estado === 'en_progreso').length,
    completadas: evaluaciones.filter(e => e.estado === 'completada').length,
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-clipboard-check mr-2" />Evaluaciones</h2>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-[#003366]">
          <p className="text-2xl font-bold text-[#003366]">{stats.total}</p>
          <p className="text-xs text-inst-texto-claro">Total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-amber-500">
          <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
          <p className="text-xs text-inst-texto-claro">Pendientes</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{stats.enProgreso}</p>
          <p className="text-xs text-inst-texto-claro">En Progreso</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.completadas}</p>
          <p className="text-xs text-inst-texto-claro">Completadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          placeholder="Buscar evaluado..." className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los tipos</option>
          <option value="anual">Anual</option>
          <option value="periodica">Periódica</option>
          <option value="especial">Especial</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-inst-gris">
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Evaluado</th>
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Evaluador</th>
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Periodo</th>
              <th className="text-left px-4 py-3 font-semibold text-inst-texto-claro">Fecha</th>
            </tr></thead>
            <tbody>
              {evaluaciones.map(ev => (
                <tr key={ev.id} className="border-b hover:bg-inst-gris/50 transition">
                  <td className="px-4 py-3">{ev.evaluado || '—'}</td>
                  <td className="px-4 py-3 text-inst-texto-claro">{ev.evaluador || '—'}</td>
                  <td className="px-4 py-3 capitalize">{ev.tipo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[ev.estado] || 'bg-gray-100 text-gray-700'}`}>
                      {ev.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">{ev.periodo || '—'}</td>
                  <td className="px-4 py-3 text-inst-texto-claro">{ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-CO') : '—'}</td>
                </tr>
              ))}
              {evaluaciones.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No se encontraron evaluaciones</td></tr>
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
    </div>
  );
}
