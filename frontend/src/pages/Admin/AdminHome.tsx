import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

/* ─────────────────────────────────────────────
 Tipos
 ───────────────────────────────────────────── */
interface AdminStats {
  evaluados_activos: number;
  evaluadores_registrados: number;
  evaluaciones_completadas: number;
  evaluaciones_pendientes: number;
  progreso_dependencia: { nombre: string; porcentaje: number; total: number; completadas: number }[];
  periodo_activo: { id: number; nombre: string; fecha_inicio: string; fecha_fin: string; estado: string } | null;
  evaluaciones_recientes: { id: number; tipo: string; estado: string; puntaje: string | null; fecha_evaluacion: string | null; evaluado: string; evaluador: string }[];
  entidades_activas: number;
}

interface SmallBox { label: string; value: number; icon: string; color: string; link: string }

const TIPO_LABEL: Record<string, string> = { autoevaluacion: 'Autoevaluación', coevaluacion: 'Coevaluación', heteroevaluacion: 'Heteroevaluación' };
const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  calificada: 'bg-green-100 text-green-800',
  revisada: 'bg-indigo-100 text-indigo-800',
  cerrada: 'bg-gray-100 text-gray-800',
};

export default function AdminHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminStats>('/dashboard/admin-stats')
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>;
  if (!stats) return <div className="text-gray-500 text-center py-10">No hay datos disponibles</div>;

  const boxes: SmallBox[] = [
    { label: 'Evaluados Activos', value: stats.evaluados_activos, icon: 'fa-users', color: 'bg-[#003366]', link: '/admin/usuarios' },
    { label: 'Evaluadores', value: stats.evaluadores_registrados, icon: 'fa-user-tie', color: 'bg-[#1E5A3C]', link: '/admin/evaluaciones' },
    { label: 'Evaluaciones Completadas', value: stats.evaluaciones_completadas, icon: 'fa-check-circle', color: 'bg-[#28a745]', link: '/admin/evaluaciones' },
    { label: 'Evaluaciones Pendientes', value: stats.evaluaciones_pendientes, icon: 'fa-clock', color: 'bg-[#C4282B]', link: '/admin/evaluaciones' },
  ];

  return (
    <div className="space-y-6">
      {/* Small-boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {boxes.map((b, i) => (
          <a key={i} href={b.link} className="block group">
            <div className={`${b.color} rounded-lg shadow-md p-5 text-white transition-transform group-hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{b.label}</p>
                  <p className="text-3xl font-bold mt-1">{b.value.toLocaleString('es-CO')}</p>
                </div>
                <i className={`fas ${b.icon} text-4xl opacity-30`} />
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progreso por dependencia */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-5">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">
            <i className="fas fa-chart-bar mr-2" />Progreso por Dependencia
          </h3>
          {stats.progreso_dependencia.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay dependencias registradas</p>
          ) : (
            <div className="space-y-3">
              {stats.progreso_dependencia.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">{d.nombre}</span>
                    <span className="text-gray-500">{d.completadas}/{d.total} ({d.porcentaje}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-[#003366] transition-all duration-500"
                      style={{ width: `${d.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Periodo activo */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">
            <i className="fas fa-calendar-alt mr-2" />Periodo Activo
          </h3>
          {stats.periodo_activo ? (
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Nombre:</span> <span className="font-semibold">{stats.periodo_activo.nombre}</span></div>
              <div><span className="text-gray-500">Estado:</span> <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{stats.periodo_activo.estado.replace(/_/g,' ')}</span></div>
              <div><span className="text-gray-500">Inicio:</span> {stats.periodo_activo.fecha_inicio}</div>
              <div><span className="text-gray-500">Fin:</span> {stats.periodo_activo.fecha_fin}</div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500">Entidades activas</span>
                  <span className="font-bold text-[#003366]">{stats.entidades_activas}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No hay periodo activo</p>
          )}
        </div>
      </div>

      {/* Evaluaciones recientes */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="text-lg font-semibold text-[#003366] mb-4">
          <i className="fas fa-list-alt mr-2" />Evaluaciones Recientes
        </h3>
        {stats.evaluaciones_recientes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay evaluaciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
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
                {stats.evaluaciones_recientes.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{e.id}</td>
                    <td className="px-4 py-3">{e.evaluado}</td>
                    <td className="px-4 py-3">{e.evaluador}</td>
                    <td className="px-4 py-3">{TIPO_LABEL[e.tipo] || e.tipo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[e.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {e.estado.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{e.puntaje ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{e.fecha_evaluacion ? new Date(e.fecha_evaluacion).toLocaleDateString('es-CO') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
