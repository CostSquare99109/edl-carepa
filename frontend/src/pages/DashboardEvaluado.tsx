import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type PaginatedData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, KpiCard, Badge, Alert, Button, Progress, SkeletonKpiGrid, SkeletonText, Tabs, Avatar } from '../components/ui';
import { toast } from 'sonner';

interface PeriodoActivo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  progreso: number;
  etapa_actual: string;
}

interface EvaluacionActual {
  id: number;
  tipo: string;
  estado: string;
  calificacion_definitiva: number | null;
  nivel_resultado: string | null;
}

interface EvaluacionHistorico {
  id: number;
  periodo: string;
  tipo: string;
  estado: string;
  calificacion: number | null;
  nivel: string | null;
}

interface CompromisosStats {
  total: number;
  funcionales: number;
  comportamentales: number;
  propuestos: number;
  pendientes_aprobacion: number;
  aceptados: number;
  en_progreso: number;
  cumplidos: number;
  rechazados: number;
  vencidos: number;
}

interface EvidenciasStats {
  total: number;
  este_periodo: number;
  compromisos_con_evidencia: number;
  competencias_con_evidencia: number;
}

interface Vencimiento {
  tipo: string;
  label: string;
  fecha: string;
  dias_restantes: number;
  critico: boolean;
}

interface MejoramientosStats {
  total: number;
  pendientes: number;
  en_seguimiento: number;
  completados: number;
}

interface AusentismosStats {
  total: number;
  vigentes: number;
  dias_totales: number;
  afectan_evaluacion: number;
}

interface MovilidadesStats {
  total: number;
  en_tramite: number;
  aprobadas: number;
  ejecutadas: number;
}

interface DashboardEvaluadoData {
  periodo_activo: PeriodoActivo | null;
  evaluacion_actual: EvaluacionActual | null;
  evaluaciones_historico: EvaluacionHistorico[];
  compromisos: CompromisosStats;
  evidencias: EvidenciasStats;
  concertaciones_pendientes: number;
  proximos_vencimientos: Vencimiento[];
  notificaciones_no_leidas: number;
  mejoramientos: MejoramientosStats;
  ausentismos: AusentismosStats;
  movilidades: MovilidadesStats;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
  en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
  calificada: { label: 'Calificada', color: 'bg-green-100 text-green-800' },
  aprobada_comision: { label: 'Aprobada Comisión', color: 'bg-purple-100 text-purple-800' },
  rechazada_comision: { label: 'Rechazada Comisión', color: 'bg-red-100 text-red-800' },
  cerrada: { label: 'Cerrada', color: 'bg-gray-100 text-gray-700' },
  propuesta_evaluado: { label: 'Propuesta Evaluado', color: 'bg-amber-100 text-amber-800' },
  concertada: { label: 'Concertada', color: 'bg-green-100 text-green-800' },
  fijada: { label: 'Fijada', color: 'bg-indigo-100 text-indigo-800' },
};

const TIPO_EVAL_LABELS: Record<string, string> = {
  parcial_primer_semestre: '1er Semestre',
  parcial_segundo_semestre: '2do Semestre',
  parcial_eventual: 'Eventual',
  calificacion_definitiva: 'Definitiva',
  calificacion_extraordinaria: 'Extraordinaria',
};

const NIVEL_COLORS: Record<string, string> = {
  sobresaliente: 'text-emerald-700 bg-emerald-100',
  satisfactorio: 'text-blue-700 bg-blue-100',
  no_satisfactorio: 'text-red-700 bg-red-100',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTipoIcon(tipo: string): string {
  switch (tipo) {
    case 'evaluacion': return 'event';
    case 'compromiso': return 'task_alt';
    case 'evidencia': return 'folder_open';
    default: return 'schedule';
  }
}

export default function DashboardEvaluado() {
  const { usuario, roles } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardEvaluadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get<DashboardEvaluadoData>('/dashboard/evaluado')
      .then(res => { if (!cancel) setData(res); })
      .catch(() => toast.error('Error al cargar el dashboard'))
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <SkeletonKpiGrid count={6} />
        <SkeletonText lines={3} />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert tone="warning" title="Sin datos">
        No se pudo cargar la información del dashboard.
      </Alert>
    );
  }

  const { periodo_activo, evaluacion_actual, evaluaciones_historico, compromisos, evidencias,
          concertaciones_pendientes, proximos_vencimientos, notificaciones_no_leidas,
          mejoramientos, ausentismos, movilidades } = data;

  const isEvaluador = roles?.some(r => r.codigo === 'evaluador');
  const isJefe = roles?.some(r => ['jefe_dependencia', 'jefe_entidad'].includes(r.codigo));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header de bienvenida */}
      <Card className="bg-gradient-to-r from-inst-azul-osc to-inst-azul text-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar
              size="xl"
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Escudo"
              fallback={`${usuario?.primer_nombre?.[0] || ''}${usuario?.primer_apellido?.[0] || ''}`}
              className="bg-white/20"
            />
            <div>
              <h2 className="text-xl font-heading font-bold">
                {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
                , {usuario?.primer_nombre || ''} {usuario?.primer_apellido || ''}
              </h2>
              <p className="text-inst-azul-light text-sm mt-0.5">
                Panel del Evaluado · {periodo_activo?.nombre || 'Sin período activo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notificaciones_no_leidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<span className="material-icons text-sm">notifications</span>}
                onClick={() => navigate('/dashboard/notificaciones')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {notificaciones_no_leidas} nueva{notificaciones_no_leidas > 1 ? 's' : ''}
              </Button>
            )}
            {concertaciones_pendientes > 0 && (
              <Button
                variant="outline"
                size="sm"
                iconLeft={<span className="material-icons text-sm">handshake</span>}
                onClick={() => navigate('/compromisos/mios')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {concertaciones_pendientes} concertación{concertaciones_pendientes > 1 ? 'es' : ''} pendiente{concertaciones_pendientes > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Progreso del período */}
      {periodo_activo && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="edl-section-title">Progreso del Período</h3>
            <Badge tone="info">{periodo_activo.etapa_actual}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-inst-texto-claro">{periodo_activo.nombre}</span>
              <span className="font-medium text-inst-azul-osc">{periodo_activo.progreso}%</span>
            </div>
            <Progress value={periodo_activo.progreso} className="h-3" showLabel />
            <p className="text-xs text-inst-texto-claro">
              {periodo_activo.fecha_inicio} - {periodo_activo.fecha_fin} · Etapa: {periodo_activo.etapa_actual}
            </p>
          </div>
        </Card>
      )}

      {/* KPIs principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Evaluaciones"
          value={evaluaciones_historico.length}
          icon={<span className="material-icons text-2xl">assessment</span>}
          tone="info"
          onClick={() => navigate('/evaluaciones')}
        />
        <KpiCard
          label="Compromisos"
          value={compromisos.total}
          icon={<span className="material-icons text-2xl">task_alt</span>}
          tone="info"
          onClick={() => navigate('/compromisos/mios')}
        />
        <KpiCard
          label="Funcionales"
          value={compromisos.funcionales}
          icon={<span className="material-icons text-2xl">work</span>}
          tone="success"
          onClick={() => navigate('/compromisos/mios')}
        />
        <KpiCard
          label="Comportamentales"
          value={compromisos.comportamentales}
          icon={<span className="material-icons text-2xl">psychology</span>}
          tone="warning"
          onClick={() => navigate('/compromisos/mios')}
        />
        <KpiCard
          label="Evidencias"
          value={evidencias.total}
          icon={<span className="material-icons text-2xl">folder_open</span>}
          tone="info"
          onClick={() => navigate('/mis-evidencias')}
        />
        <KpiCard
          label="Mejoramientos"
          value={mejoramientos.total}
          icon={<span className="material-icons text-2xl">trending_up</span>}
          tone="success"
          onClick={() => navigate('/compromisos/mejoramiento')}
        />
      </div>

      {/* Alertas y accesos rápidos */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {concertaciones_pendientes > 0 && (
          <Card className="bg-amber-50 border-amber-200 flex items-start gap-3">
            <span className="material-icons text-3xl text-amber-600">notifications_active</span>
            <div className="flex-1">
              <p className="font-heading font-bold text-amber-800">
                {concertaciones_pendientes} concertación{concertaciones_pendientes > 1 ? 'es' : ''} pendiente{concertaciones_pendientes > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700 mt-0.5">Debe aceptar o rechazar la propuesta del evaluador.</p>
              <Button
                size="sm"
                variant="primary"
                className="mt-2"
                iconLeft={<span className="material-icons text-sm">handshake</span>}
                onClick={() => navigate('/compromisos/mios')}
              >
                Revisar concertaciones
              </Button>
            </div>
          </Card>
        )}

        {compromisos.pendientes_aprobacion > 0 && (
          <Card className="bg-sky-50 border-sky-200 flex items-start gap-3">
            <span className="material-icons text-3xl text-sky-600">schedule</span>
            <div className="flex-1">
              <p className="font-heading font-bold text-sky-800">
                {compromisos.pendientes_aprobacion} compromiso{compromisos.pendientes_aprobacion > 1 ? 's' : ''} en aprobación
              </p>
              <p className="text-sm text-sky-700 mt-0.5">Sus compromisos propuestos esperan respuesta del evaluador.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                iconLeft={<span className="material-icons text-sm">visibility</span>}
                onClick={() => navigate('/compromisos/mios')}
              >
                Ver estado
              </Button>
            </div>
          </Card>
        )}

        {compromisos.rechazados > 0 && (
          <Card className="bg-red-50 border-red-200 flex items-start gap-3">
            <span className="material-icons text-3xl text-red-600">cancel</span>
            <div className="flex-1">
              <p className="font-heading font-bold text-red-800">
                {compromisos.rechazados} compromiso{compromisos.rechazados > 1 ? 's' : ''} rechazado{compromisos.rechazados > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-700 mt-0.5">Revise observaciones y reenvíe su propuesta.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                iconLeft={<span className="material-icons text-sm">edit</span>}
                onClick={() => navigate('/compromisos/proponer')}
              >
                Reenviar propuesta
              </Button>
            </div>
          </Card>
        )}

        {proximos_vencimientos.some(v => v.critico) && (
          <Card className="bg-red-50 border-red-200 flex items-start gap-3">
            <span className="material-icons text-3xl text-red-600">warning</span>
            <div className="flex-1">
              <p className="font-heading font-bold text-red-800">Vencimientos próximos</p>
              <p className="text-sm text-red-700 mt-0.5">
                {proximos_vencimientos.filter(v => v.critico).map(v => `${v.label} en ${v.dias_restantes} día${v.dias_restantes !== 1 ? 's' : ''}`).join(', ')}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Tabs principales */}
      <Tabs
        items={[
          { key: 'resumen', label: <><span className="material-icons text-base">dashboard</span> Resumen</> },
          { key: 'evaluaciones', label: <><span className="material-icons text-base">assessment</span> Evaluaciones</> },
          { key: 'compromisos', label: <><span className="material-icons text-base">task_alt</span> Compromisos</> },
          { key: 'evidencias', label: <><span className="material-icons text-base">folder_open</span> Evidencias</> },
          { key: 'calendario', label: <><span className="material-icons text-base">event</span> Calendario</> },
          { key: 'seguimiento', label: <><span className="material-icons text-base">timeline</span> Seguimiento</> },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
        ariaLabel="Dashboard tabs"
      />

      <div className="mt-4 space-y-6">
        {/* Tab: Resumen */}
        {activeTab === 'resumen' && (
          <>
            {/* Evaluación actual */}
            {evaluacion_actual && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="edl-section-title">Evaluación Actual</h3>
                  <Badge tone={NIVEL_COLORS[evaluacion_actual.nivel_resultado || ''] as any}>
                    {evaluacion_actual.nivel_resultado || 'Sin calificar'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-inst-texto-claro">Tipo</p>
                    <p className="font-medium text-inst-texto">{TIPO_EVAL_LABELS[evaluacion_actual.tipo] || evaluacion_actual.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro">Estado</p>
                    <p className="font-medium text-inst-texto">
                      <Badge tone={ESTADO_LABELS[evaluacion_actual.estado]?.color.replace('bg-', '').replace('text-', '') as any || 'info'}>
                        {ESTADO_LABELS[evaluacion_actual.estado]?.label || evaluacion_actual.estado}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro">Calificación</p>
                    <p className="font-bold text-2xl text-inst-azul-osc">
                      {evaluacion_actual.calificacion_definitiva !== null ? evaluacion_actual.calificacion_definitiva + '%' : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro">Acción</p>
                    <Button
                      size="sm"
                      variant="primary"
                      iconLeft={<span className="material-icons text-sm">visibility</span>}
                      onClick={() => navigate(`/evaluaciones`)}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Próximos vencimientos */}
            {proximos_vencimientos.length > 0 && (
              <Card>
                <h3 className="edl-section-title mb-4 flex items-center gap-2">
                  <span className="material-icons text-inst-azul">event</span>Próximos Hitos y Vencimientos
                </h3>
                <div className="space-y-3">
                  {proximos_vencimientos.map((v, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${v.critico ? 'bg-red-50 border-red-200' : 'bg-inst-gris border-inst-borde'}`}>
                      <span className={`material-icons text-2xl ${v.critico ? 'text-red-600' : 'text-inst-azul'}`}>{getTipoIcon(v.tipo)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-inst-texto">{v.label}</p>
                        <p className="text-xs text-inst-texto-claro">{formatDate(v.fecha)}</p>
                      </div>
                      <div className={`text-right ${v.critico ? 'text-red-600' : 'text-inst-azul-osc'}`}>
                        <p className="font-bold text-lg">{v.dias_restantes} día{v.dias_restantes !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-inst-texto-claro">restantes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Estado rápido de compromisos */}
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">task_alt</span>Estado de Compromisos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'propuestos', label: 'Propuestos', value: compromisos.propuestos, color: 'text-yellow-700 bg-yellow-100' },
                  { key: 'pendientes_aprobacion', label: 'Pend. Aprobación', value: compromisos.pendientes_aprobacion, color: 'text-amber-700 bg-amber-100' },
                  { key: 'aceptados', label: 'Aceptados', value: compromisos.aceptados, color: 'text-green-700 bg-green-100' },
                  { key: 'en_progreso', label: 'En Progreso', value: compromisos.en_progreso, color: 'text-blue-700 bg-blue-100' },
                  { key: 'cumplidos', label: 'Cumplidos', value: compromisos.cumplidos, color: 'text-emerald-700 bg-emerald-100' },
                  { key: 'rechazados', label: 'Rechazados', value: compromisos.rechazados, color: 'text-red-700 bg-red-100' },
                  { key: 'vencidos', label: 'Vencidos', value: compromisos.vencidos, color: 'text-orange-700 bg-orange-100' },
                  { key: 'total', label: 'Total', value: compromisos.total, color: 'text-inst-azul-osc bg-blue-100' },
                ].map(item => (
                  <div key={item.key} className={`p-3 rounded-lg ${item.color} text-center`}>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Tab: Evaluaciones */}
        {activeTab === 'evaluaciones' && (
          <Card>
            <h3 className="edl-section-title mb-4">Historial de Evaluaciones</h3>
            {evaluaciones_historico.length === 0 ? (
              <p className="text-inst-texto-claro text-center py-8">No tiene evaluaciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-inst-borde">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Período</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Tipo</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Estado</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Calificación</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Nivel</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-inst-texto-claro uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inst-borde">
                    {evaluaciones_historico.map(e => (
                      <tr key={e.id} className="hover:bg-inst-gris/30">
                        <td className="py-2.5 px-3 text-inst-texto">{e.periodo}</td>
                        <td className="py-2.5 px-3 text-inst-texto">{TIPO_EVAL_LABELS[e.tipo] || e.tipo}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge tone={ESTADO_LABELS[e.estado]?.color.replace('bg-', '').replace('text-', '') as any || 'info'}>
                            {ESTADO_LABELS[e.estado]?.label || e.estado}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-inst-azul-osc">
                          {e.calificacion !== null ? e.calificacion + '%' : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge tone={NIVEL_COLORS[e.nivel || ''] as any}>
                            {e.nivel || '—'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconLeft={<span className="material-icons text-sm">visibility</span>}
                            onClick={() => navigate(`/evaluaciones`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab: Compromisos */}
        {activeTab === 'compromisos' && (
          <div className="space-y-4">
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">task_alt</span>Mis Compromisos y Competencias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Button
                  variant="primary"
                  iconLeft={<span className="material-icons text-sm">add</span>}
                  onClick={() => navigate('/compromisos/proponer')}
                >
                  Proponer Compromiso
                </Button>
                <Button
                  variant="outline"
                  iconLeft={<span className="material-icons text-sm">visibility</span>}
                  onClick={() => navigate('/compromisos/mios')}
                >
                  Ver Detalle Completo
                </Button>
                <Button
                  variant="outline"
                  iconLeft={<span className="material-icons text-sm">rate_review</span>}
                  onClick={() => navigate('/compromisos/propuestos')}
                >
                  Ver Propuestos por Evaluador
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-inst-gris rounded-lg">
                  <h4 className="font-bold text-inst-azul mb-2 flex items-center gap-1">
                    <span className="material-icons text-sm">work</span> Funcionales ({compromisos.funcionales})
                  </h4>
                  <p className="text-sm text-inst-texto-claro">
                    {compromisos.aceptados} aprobados · {compromisos.en_progreso} en progreso · {compromisos.cumplidos} cumplidos
                  </p>
                </div>
                <div className="p-4 bg-inst-gris rounded-lg">
                  <h4 className="font-bold text-inst-azul mb-2 flex items-center gap-1">
                    <span className="material-icons text-sm">psychology</span> Comportamentales ({compromisos.comportamentales})
                  </h4>
                  <p className="text-sm text-inst-texto-claro">
                    {compromisos.aceptados} aprobados · {compromisos.en_progreso} en progreso · {compromisos.cumplidos} cumplidos
                  </p>
                </div>
              </div>
            </Card>

            {/* Mejoramientos */}
            {mejoramientos.total > 0 && (
              <Card>
                <h3 className="edl-section-title mb-4 flex items-center gap-2">
                  <span className="material-icons text-inst-azul">trending_up</span>Compromisos de Mejoramiento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Pendientes', value: mejoramientos.pendientes, color: 'text-amber-700 bg-amber-100' },
                    { label: 'En Seguimiento', value: mejoramientos.en_seguimiento, color: 'text-blue-700 bg-blue-100' },
                    { label: 'Completados', value: mejoramientos.completados, color: 'text-green-700 bg-green-100' },
                  ].map(item => (
                    <div key={item.label} className={`p-3 rounded-lg ${item.color} text-center`}>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  iconLeft={<span className="material-icons text-sm">visibility</span>}
                  onClick={() => navigate('/compromisos/mejoramiento')}
                >
                  Gestionar mejoramientos
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Tab: Evidencias */}
        {activeTab === 'evidencias' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="edl-section-title">Evidencias de Desempeño</h3>
              <Button
                variant="primary"
                iconLeft={<span className="material-icons text-sm">add</span>}
                onClick={() => navigate('/mis-evidencias')}
              >
                Registrar Evidencia
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-700">{evidencias.total}</p>
                <p className="text-xs text-blue-600">Total evidencias</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-700">{evidencias.compromisos_con_evidencia}</p>
                <p className="text-xs text-green-600">Compromisos con evidencia</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <p className="text-2xl font-bold text-purple-700">{evidencias.competencias_con_evidencia}</p>
                <p className="text-xs text-purple-600">Competencias con evidencia</p>
              </div>
            </div>
            <p className="text-sm text-inst-texto-claro">
              Registre evidencias descriptivas de sus logros para respaldar su evaluación. Cada evidencia se asocia a un compromiso o competencia concertada.
            </p>
          </Card>
        )}

        {/* Tab: Calendario */}
        {activeTab === 'calendario' && (
          <div className="space-y-4">
            {/* Período actual */}
            {periodo_activo && (
              <Card>
                <h3 className="edl-section-title mb-4 flex items-center gap-2">
                  <span className="material-icons text-inst-azul">date_range</span>Período de Evaluación Activo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-inst-azul-osc text-white rounded-lg">
                    <p className="text-xs text-inst-azul-light">Inicio</p>
                    <p className="font-bold text-lg">{formatDate(periodo_activo.fecha_inicio)}</p>
                  </div>
                  <div className="p-4 bg-inst-azul text-white rounded-lg">
                    <p className="text-xs text-inst-azul-light">Fin</p>
                    <p className="font-bold text-lg">{formatDate(periodo_activo.fecha_fin)}</p>
                  </div>
                  <div className="p-4 bg-amber-600 text-white rounded-lg">
                    <p className="text-xs text-amber-100">Progreso</p>
                    <p className="font-bold text-2xl">{periodo_activo.progreso}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={periodo_activo.progreso} className="h-3" showLabel />
                </div>
              </Card>
            )}

            {/* Hitos del proceso CNSC */}
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">flag</span>Hitos del Proceso CNSC (Acuerdo 617/2018)
              </h3>
              <div className="space-y-3">
                {[
                  { etapa: 'Configuración', fechas: 'Feb 1 - Feb 21', icon: 'settings', color: 'text-purple-600 bg-purple-100' },
                  { etapa: 'Concertación', fechas: 'Feb 22 - Jul 15', icon: 'handshake', color: 'text-green-600 bg-green-100' },
                  { etapa: 'Seguimiento', fechas: 'Jul 16 - Ene 31', icon: 'timeline', color: 'text-blue-600 bg-blue-100' },
                  { etapa: 'Evaluación Parcial', fechas: 'Ene 1 - Ene 15', icon: 'rate_review', color: 'text-amber-600 bg-amber-100' },
                  { etapa: 'Calificación Definitiva', fechas: 'Ene 16 - Ene 31', icon: 'assessment', color: 'text-red-600 bg-red-100' },
                ].map((hito, i) => {
                  const isActual = periodo_activo?.estado === ['configuracion', 'concertacion', 'seguimiento', 'evaluacion', 'calificacion'][i];
                  return (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${isActual ? 'bg-inst-azul-osc-light border-inst-azul' : 'bg-white border-inst-borde'}`}>
                      <span className={`material-icons text-2xl ${hito.color}`}>{hito.icon}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${isActual ? 'text-inst-azul-osc' : 'text-inst-texto'}`}>{hito.etapa}</p>
                        <p className="text-xs text-inst-texto-claro">{hito.fechas} {isActual ? '· ETAPA ACTUAL' : ''}</p>
                      </div>
                      {isActual && <Badge tone="danger">ACTUAL</Badge>}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Vencimientos próximos */}
            {proximos_vencimientos.length > 0 && (
              <Card>
                <h3 className="edl-section-title mb-4 flex items-center gap-2">
                  <span className="material-icons text-inst-azul">schedule</span>Próximos Vencimientos
                </h3>
                <div className="space-y-2">
                  {proximos_vencimientos.map((v, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${v.critico ? 'bg-red-50 border-red-200' : 'bg-inst-gris border-inst-borde'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-icons text-2xl ${v.critico ? 'text-red-600' : 'text-inst-azul'}`}>{getTipoIcon(v.tipo)}</span>
                        <div>
                          <p className="font-medium text-inst-texto">{v.label}</p>
                          <p className="text-xs text-inst-texto-claro">{formatDate(v.fecha)}</p>
                        </div>
                      </div>
                      <div className={`text-right ${v.critico ? 'text-red-600' : 'text-inst-azul-osc'}`}>
                        <p className="font-bold text-lg">{v.dias_restantes} día{v.dias_restantes !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-inst-texto-claro">restantes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab: Seguimiento */}
        {activeTab === 'seguimiento' && (
          <div className="space-y-4">
            {/* Ausentismos */}
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">event_busy</span>Mis Ausentismos (Solo Lectura)
              </h3>
              {ausentismos.total === 0 ? (
                <p className="text-inst-texto-claro text-center py-4">No tiene ausentismos registrados.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-700">{ausentismos.total}</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                      <p className="text-2xl font-bold text-green-700">{ausentismos.vigentes}</p>
                      <p className="text-xs text-green-600">Vigentes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <p className="text-2xl font-bold text-amber-700">{ausentismos.dias_totales}</p>
                      <p className="text-xs text-amber-600">Días totales</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                      <p className="text-2xl font-bold text-red-700">{ausentismos.afectan_evaluacion}</p>
                      <p className="text-xs text-red-600">Afectan evaluación ({'>30 días'})</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={<span className="material-icons text-sm">visibility</span>}
                    onClick={() => navigate('/ausentismos')}
                  >
                    Ver listado completo
                  </Button>
                </>
              )}
            </Card>

            {/* Movilidades */}
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">swap_horiz</span>Mis Movilidades (Solo Lectura)
              </h3>
              {movilidades.total === 0 ? (
                <p className="text-inst-texto-claro text-center py-4">No tiene movilidades registradas.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-700">{movilidades.total}</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <p className="text-2xl font-bold text-amber-700">{movilidades.en_tramite}</p>
                      <p className="text-xs text-amber-600">En trámite</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                      <p className="text-2xl font-bold text-green-700">{movilidades.aprobadas}</p>
                      <p className="text-xs text-green-600">Aprobadas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                      <p className="text-2xl font-bold text-purple-700">{movilidades.ejecutadas}</p>
                      <p className="text-xs text-purple-600">Ejecutadas</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={<span className="material-icons text-sm">visibility</span>}
                    onClick={() => navigate('/movilidad')}
                  >
                    Ver listado completo
                  </Button>
                </>
              )}
            </Card>

            {/* Notificaciones recientes */}
            <Card>
              <h3 className="edl-section-title mb-4 flex items-center gap-2">
                <span className="material-icons text-inst-azul">notifications</span>Notificaciones Recientes
              </h3>
              <p className="text-sm text-inst-texto-claro mb-4">
                Tiene <strong>{notificaciones_no_leidas}</strong> notificación{notificaciones_no_leidas !== 1 ? 'es' : ''} sin leer.
              </p>
              <Button
                variant="primary"
                iconLeft={<span className="material-icons text-sm">notifications</span>}
                onClick={() => navigate('/dashboard/notificaciones')}
              >
                Ver todas las notificaciones
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}