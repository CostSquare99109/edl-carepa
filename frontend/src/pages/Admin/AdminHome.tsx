import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, KpiCard, Badge, Button, Alert, SkeletonKpiGrid, SkeletonText } from '../../components/ui';

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

type Tone = 'success' | 'warning' | 'danger' | 'info';

const ESTADO_TONE: Record<string, Tone> = {
  completada: 'success',
  aprobada: 'success',
  pendiente: 'warning',
  en_proceso: 'info',
  rechazada: 'danger',
};

const ESTADO_LABEL: Record<string, string> = {
  completada: 'Completada',
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await api.get<Stats>('/dashboard/admin-stats');
      setStats(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <SkeletonText lines={2} />
        <SkeletonKpiGrid count={4} />
        <SkeletonText lines={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <Alert tone="danger" title="Error al cargar estadísticas">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={cargar}>
            Reintentar
          </Button>
        </Alert>
      </div>
    );
  }

  const smallBoxes = [
    {
      label: 'Evaluados Activos',
      value: stats?.evaluados_activos ?? 0,
      icon: 'person',
      tone: 'info' as Tone,
      filter: 'evaluado',
      route: '/admin/usuarios',
    },
    {
      label: 'Evaluadores',
      value: stats?.evaluadores_registrados ?? 0,
      icon: 'rate_review',
      tone: 'success' as Tone,
      filter: 'evaluador',
      route: '/admin/usuarios',
    },
    {
      label: 'Evaluaciones Completadas',
      value: stats?.evaluaciones_completadas ?? 0,
      icon: 'task_alt',
      tone: 'success' as Tone,
      filter: 'completada',
      route: '/admin/evaluaciones',
    },
    {
      label: 'Evaluaciones Pendientes',
      value: stats?.evaluaciones_pendientes ?? 0,
      icon: 'pending',
      tone: 'danger' as Tone,
      filter: 'pendiente',
      route: '/admin/evaluaciones',
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-heading font-bold text-inst-azul-osc">
          <span className="material-icons align-middle mr-2">space_dashboard</span>
          Tablero de Control
        </h2>
        <Button
          variant="outline"
          size="sm"
          iconLeft={<span className="material-icons text-sm">refresh</span>}
          onClick={cargar}
        >
          Actualizar
        </Button>
      </div>

      {stats?.periodo_activo ? (
        <Card className="border-l-4 border-l-inst-azul-osc">
          <div className="flex items-center gap-2">
            <span className="material-icons text-inst-azul-osc">event</span>
            <span className="text-sm font-medium text-inst-azul-osc">
              Período activo: {stats.periodo_activo.nombre}
            </span>
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-sm font-semibold text-inst-azul-osc mb-3">
          <span className="material-icons text-sm align-middle mr-1">admin_panel_settings</span>
          Roles del Sistema
        </h3>
        <div className="flex gap-3 flex-wrap">
          <Badge tone="danger" dot>
            <span className="material-icons text-xs align-middle mr-1">shield</span>Admin
          </Badge>
          <Badge tone="success" dot>
            <span className="material-icons text-xs align-middle mr-1">rate_review</span>Evaluador
          </Badge>
          <Badge tone="info" dot>
            <span className="material-icons text-xs align-middle mr-1">person</span>Evaluado
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smallBoxes.map((box, idx) => (
          <Card
            key={idx}
            variant="interactive"
            onClick={() => navigate(`${box.route}?filtro=${box.filter}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`${box.route}?filtro=${box.filter}`);
              }
            }}
            aria-label={`${box.label}: ${box.value}. Ver detalle`}
          >
            <KpiCard
              label={box.label}
              value={box.value}
              tone={box.tone}
              icon={<span className="material-icons text-2xl">{box.icon}</span>}
            />
          </Card>
        ))}
      </div>

      {stats?.progreso_dependencias && stats.progreso_dependencias.length > 0 ? (
        <Card>
          <h3 className="text-sm font-semibold text-inst-azul-osc mb-3">
            <span className="material-icons text-sm align-middle mr-1">account_tree</span>
            Progreso por Dependencia
          </h3>
          <div className="space-y-3">
            {stats.progreso_dependencias.map((dep, i) => {
              const tone: Tone = dep.progreso >= 75 ? 'success' : dep.progreso >= 50 ? 'warning' : 'danger';
              const barColor =
                tone === 'success' ? 'bg-inst-verde' : tone === 'warning' ? 'bg-amber-500' : 'bg-inst-rojo';
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-inst-texto truncate max-w-[200px]">{dep.dependencia}</span>
                    <span className="font-semibold text-inst-azul-osc">{dep.progreso}%</span>
                  </div>
                  <div
                    className="w-full bg-inst-gris-med rounded-full h-2.5 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={dep.progreso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de ${dep.dependencia}`}
                  >
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${dep.progreso}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <span className="material-icons text-2xl text-purple-700">business</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-inst-texto">{stats?.entidades_activas ?? 0}</p>
          <p className="text-sm text-inst-texto-claro">Entidades Activas</p>
        </div>
      </Card>

      {stats?.evaluaciones_recientes && stats.evaluaciones_recientes.length > 0 ? (
        <Card>
          <h3 className="text-sm font-semibold text-inst-azul-osc mb-3">
            <span className="material-icons text-sm align-middle mr-1">history</span>
            Evaluaciones Recientes
          </h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-inst-gris">
                  <th scope="col" className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Evaluado</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Tipo</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Estado</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold text-inst-texto-claro">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.evaluaciones_recientes.map((ev) => (
                  <tr key={ev.id} className="border-b hover:bg-inst-gris/50 transition-colors">
                    <td className="px-3 py-2">{ev.evaluado}</td>
                    <td className="px-3 py-2">{ev.tipo}</td>
                    <td className="px-3 py-2">
                      <Badge tone={ESTADO_TONE[ev.estado] ?? 'neutral'}>
                        {ESTADO_LABEL[ev.estado] ?? ev.estado}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-inst-texto-claro">
                      {new Date(ev.fecha).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
