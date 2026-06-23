import { useEffect, useState, Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type PaginatedData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, KpiCard, Badge, Alert, Button, Input, SkeletonKpiGrid, SkeletonText } from '../components/ui';
import { toast } from 'sonner';

interface Resumen {
 entidades: number;
 usuarios: number;
 evaluaciones: number;
 periodos: number;
 notificaciones_no_leidas: number;
 compromisos_pendientes_aprobacion: number;
 mis_compromisos_enviados: number;
}

interface AdminStats {
 evaluados_activos: number;
 evaluadores_registrados: number;
 evaluaciones_completadas: number;
 evaluaciones_pendientes: number;
 periodo_activo: { id: number; nombre: string } | null;
 progreso_dependencias: { dependencia: string; progreso: number }[];
 evaluaciones_por_estado: { estado: string; cantidad: number }[];
 evaluaciones_por_dependencia: { dependencia: string; completadas: number; pendientes: number }[];
}

interface Actividad {
 id: number;
 accion: string;
 entidad: string;
 registro_id: string;
 datos_nuevos: string;
 ip_address: string;
 fecha: string;
}

interface Notificacion {
 id: number;
 titulo: string;
 mensaje: string;
 tipo: string;
 leida: number;
 creado_en: string;
}

const ADMIN_ONLY_CARDS = ['entidades', 'usuarios', 'evaluaciones', 'periodos'];

const CARD_ITEMS = [
 { key: 'entidades', label: 'Entidades', icon: 'domain', color: 'text-purple-700', bg: 'bg-purple-100' },
 { key: 'usuarios', label: 'Usuarios', icon: 'people', color: 'text-inst-azul-osc', bg: 'bg-blue-100' },
 { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', color: 'text-inst-verde', bg: 'bg-green-100' },
 { key: 'periodos', label: 'Períodos activos', icon: 'calendar_today', color: 'text-inst-rojo', bg: 'bg-red-100' },
] as const;

const NOTI_ICON: Record<string, string> = {
 info: 'info',
 alerta: 'notifications_active',
 error: 'error',
 exito: 'check_circle',
};

const NOTI_COLOR: Record<string, { tone: 'info' | 'success' | 'warning' | 'danger' }> = {
 info: { tone: 'info' },
 alerta: { tone: 'warning' },
 error: { tone: 'danger' },
 exito: { tone: 'success' },
};

const PIE_COLORS = ['#1E5A3C', '#0A2B5E', '#C4282B', '#F59E0B', '#6B7280'];

const ESTADO_LABELS: Record<string, string> = {
 en_proceso: 'En Proceso',
 completada: 'Completada',
 pendiente: 'Pendiente',
 aprobada: 'Aprobada',
 rechazada: 'Rechazada',
};

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
 state = { hasError: false, error: '' };
 static getDerivedStateFromError(error: Error) {
  return { hasError: true, error: error.message };
 }
 render() {
  if (this.state.hasError) {
   return (
    <div className="m-4">
     <Alert tone="danger" title="Error al cargar el panel">
      <p>{this.state.error}</p>
      <Button
       variant="outline"
       size="sm"
       className="mt-3"
       iconLeft={<span className="material-icons text-sm">refresh</span>}
       onClick={() => this.setState({ hasError: false, error: '' })}
      >
       Reintentar
      </Button>
     </Alert>
    </div>
   );
  }
  return this.props.children;
 }
}

function DashboardContent() {
 const { usuario, rolActivo, roles } = useAuth();
 const navigate = useNavigate();
 const [resumen, setResumen] = useState<Resumen>({
  entidades: 0, usuarios: 0, evaluaciones: 0, periodos: 0,
  notificaciones_no_leidas: 0, compromisos_pendientes_aprobacion: 0, mis_compromisos_enviados: 0,
 });
 const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
 const [actividad, setActividad] = useState<Actividad[]>([]);
 const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
 const [cargando, setCargando] = useState(true);
 const [cambiandoPassword, setCambiandoPassword] = useState(false);
 const [passwordActual, setPasswordActual] = useState('');
 const [passwordNueva, setPasswordNueva] = useState('');
 const [passwordConfirmar, setPasswordConfirmar] = useState('');
 const [passwordMsg, setPasswordMsg] = useState('');
 const [passwordMsgTone, setPasswordMsgTone] = useState<'success' | 'danger'>('success');

 const isAdmin = roles?.some(r => r.codigo === 'admin');
 const visibleCards = CARD_ITEMS.filter(item =>
  isAdmin || !ADMIN_ONLY_CARDS.includes(item.key)
 );
 const puedeAprobar = roles?.some(r => r.codigo === 'evaluador' || r.codigo === 'admin');

 useEffect(() => {
  let cancel = false;
  setCargando(true);
  Promise.allSettled([
   api.get<Resumen>('/dashboard/resumen').then(setResumen),
   isAdmin ? api.get<AdminStats>('/dashboard/admin-stats').then(setAdminStats) : Promise.resolve(),
   api.get<PaginatedData<Actividad>>('/dashboard/actividad?por_pagina=10')
    .then(r => setActividad(Array.isArray(r?.data) ? r.data : []))
    .catch(() => setActividad([])),
   api.get<PaginatedData<Notificacion>>('/notificaciones?por_pagina=5')
    .then(r => setNotificaciones(Array.isArray(r?.data) ? r.data : []))
    .catch(() => setNotificaciones([])),
  ]).finally(() => { if (!cancel) setCargando(false); });
  return () => { cancel = true; };
 }, [isAdmin]);

 async function marcarLeida(id: number) {
  try {
   await api.put(`/notificaciones/${id}/leer`);
   setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
   setResumen(prev => ({ ...prev, notificaciones_no_leidas: Math.max(0, prev.notificaciones_no_leidas - 1) }));
   toast.success('Notificación marcada como leída');
  } catch {
   toast.error('No se pudo marcar como leída');
  }
 }

 async function cambiarPassword() {
  setPasswordMsg('');
  if (!passwordNueva || passwordNueva.length < 6) {
   setPasswordMsgTone('danger');
   setPasswordMsg('La contraseña debe tener al menos 6 caracteres');
   return;
  }
  if (passwordNueva !== passwordConfirmar) {
   setPasswordMsgTone('danger');
   setPasswordMsg('Las contraseñas no coinciden');
   return;
  }
  try {
   await api.put('/auth/password', {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
   });
   setPasswordMsgTone('success');
   setPasswordMsg('Contraseña actualizada exitosamente');
   setPasswordActual('');
   setPasswordNueva('');
   setPasswordConfirmar('');
   toast.success('Contraseña actualizada');
   setTimeout(() => { setCambiandoPassword(false); setPasswordMsg(''); }, 2000);
  } catch (e) {
   const msg = e instanceof Error ? e.message : 'Error al cambiar contraseña';
   setPasswordMsgTone('danger');
   setPasswordMsg(msg);
   toast.error(msg);
  }
 }

 const safeActividad = Array.isArray(actividad) ? actividad : [];
 const safeNotificaciones = Array.isArray(notificaciones) ? notificaciones : [];

 const rolLabel = rolActivo === 'admin'
  ? 'Administrador'
  : rolActivo === 'evaluador'
  ? 'Evaluador'
  : rolActivo === 'evaluado'
  ? 'Evaluado'
  : '';

 const totalPendientes =
  resumen.compromisos_pendientes_aprobacion +
  resumen.mis_compromisos_enviados +
  resumen.notificaciones_no_leidas;

 const saludo = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
 })();

 return (
  <div className="space-y-6">
   {/* Header */}
   <Card className="animate-fadeIn">
    <div className="flex items-center justify-between gap-4 flex-wrap">
     <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
       <img
        src={`${import.meta.env.BASE_URL}escudo.png`}
        alt="Escudo de Carepa"
        className="h-20 w-auto"
        onError={(e) => {
         ;(e.target as HTMLImageElement).style.display = 'none';
         const parent = (e.target as HTMLImageElement).parentElement;
         if (parent && !parent.querySelector('.escudo-fallback')) {
          const span = document.createElement('span');
          span.className = 'escudo-fallback text-3xl font-heading font-bold text-inst-azul-osc';
          span.textContent = 'CAREPA';
          parent.appendChild(span);
         }
        }}
       />
      </div>
      <div>
       <h2 className="text-xl font-heading font-bold text-inst-azul-osc">
        {saludo}, {usuario?.nombres ?? ''} {usuario?.apellidos ?? ''}
       </h2>
       {rolLabel ? <p className="text-sm text-inst-texto-claro mt-0.5">Rol activo: {rolLabel}</p> : null}
       {totalPendientes > 0 ? (
        <p className="text-xs text-inst-texto-claro mt-1">
         Hoy tenés {totalPendientes} tarea{totalPendientes > 1 ? 's' : ''} pendiente{totalPendientes > 1 ? 's' : ''}.
        </p>
       ) : null}
      </div>
     </div>
     <Button
      variant="outline"
      size="sm"
      iconLeft={<span className="material-icons text-sm">lock</span>}
      onClick={() => setCambiandoPassword(!cambiandoPassword)}
     >
      Cambiar contraseña
     </Button>
    </div>

    {cambiandoPassword ? (
     <div className="mt-4 p-4 bg-inst-gris rounded-lg animate-slideUp">
      <h3 className="text-sm font-bold text-inst-azul-osc mb-3">Cambiar contraseña</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
       <Input
        label="Contraseña actual"
        type="password"
        value={passwordActual}
        onChange={e => setPasswordActual(e.target.value)}
        autoComplete="current-password"
       />
       <Input
        label="Nueva contraseña"
        type="password"
        value={passwordNueva}
        onChange={e => setPasswordNueva(e.target.value)}
        helperText="Mínimo 6 caracteres"
        autoComplete="new-password"
       />
       <Input
        label="Confirmar contraseña"
        type="password"
        value={passwordConfirmar}
        onChange={e => setPasswordConfirmar(e.target.value)}
        autoComplete="new-password"
       />
      </div>
      {passwordMsg ? (
       <Alert tone={passwordMsgTone} className="mt-3">
        {passwordMsg}
       </Alert>
      ) : null}
      <div className="flex gap-2 mt-3">
       <Button variant="primary" size="sm" onClick={cambiarPassword}>Guardar</Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => { setCambiandoPassword(false); setPasswordMsg(''); }}
       >
        Cancelar
       </Button>
      </div>
     </div>
    ) : null}
   </Card>

   {/* Compromisos pendientes */}
   {!cargando && (resumen.compromisos_pendientes_aprobacion > 0 || resumen.mis_compromisos_enviados > 0) ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {resumen.compromisos_pendientes_aprobacion > 0 && puedeAprobar ? (
      <Card className="bg-inst-amarillo-light border-amber-300 flex items-start gap-3 animate-slideUp">
       <span className="material-icons text-3xl text-amber-600">notifications_active</span>
       <div className="flex-1">
        <p className="font-heading font-bold text-amber-800">
         {resumen.compromisos_pendientes_aprobacion} compromiso{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} pendiente{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} de aprobación
        </p>
        <p className="text-sm text-amber-700 mt-0.5">Funcionarios han enviado compromisos que requieren su revisión.</p>
        <button
         onClick={() => navigate('/compromisos/aprobar')}
         className="text-sm text-amber-800 underline font-medium mt-1"
        >
         Ir a Aprobar Compromisos
        </button>
       </div>
      </Card>
     ) : null}
     {resumen.mis_compromisos_enviados > 0 ? (
      <Card className="bg-sky-50 border-sky-200 flex items-start gap-3 animate-slideUp">
       <span className="material-icons text-3xl text-sky-600">schedule</span>
       <div className="flex-1">
        <p className="font-heading font-bold text-sky-800">
         {resumen.mis_compromisos_enviados} compromiso{resumen.mis_compromisos_enviados > 1 ? 's' : ''} en espera
        </p>
        <p className="text-sm text-sky-700 mt-0.5">Sus compromisos enviados están pendientes de aprobación.</p>
        <button
         onClick={() => navigate('/compromisos/mios')}
         className="text-sm text-sky-800 underline font-medium mt-1"
        >
         Ver Mis Compromisos
        </button>
       </div>
      </Card>
     ) : null}
    </div>
   ) : null}

   {/* KPIs */}
   {cargando ? (
    <SkeletonKpiGrid count={Math.max(visibleCards.length, 4)} />
   ) : visibleCards.length > 0 ? (
    <div className={`grid gap-4 ${visibleCards.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
     {visibleCards.map((item) => (
      <KpiCard
       key={item.key}
       label={item.label}
       value={resumen[item.key as keyof Resumen] ?? 0}
       icon={<span className="material-icons text-2xl">{item.icon}</span>}
       tone={item.key === 'evaluaciones' ? 'success' : item.key === 'periodos' ? 'danger' : 'info'}
      />
     ))}
    </div>
   ) : null}

   {/* Admin charts */}
   {isAdmin && adminStats ? (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     {adminStats.evaluaciones_por_estado && adminStats.evaluaciones_por_estado.length > 0 ? (
      <Card>
       <h3 className="edl-section-title mb-4">Evaluaciones por Estado</h3>
       <ResponsiveContainer width="100%" height={250}>
        <PieChart>
         <Pie
          data={adminStats.evaluaciones_por_estado.map(d => ({ name: ESTADO_LABELS[d.estado] || d.estado, value: d.cantidad }))}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
         >
          {adminStats.evaluaciones_por_estado.map((_, i) => (
           <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
         </Pie>
         <Tooltip />
         <Legend />
        </PieChart>
       </ResponsiveContainer>
      </Card>
     ) : null}

     {adminStats.progreso_dependencias && adminStats.progreso_dependencias.length > 0 ? (
      <Card>
       <h3 className="edl-section-title mb-4">Progreso por Dependencia</h3>
       <ResponsiveContainer width="100%" height={250}>
        <BarChart data={adminStats.progreso_dependencias} layout="vertical">
         <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
         <YAxis type="category" dataKey="dependencia" width={140} tick={{ fontSize: 12 }} />
         <Tooltip formatter={(v) => `${v ?? 0}%`} />
         <Bar dataKey="progreso" fill="#0A2B5E" radius={[0, 4, 4, 0]} />
        </BarChart>
       </ResponsiveContainer>
      </Card>
     ) : null}
    </div>
   ) : null}

   {/* Notificaciones */}
   {!cargando && safeNotificaciones.length > 0 ? (
    <Card>
     <div className="flex items-center justify-between mb-4">
      <h3 className="edl-section-title">
       Notificaciones
       {resumen.notificaciones_no_leidas > 0 ? (
        <Badge tone="danger" className="ml-2">{resumen.notificaciones_no_leidas}</Badge>
       ) : null}
      </h3>
     </div>
     <div className="space-y-2">
      {safeNotificaciones.map(n => (
       <Alert key={n.id} tone={NOTI_COLOR[n.tipo]?.tone ?? 'info'} title={!n.leida ? n.titulo : undefined}>
        <div className="flex items-start justify-between gap-3">
         <div>
          {n.leida ? <p className="font-medium text-inst-texto-claro">{n.titulo}</p> : null}
          <p className="text-xs text-inst-texto-claro mt-0.5">{n.mensaje}</p>
         </div>
         {!n.leida ? (
          <Button variant="ghost" size="sm" onClick={() => marcarLeida(n.id)}>
           Marcar leída
          </Button>
         ) : null}
        </div>
       </Alert>
      ))}
     </div>
    </Card>
   ) : null}

   {/* Actividad reciente */}
   <Card>
    <h3 className="edl-section-title mb-4">Actividad reciente</h3>
    {cargando ? (
     <SkeletonText lines={5} />
    ) : safeActividad.length === 0 ? (
     <p className="text-sm text-inst-texto-claro py-4">No hay actividad registrada.</p>
    ) : (
     <div>
      {safeActividad.map((a) => (
       <div key={a.id} className="flex items-start gap-3 py-3 border-b border-inst-borde last:border-b-0">
        <div className="w-1 self-stretch bg-inst-rojo rounded-full flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
         <p className="text-sm text-inst-texto">{a.accion || a.entidad || 'Sin descripción'}</p>
         <p className="text-xs text-inst-texto-claro mt-0.5">{a.fecha}</p>
        </div>
        <Badge tone="neutral">{a.entidad || a.accion || '--'}</Badge>
       </div>
      ))}
     </div>
    )}
   </Card>
  </div>
 );
}

export default function Dashboard() {
 return (
  <DashboardErrorBoundary>
   <DashboardContent />
  </DashboardErrorBoundary>
 );
}
