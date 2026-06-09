import { useEffect, useState, Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type PaginatedData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
 { key: 'usuarios', label: 'Usuarios', icon: 'people', color: 'text-inst-azul', bg: 'bg-blue-100' },
 { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', color: 'text-inst-verde', bg: 'bg-green-100' },
 { key: 'periodos', label: 'Periodos activos', icon: 'calendar_today', color: 'text-inst-rojo', bg: 'bg-red-100' },
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
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
     <div className="flex items-center gap-3 mb-3">
      <span className="material-icons text-3xl text-red-600">error_outline</span>
      <h3 className="text-lg font-bold text-red-800">Error al cargar el panel</h3>
     </div>
     <p className="text-sm text-red-700 mb-3">{this.state.error}</p>
     <button onClick={() => this.setState({ hasError: false, error: '' })} className="edl-btn-primary text-sm">
      <span className="material-icons text-sm mr-1">refresh</span>
      Reintentar
     </button>
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
 const [cambiandoPassword, setCambiandoPassword] = useState(false);
 const [passwordActual, setPasswordActual] = useState('');
 const [passwordNueva, setPasswordNueva] = useState('');
 const [passwordConfirmar, setPasswordConfirmar] = useState('');
 const [passwordMsg, setPasswordMsg] = useState('');

 const isAdmin = roles?.some(r =>
  ['admin', 'admin_carepa', 'admin_entidad', 'jefe_personal'].includes(r.codigo)
 );
 const visibleCards = CARD_ITEMS.filter(item =>
  isAdmin || !ADMIN_ONLY_CARDS.includes(item.key)
 );

 const puedeAprobar = roles?.some(r =>
  ['evaluador', 'comision_evaluadora', 'admin_entidad', 'admin_carepa'].includes(r.codigo)
 );

 useEffect(() => {
  api.get<Resumen>('/dashboard/resumen').then(setResumen).catch(() => {});

  if (isAdmin) {
   api.get<AdminStats>('/dashboard/admin-stats').then(setAdminStats).catch(() => {});
  }

  api.get<PaginatedData<Actividad>>('/dashboard/actividad?por_pagina=10')
   .then(r => setActividad(Array.isArray(r?.data) ? r.data : []))
   .catch(() => setActividad([]));

  api.get<PaginatedData<Notificacion>>('/notificaciones?por_pagina=5')
   .then(r => setNotificaciones(Array.isArray(r?.data) ? r.data : []))
   .catch(() => setNotificaciones([]));
 }, [isAdmin]);

 async function marcarLeida(id: number) {
  try {
   await api.put(`/notificaciones/${id}/leer`);
   setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
   setResumen(prev => ({ ...prev, notificaciones_no_leidas: Math.max(0, prev.notificaciones_no_leidas - 1) }));
  } catch {}
 }

 async function cambiarPassword() {
  if (!passwordNueva || passwordNueva.length < 6) {
   setPasswordMsg('La contrasena debe tener al menos 6 caracteres');
   return;
  }
  if (passwordNueva !== passwordConfirmar) {
   setPasswordMsg('Las contrasenas no coinciden');
   return;
  }
  try {
   await api.put('/auth/password', {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
   });
   setPasswordMsg('Contrasena actualizada exitosamente');
   setPasswordActual('');
   setPasswordNueva('');
   setPasswordConfirmar('');
   setTimeout(() => { setCambiandoPassword(false); setPasswordMsg(''); }, 2000);
  } catch (e: any) {
   setPasswordMsg(e.message || 'Error al cambiar contrasena');
  }
 }

 const safeActividad = Array.isArray(actividad) ? actividad : [];
 const safeNotificaciones = Array.isArray(notificaciones) ? notificaciones : [];

 const rolLabel = rolActivo === 'evaluado'
  ? 'Evaluado'
  : rolActivo === 'evaluador'
  ? 'Evaluador'
  : rolActivo === 'jefe_personal'
  ? 'Jefe de Personal'
  : rolActivo === 'admin' || rolActivo === 'admin_carepa' || rolActivo === 'admin_entidad'
  ? 'Administrador'
  : rolActivo === 'comision_evaluadora'
  ? 'Comision Evaluadora'
  : '';

 return (
  <div>
   <div className="edl-card mb-6">
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
       <img
        src={`${import.meta.env.BASE_URL}escudo.png`}
        alt="Escudo Carepa"
        className="h-20 w-auto"
        onError={(e) => {
         (e.target as HTMLImageElement).style.display = 'none';
         const parent = (e.target as HTMLImageElement).parentElement;
         if (parent && !parent.querySelector('.escudo-fallback')) {
          const span = document.createElement('span');
          span.className = 'escudo-fallback text-3xl font-heading font-bold text-inst-azul';
          span.textContent = 'CAREPA';
          parent.appendChild(span);
         }
        }}
       />
      </div>
      <div>
       <h2 className="text-xl font-heading font-bold text-inst-azul">
        Bienvenido/a, {usuario?.nombres ?? ''} {usuario?.apellidos ?? ''}
       </h2>
       {rolLabel && (
        <p className="text-sm text-inst-texto-claro mt-0.5">Rol: {rolLabel}</p>
       )}
      </div>
     </div>
     <button
      onClick={() => setCambiandoPassword(!cambiandoPassword)}
      className="edl-btn-outline text-sm flex items-center gap-1"
     >
      <span className="material-icons text-sm">lock</span>
      Cambiar contrasena
     </button>
    </div>

    {cambiandoPassword && (
     <div className="mt-4 p-4 bg-inst-gris rounded-lg">
      <h3 className="text-sm font-bold text-inst-azul mb-3">Cambiar contrasena</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
       <div>
        <label className="edl-label">Contrasena actual</label>
        <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} className="edl-input" />
       </div>
       <div>
        <label className="edl-label">Nueva contrasena</label>
        <input type="password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)} className="edl-input" />
       </div>
       <div>
        <label className="edl-label">Confirmar contrasena</label>
        <input type="password" value={passwordConfirmar} onChange={e => setPasswordConfirmar(e.target.value)} className="edl-input" />
       </div>
      </div>
      {passwordMsg && (
       <p className={`text-sm mt-2 ${passwordMsg.includes('exitosamente') ? 'text-inst-verde' : 'text-inst-rojo'}`}>{passwordMsg}</p>
      )}
      <div className="flex gap-2 mt-3">
       <button onClick={cambiarPassword} className="edl-btn-primary text-sm">Guardar</button>
       <button onClick={() => { setCambiandoPassword(false); setPasswordMsg(''); }} className="edl-btn-outline text-sm">Cancelar</button>
      </div>
     </div>
    )}
   </div>

   {(resumen.compromisos_pendientes_aprobacion > 0 || resumen.mis_compromisos_enviados > 0) && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
     {resumen.compromisos_pendientes_aprobacion > 0 && puedeAprobar && (
      <div className="edl-card bg-yellow-50 border-yellow-300 flex items-center gap-3">
       <span className="material-icons text-3xl text-yellow-600">notifications_active</span>
       <div>
        <p className="font-heading font-bold text-yellow-800">
         {resumen.compromisos_pendientes_aprobacion} compromiso{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} pendiente{resumen.compromisos_pendientes_aprobacion > 1 ? 's' : ''} de aprobacion
        </p>
        <p className="text-sm text-yellow-700">Funcionarios han enviado compromisos que requieren su revision.</p>
        <button onClick={() => navigate('/compromisos/aprobar')} className="text-sm text-yellow-800 underline font-medium mt-1">
         Ir a Aprobar Compromisos
        </button>
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
        <p className="text-sm text-blue-700">Sus compromisos enviados estan pendientes de aprobacion.</p>
        <button onClick={() => navigate('/compromisos/mios')} className="text-sm text-blue-800 underline font-medium mt-1">
         Ver Mis Compromisos
        </button>
       </div>
      </div>
     )}
    </div>
   )}

   {visibleCards.length > 0 && (
    <div className={`grid gap-4 mb-6 ${visibleCards.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
     {visibleCards.map((item) => (
      <div key={item.key} className="edl-card flex items-center gap-4">
       <div className={`${item.bg} ${item.color} rounded-lg p-3`}>
        <span className="material-icons text-2xl">{item.icon}</span>
       </div>
       <div>
        <p className="text-2xl font-heading font-bold text-inst-azul">
         {resumen[item.key as keyof Resumen] ?? 0}
        </p>
        <p className="text-sm text-inst-texto-claro">{item.label}</p>
       </div>
      </div>
     ))}
    </div>
   )}

   {isAdmin && adminStats && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
     {adminStats.evaluaciones_por_estado && adminStats.evaluaciones_por_estado.length > 0 && (
      <div className="edl-card">
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
          label={({ name, value }: any) => `${name ?? ''}: ${value}`}
         >
          {adminStats.evaluaciones_por_estado.map((_, i) => (
           <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
         </Pie>
         <Tooltip />
         <Legend />
        </PieChart>
       </ResponsiveContainer>
      </div>
     )}

     {adminStats.progreso_dependencias && adminStats.progreso_dependencias.length > 0 && (
      <div className="edl-card">
       <h3 className="edl-section-title mb-4">Progreso por Dependencia</h3>
       <ResponsiveContainer width="100%" height={250}>
        <BarChart data={adminStats.progreso_dependencias} layout="vertical">
         <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
         <YAxis type="category" dataKey="dependencia" width={140} tick={{ fontSize: 12 }} />
         <Tooltip formatter={(v: any) => `${v}%`} />
         <Bar dataKey="progreso" fill="#0A2B5E" radius={[0, 4, 4, 0]} />
        </BarChart>
       </ResponsiveContainer>
      </div>
     )}
    </div>
   )}

   {safeNotificaciones.length > 0 && (
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
      {safeNotificaciones.map(n => (
       <div key={n.id} className={`p-3 rounded-lg border flex items-start gap-3 ${NOTI_COLOR[n.tipo] || 'bg-gray-50'}`}>
        <span className="material-icons text-lg mt-0.5">{NOTI_ICON[n.tipo] || 'info'}</span>
        <div className="flex-1 min-w-0">
         <p className={`text-sm font-medium ${n.leida ? 'text-inst-texto-claro' : 'text-inst-texto'}`}>{n.titulo}</p>
         <p className="text-xs text-inst-texto-claro mt-0.5">{n.mensaje}</p>
        </div>
        {!n.leida && (
         <button onClick={() => marcarLeida(n.id)} className="text-xs text-inst-azul hover:underline flex-shrink-0">
          Marcar leida
         </button>
        )}
       </div>
      ))}
     </div>
    </div>
   )}

   <div className="edl-card">
    <h3 className="edl-section-title mb-4">Actividad reciente</h3>
    {safeActividad.length === 0 ? (
     <p className="text-sm text-inst-texto-claro py-4">No hay actividad registrada.</p>
    ) : (
     <div className="space-y-0">
      {safeActividad.map((a) => (
       <div key={a.id} className="flex items-start gap-3 py-3 border-b border-inst-borde last:border-b-0">
        <div className="w-1 self-stretch bg-inst-rojo rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
         <p className="text-sm text-inst-texto">{a.accion || a.entidad || 'Sin descripcion'}</p>
         <p className="text-xs text-inst-texto-claro mt-0.5">{a.fecha}</p>
        </div>
        <span className="edl-badge bg-inst-gris text-inst-texto-claro text-xs">
         {a.entidad || a.accion || '--'}
        </span>
       </div>
      ))}
     </div>
    )}
   </div>
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
