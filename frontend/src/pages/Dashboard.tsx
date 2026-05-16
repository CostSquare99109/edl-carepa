import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Resumen {
  entidades: number;
  usuarios: number;
  evaluaciones: number;
  periodos: number;
  notificaciones_no_leidas: number;
  compromisos_pendientes_aprobacion: number;
  mis_compromisos_enviados: number;
}

interface Actividad {
  id: number;
  descripcion: string;
  fecha: string;
  tipo: string;
}

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: number;
  creado_en: string;
}

const CARD_ITEMS = [
  { key: 'entidades', label: 'Entidades', icon: 'domain', color: 'text-inst-azul' },
  { key: 'usuarios', label: 'Usuarios', icon: 'people', color: 'text-inst-azul' },
  { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', color: 'text-inst-verde' },
  { key: 'periodos', label: 'Periodos activos', icon: 'calendar_today', color: 'text-inst-rojo' },
] as const;

const NOTI_ICON: Record<string, string> = {
  info: 'info',
  alerta: 'notifications_active',
  error: 'error',
  exito: 'check_circle',
};

const NOTI_COLOR: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200',
  alerta: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
  exito: 'bg-green-50 border-green-200',
};

export default function Dashboard() {
  const { roles } = useAuth();
  const [resumen, setResumen] = useState<Resumen>({
    entidades: 0, usuarios: 0, evaluaciones: 0, periodos: 0,
    notificaciones_no_leidas: 0, compromisos_pendientes_aprobacion: 0, mis_compromisos_enviados: 0,
  });
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

 const puedeAprobar = roles?.some(r =>
 ['evaluador', 'comision_evaluadora', 'admin_entidad', 'admin_cnsc'].includes(r.codigo)
 );

  useEffect(() => {
    api.get<Resumen>('/dashboard/resumen').then(setResumen).catch(() => {});
    api.get<PaginatedData<Actividad>>('/dashboard/actividad?por_pagina=10')
      .then(r => setActividad(r.data))
      .catch(() => {});
    api.get<PaginatedData<Notificacion>>('/notificaciones?por_pagina=5')
      .then(r => setNotificaciones(r.data || []))
      .catch(() => {});
  }, []);

  async function marcarLeida(id: number) {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
      setResumen(prev => ({ ...prev, notificaciones_no_leidas: Math.max(0, prev.notificaciones_no_leidas - 1) }));
    } catch {}
  }

  return (
    <div>
      <h2 className="edl-section-title mb-6">Panel principal</h2>

      {/* Alertas de compromisos pendientes */}
      {(resumen.compromisos_pendientes_aprobacion > 0 || resumen.mis_compromisos_enviados > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {resumen.compromisos_pendientes_aprobacion > 0 && puedeAprobar && (
            <div className="edl-card bg-yellow-50 border-yellow-300 flex items-center gap-3">
              <span className="material-icons text-3xl text-yellow-600">notifications_active</span>
              <div>
                <p className="font-heading font-bold text-yellow-800">
                  {resumen.compromisos_pendientes_aprobacion} compromiso{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} pendiente{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} de aprobacion
                </p>
                <p className="text-sm text-yellow-700">
                  Funcionarios han enviado compromisos que requieren su revision y asignacion de peso.
                </p>
                <a href="#/compromisos/aprobar" className="text-sm text-yellow-800 underline font-medium mt-1 inline-block">
                  Ir a Aprobar Compromisos
                </a>
              </div>
            </div>
          )}
          {resumen.mis_compromisos_enviados > 0 && (
            <div className="edl-card bg-blue-50 border-blue-300 flex items-center gap-3">
              <span className="material-icons text-3xl text-blue-600">schedule</span>
              <div>
                <p className="font-heading font-bold text-blue-800">
                  {resumen.mis_compromisos_enviados} compromiso{resumen.mis_compromisos_enviados > 1 ? 's' : ''} en espera
                </p>
                <p className="text-sm text-blue-700">
                  Sus compromisos enviados estan pendientes de aprobacion por el evaluador.
                </p>
                <a href="#/compromisos/mios" className="text-sm text-blue-800 underline font-medium mt-1 inline-block">
                  Ver Mis Compromisos
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARD_ITEMS.map((item) => (
          <div key={item.key} className="edl-card flex items-center gap-4">
            <div className={`${item.color} bg-inst-gris rounded-lg p-3`}>
              <span className="material-icons text-2xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-inst-azul">
                {resumen[item.key]}
              </p>
              <p className="text-sm text-inst-texto-claro">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notificaciones recientes */}
      {notificaciones.length > 0 && (
        <div className="edl-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="edl-section-title">
              Notificaciones
              {resumen.notificaciones_no_leidas > 0 && (
                <span className="ml-2 bg-inst-rojo text-white text-xs px-2 py-0.5 rounded-full">
                  {resumen.notificaciones_no_leidas}
                </span>
              )}
            </h3>
          </div>
          <div className="space-y-2">
            {notificaciones.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${NOTI_COLOR[n.tipo] || 'bg-gray-50'}`}
              >
                <span className="material-icons text-lg mt-0.5">
                  {NOTI_ICON[n.tipo] || 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.leida ? 'text-inst-texto-claro' : 'text-inst-texto'}`}>
                    {n.titulo}
                  </p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">{n.mensaje}</p>
                </div>
                {!n.leida && (
                  <button
                    onClick={() => marcarLeida(n.id)}
                    className="text-xs text-inst-azul hover:underline flex-shrink-0"
                  >
                    Marcar leida
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      <div className="edl-card">
        <h3 className="edl-section-title mb-4">Actividad reciente</h3>
        {actividad.length === 0 ? (
          <p className="text-sm text-inst-texto-claro py-4">No hay actividad registrada.</p>
        ) : (
          <div className="space-y-0">
            {actividad.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-3 border-b border-inst-borde last:border-b-0"
              >
                <div className="w-1 self-stretch bg-inst-rojo rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-inst-texto">{a.descripcion}</p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">{a.fecha}</p>
                </div>
                <span className="edl-badge bg-inst-gris text-inst-texto-claro text-xs">
                  {a.tipo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
