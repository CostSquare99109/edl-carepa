import { useState, useEffect, useCallback } from 'react';
import { api, PaginatedData } from '../../lib/api';

interface Evaluacion {
  id: number;
  periodo_id: number;
  evaluado_id: number;
  evaluador_id: number;
  tipo: string;
  puntaje: string | null;
  estado: string;
  fecha_evaluacion: string | null;
  observaciones: string | null;
  evaluado?: string;
  evaluador?: string;
}

const TIPO_LABEL: Record<string, string> = { autoevaluacion: 'Autoevaluación', coevaluacion: 'Coevaluación', heteroevaluacion: 'Heteroevaluación' };
const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800', en_proceso: 'bg-blue-100 text-blue-800',
  calificada: 'bg-green-100 text-green-800', revisada: 'bg-indigo-100 text-indigo-800', cerrada: 'bg-gray-100 text-gray-800',
};

export default function AdminEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(15);
  const [filtros, setFiltros] = useState({ tipo: '', estado: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Stats rápidos
  const [stats, setStats] = useState<{ completadas: number; pendientes: number; en_proceso: number; total: number } | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const params = new URLSearchParams({ pagina: String(pagina), por_pagina: String(porPagina) });
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      if (filtros.estado) params.set('estado', filtros.estado);
      const res = await api.get<PaginatedData<Evaluacion>>(`/evaluaciones?${params}`);
      setEvaluaciones(res.data || []); setTotal(res.total);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, [pagina, porPagina, filtros]);

  const cargarStats = useCallback(async () => {
    try {
      const s = await api.get<any>('/dashboard/admin-stats');
      setStats({ completadas: s.evaluaciones_completadas, pendientes: s.evaluaciones_pendientes, en_proceso: 0, total: s.evaluaciones_completadas + s.evaluaciones_pendientes });
    } catch {}
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarStats(); }, [cargarStats]);

  const totalPages = Math.ceil(total / porPagina);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#003366]"><i className="fas fa-file-alt mr-2" />Gestión de Evaluaciones</h2>

      {/* Stats rápidos */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.completadas}</p><p className="text-xs text-green-600">Completadas</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pendientes}</p><p className="text-xs text-yellow-600">Pendientes</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p><p className="text-xs text-blue-600">Total</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={filtros.tipo} onChange={e => { setFiltros({...filtros, tipo: e.target.value}); setPagina(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:outline-none">
          <option value="">Todos los tipos</option>
          <option value="autoevaluacion">Autoevaluación</option>
          <option value="coevaluacion">Coevaluación</option>
          <option value="heteroevaluacion">Heteroevaluación</option>
        </select>
        <select value={filtros.estado} onChange={e => { setFiltros({...filtros, estado: e.target.value}); setPagina(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#003366] focus:outline-none">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="calificada">Calificada</option>
          <option value="revisada">Revisada</option>
          <option value="cerrada">Cerrada</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {/* Tabla */}
      {cargando ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]" /></div>
      ) : evaluaciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-400">No hay evaluaciones registradas</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Evaluado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Evaluador</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Puntaje</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evaluaciones.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{e.id}</td>
                  <td className="px-4 py-3">{e.evaluado || `#${e.evaluado_id}`}</td>
                  <td className="px-4 py-3">{e.evaluador || `#${e.evaluador_id}`}</td>
                  <td className="px-4 py-3">{TIPO_LABEL[e.tipo] || e.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[e.estado] || 'bg-gray-100'}`}>{e.estado.replace(/_/g,' ')}</span>
                  </td>
                  <td className="px-4 py-3">{e.puntaje ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.fecha_evaluacion ? new Date(e.fecha_evaluacion).toLocaleDateString('es-CO') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">{total} evaluación(es)</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
                  <button key={p} onClick={() => setPagina(p)} className={`px-3 py-1 rounded text-sm ${p === pagina ? 'bg-[#003366] text-white' : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
