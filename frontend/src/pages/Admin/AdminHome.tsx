import { useAuth } from '../../contexts/AuthContext';

/* ─────────────────────────────────────────────
 Tipos & datos mock
 ───────────────────────────────────────────── */

interface SmallBoxData {
  value: string | number;
  label: string;
  icon: string;
  bg: string;
  footerText: string;
  footerLink: string;
  trend?: string;
}

interface DependenciaProgreso {
  nombre: string;
  completado: number;
  pendiente: number;
}

interface EvaluacionReciente {
  id: number;
  evaluado: string;
  dependencia: string;
  estado: 'Completada' | 'En proceso' | 'Pendiente' | 'Aprobada';
  puntaje: string;
  fecha: string;
}

const SMALL_BOXES: SmallBoxData[] = [
  {
    value: 1284,
    label: 'Evaluados Activos',
    icon: 'people',
    bg: 'bg-inst-azul',
    footerText: 'Más info',
    footerLink: '/admin/usuarios',
    trend: '↑ 12% más',
  },
  {
    value: 56,
    label: 'Evaluadores Registrados',
    icon: 'rate_review',
    bg: 'bg-inst-verde',
    footerText: 'Más info',
    footerLink: '/admin/usuarios',
  },
  {
    value: 342,
    label: 'Evaluaciones Completadas',
    icon: 'task_alt',
    bg: 'bg-amber-600',
    footerText: 'Más info',
    footerLink: '/admin/evaluaciones',
  },
  {
    value: 87,
    label: 'Evaluaciones Pendientes',
    icon: 'pending_actions',
    bg: 'bg-inst-rojo',
    footerText: 'Más info',
    footerLink: '/admin/evaluaciones',
  },
];

const DEPENDENCIA_PROGRESO: DependenciaProgreso[] = [
  { nombre: 'Dirección General', completado: 78, pendiente: 22 },
  { nombre: 'Recursos Humanos', completado: 62, pendiente: 38 },
  { nombre: 'Planeación', completado: 45, pendiente: 55 },
  { nombre: 'Jurídica', completado: 91, pendiente: 9 },
  { nombre: 'Tecnología', completado: 35, pendiente: 65 },
];

const EVALUACIONES_RECIENTES: EvaluacionReciente[] = [
  { id: 1, evaluado: 'María López', dependencia: 'Dirección General', estado: 'Completada', puntaje: '4.5', fecha: '2025-05-15' },
  { id: 2, evaluado: 'Carlos Ramírez', dependencia: 'Recursos Humanos', estado: 'En proceso', puntaje: '—', fecha: '2025-05-14' },
  { id: 3, evaluado: 'Ana Martínez', dependencia: 'Planeación', estado: 'Pendiente', puntaje: '—', fecha: '2025-05-13' },
  { id: 4, evaluado: 'Pedro Gómez', dependencia: 'Jurídica', estado: 'Aprobada', puntaje: '4.8', fecha: '2025-05-12' },
  { id: 5, evaluado: 'Laura Sánchez', dependencia: 'Tecnología', estado: 'Completada', puntaje: '3.9', fecha: '2025-05-11' },
];

const ESTADO_BADGE: Record<EvaluacionReciente['estado'], string> = {
  Completada: 'bg-green-100 text-green-800',
  'En proceso': 'bg-blue-100 text-blue-800',
  Pendiente: 'bg-amber-100 text-amber-800',
  Aprobada: 'bg-inst-azul/10 text-inst-azul',
};

/* ─────────────────────────────────────────────
 Componente
 ───────────────────────────────────────────── */

export default function AdminHome() {
  const { usuario } = useAuth();

  return (
    <main className="p-4 lg:p-6">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2">
          <span className="material-icons text-3xl">dashboard</span>
          Tablero de Control
        </h1>
        <p className="text-sm text-inst-texto-claro mt-1">
          Resumen general del sistema de evaluación EDL-CNSC
        </p>
      </div>

      {/* ── Small-boxes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {SMALL_BOXES.map((box, i) => (
          <div
            key={i}
            className={`${box.bg} rounded-lg overflow-hidden text-white shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-3xl font-heading font-bold">{box.value}</p>
                <p className="text-sm text-white/80 mt-0.5">{box.label}</p>
                {box.trend && (
                  <p className="text-xs text-white/60 mt-1 flex items-center gap-0.5">
                    <span className="material-icons text-sm">trending_up</span>
                    {box.trend}
                  </p>
                )}
              </div>
              <span className="material-icons text-5xl text-white/20">{box.icon}</span>
            </div>
            <a
              href={`#${box.footerLink}`}
              className="block bg-black/10 px-5 py-2 text-xs text-white/80 hover:bg-black/20 transition-colors text-center"
            >
              {box.footerText} →
            </a>
          </div>
        ))}
      </div>

      {/* ── Fila: Gráfica + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Gráfica de progreso por dependencia */}
        <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
          <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
            <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
              <span className="material-icons text-xl text-inst-verde">bar_chart</span>
              Avance por Dependencia
            </h2>
            <span className="text-xs text-inst-texto-claro">Periodo actual</span>
          </div>
          <div className="p-5 space-y-4">
            {DEPENDENCIA_PROGRESO.map((dep, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-inst-texto">{dep.nombre}</span>
                  <span className="text-xs font-semibold text-inst-azul">{dep.completado}%</span>
                </div>
                <div className="h-6 bg-inst-gris rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-inst-verde rounded-l-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${dep.completado}%` }}
                  >
                    {dep.completado >= 20 && (
                      <span className="text-[10px] text-white font-medium">{dep.completado}%</span>
                    )}
                  </div>
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${dep.pendiente}%` }}
                  >
                    {dep.pendiente >= 25 && (
                      <span className="text-[10px] text-amber-900 font-medium">{dep.pendiente}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Leyenda */}
            <div className="flex items-center gap-5 pt-2 border-t border-inst-borde">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-inst-verde" />
                <span className="text-xs text-inst-texto-claro">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-xs text-inst-texto-claro">Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
          <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
            <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
              <span className="material-icons text-xl text-inst-azul">info</span>
              Resumen del Periodo
            </h2>
            <span className="text-xs px-2 py-0.5 bg-inst-verde/10 text-inst-verde rounded-full font-medium">
              Activo
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-inst-borde">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg text-inst-azul">calendar_today</span>
                <span className="text-sm text-inst-texto">Periodo activo</span>
              </div>
              <span className="text-sm font-semibold text-inst-azul">2025-I</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-inst-borde">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg text-inst-verde">event_available</span>
                <span className="text-sm text-inst-texto">Fecha inicio</span>
              </div>
              <span className="text-sm font-medium text-inst-texto">15 Ene 2025</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-inst-borde">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg text-inst-rojo">event_busy</span>
                <span className="text-sm text-inst-texto">Fecha cierre</span>
              </div>
              <span className="text-sm font-medium text-inst-texto">30 Jun 2025</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-inst-borde">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg text-amber-600">schedule</span>
                <span className="text-sm text-inst-texto">Días restantes</span>
              </div>
              <span className="text-sm font-semibold text-amber-600">45 días</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg text-inst-azul">domain</span>
                <span className="text-sm text-inst-texto">Entidades participantes</span>
              </div>
              <span className="text-sm font-semibold text-inst-azul">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla de evaluaciones recientes ── */}
      <div className="bg-white rounded-lg border border-inst-borde shadow-sm">
        <div className="px-5 py-4 border-b border-inst-borde flex items-center justify-between">
          <h2 className="font-heading font-semibold text-inst-azul flex items-center gap-2">
            <span className="material-icons text-xl text-amber-600">history</span>
            Evaluaciones Recientes
          </h2>
          <a
            href="#/admin/evaluaciones"
            className="text-xs text-inst-azul hover:underline font-medium flex items-center gap-1"
          >
            Ver todas
            <span className="material-icons text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Evaluado</th>
                <th>Dependencia</th>
                <th>Estado</th>
                <th>Puntaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {EVALUACIONES_RECIENTES.map((evaluacion) => (
                <tr key={evaluacion.id}>
                  <td className="font-medium text-inst-texto">{evaluacion.evaluado}</td>
                  <td className="text-inst-texto-claro">{evaluacion.dependencia}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[evaluacion.estado]}`}
                    >
                      {evaluacion.estado}
                    </span>
                  </td>
                  <td className="font-semibold text-inst-texto">{evaluacion.puntaje}</td>
                  <td className="text-inst-texto-claro">{evaluacion.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
