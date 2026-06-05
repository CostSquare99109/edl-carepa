import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORES, COLORES_TAILWIND } from '../../styles/colors';
import { api } from '../../lib/api';

interface Stats {
  evaluados_activos: number;
  evaluadores_registrados: number;
  evaluaciones_completadas: number;
  evaluaciones_pendientes: number;
  periodo_activo: { id: number; nombre: string } | null;
  progreso_dependencias: { dependencia: string; progreso: number }[];
  evaluaciones_recientes: { id: number; evaluado: string; tipo: string; estado: string; fecha: string }[];
  entidades_activas: number;
}

const ROLE_MAP: Record<string, string> = {
  admin: 'Admin',
  evaluador: 'Evaluador',
  evaluado: 'Evaluado',
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const res = await api.get<Stats>('/dashboard/admin-stats');
      setStats(res);
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) return (
    <div className="flex justify-center py-20"><div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${COLORES_TAILWIND.azulClaroBorder}`} /></div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg m-4">
      <p className="font-medium">Error al cargar estadísticas</p><p className="text-sm mt-1">{error}</p>
    </div>
  );

  const smallBoxes = [
    { label: 'Evaluados Activos', value: stats?.evaluados_activos ?? 0, icon: 'person', color: 'bg-blue-600', filter: 'evaluado', route: '/admin/usuarios' },
    { label: 'Evaluadores', value: stats?.evaluadores_registrados ?? 0, icon: 'rate_review', color: 'bg-green-600', filter: 'evaluador', route: '/admin/usuarios' },
    { label: 'Evaluaciones Completadas', value: stats?.evaluaciones_completadas ?? 0, icon: 'task_alt', color: COLORES_TAILWIND.verde, filter: 'completada', route: '/admin/evaluaciones' },
    { label: 'Evaluaciones Pendientes', value: stats?.evaluaciones_pendientes ?? 0, icon: 'pending', color: COLORES_TAILWIND.rojo, filter: 'pendiente', route: '/admin/evaluaciones' },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <h2 className={`text-xl font-bold ${COLORES_TAILWIND.azulClaroText}`}><i className="fas fa-tachometer-alt mr-2" />Tablero de Control</h2>

      {/* Periodo activo */}
      {stats?.periodo_activo && (
        <div className={`bg-white rounded-lg shadow-sm border-l-4 ${COLORES_TAILWIND.azulClaroBorder} px-4 py-3`}>
        <span className={`material-icons text-sm align-middle mr-1 ${COLORES_TAILWIND.azulClaroText}`}>event</span>
        <span className={`text-sm font-medium ${COLORES_TAILWIND.azulClaroText}`}>Periodo activo: {stats.periodo_activo.nombre}</span>
        </div>
      )}

      {/* Roles del sistema */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className={`text-sm font-semibold ${COLORES_TAILWIND.azulClaroText} mb-3`}>
        <span className="material-icons text-sm align-middle mr-1">admin_panel_settings</span>
          Roles del Sistema
        </h3>
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <span className="material-icons text-sm">shield</span>Admin
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            <span className="material-icons text-sm">rate_review</span>Evaluador
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="material-icons text-sm">person</span>Evaluado
          </span>
        </div>
      </div>

      {/* Small-boxes clickeables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smallBoxes.map((box, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`${box.route}?filtro=${box.filter}`)}
            className={`${box.color} rounded-lg shadow-md p-4 text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{box.value}</p>
                <p className="text-sm opacity-90 mt-1">{box.label}</p>
              </div>
              <span className="material-icons text-4xl opacity-80">{box.icon}</span>
            </div>
            <div className="mt-2 flex items-center text-xs opacity-75">
              <span className="material-icons text-xs mr-1">open_in_new</span>
              Ver detalle
            </div>
          </div>
        ))}
      </div>

      {/* Progreso por dependencia */}
      {stats?.progreso_dependencias && stats.progreso_dependencias.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className={`text-sm font-semibold ${COLORES_TAILWIND.azulClaroText} mb-3`}>
          <span className="material-icons text-sm align-middle mr-1">account_tree</span>
            Progreso por Dependencia
          </h3>
          <div className="space-y-3">
            {stats.progreso_dependencias.map((dep, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-inst-texto truncate max-w-[200px]">{dep.dependencia}</span>
                  <span className={`font-semibold ${COLORES_TAILWIND.azulClaroText}`}>{dep.progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${dep.progreso >= 75 ? COLORES_TAILWIND.verde : dep.progreso >= 50 ? 'bg-amber-500' : COLORES_TAILWIND.rojo}`}
                    style={{ width: `${dep.progreso}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entidades activas */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <span className="material-icons text-2xl text-purple-700">business</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-inst-texto">{stats?.entidades_activas ?? 0}</p>
          <p className="text-sm text-inst-texto-claro">Entidades Activas</p>
        </div>
      </div>

      {/* Evaluaciones recientes */}
      {stats?.evaluaciones_recientes && stats.evaluaciones_recientes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className={`text-sm font-semibold ${COLORES_TAILWIND.azulClaroText} mb-3`}>
          <span className="material-icons text-sm align-middle mr-1">history</span>
            Evaluaciones Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-inst-gris">
                <th className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Evaluado</th>
                <th className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Tipo</th>
                <th className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Estado</th>
                <th className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Fecha</th>
              </tr></thead>
              <tbody>
                {stats.evaluaciones_recientes.map((ev, i) => (
                  <tr key={i} className="border-b hover:bg-inst-gris/50 transition">
                    <td className="px-3 py-2">{ev.evaluado}</td>
                    <td className="px-3 py-2">{ev.tipo}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                        ${ev.estado === 'completada' ? 'bg-green-100 text-green-800' :
                          ev.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'}`}>
                        {ev.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-inst-texto-claro">{new Date(ev.fecha).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
