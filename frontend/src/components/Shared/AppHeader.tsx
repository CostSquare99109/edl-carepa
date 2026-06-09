import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuItem } from '../../lib/auth';
import RoleSelector from './RoleSelector';

const ICON_MAP: Record<string, string> = {
 dashboard: 'dashboard',
 inicio: 'home',
 entidades: 'domain',
 dependencias: 'account_tree',
 usuarios: 'people',
 periodos: 'calendar_today',
 metas: 'flag',
 concertaciones: 'handshake',
 evaluaciones: 'assessment',
 compromisos: 'task_alt',
 aprobar: 'fact_check',
 evidencias: 'folder_open',
 ausentismos: 'event_busy',
 movilidad: 'swap_horiz',
 reportes: 'summarize',
 cargas: 'upload_file',
 auditoria: 'history',
 parametros: 'tune',
 configuracion: 'settings',
 mejoramiento: 'trending_up',
 proponer: 'rate_review',
 gavel: 'gavel',
 fijacion: 'gavel',
};

function getTabIcon(item: MenuItem): string {
 const key = (item.ruta || item.label || '').toLowerCase().replace(/^\/+/, '').split('/')[0];
 return ICON_MAP[key] || item.icon || 'chevron_right';
}

interface AppHeaderProps {
 variant?: 'funcionario' | 'admin';
 onToggleSidebar?: () => void;
 breadcrumb?: string;
 notificationPath?: string;
}

export default function AppHeader({ variant = 'funcionario' }: AppHeaderProps) {
 const { usuario, menu, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const nombreCompleto = usuario
 ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`
 : 'Usuario';

 function isTabActivo(ruta: string): boolean {
 if (ruta === '/' || ruta === '') {
 return location.pathname === '/';
 }
 return location.pathname === ruta || location.pathname.startsWith(ruta + '/');
 }

 return (
 <header className="bg-white sticky top-0 z-40">
 <div className="flex items-center gap-4 px-6 py-3">
 <div className="flex-shrink-0">
 <img
 src={`${import.meta.env.BASE_URL}escudo.png`}
 alt="Carepa"
 className="h-11 w-auto"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none';
 const parent = (e.target as HTMLImageElement).parentElement;
 if (parent && !parent.querySelector('.escudo-fallback')) {
 const span = document.createElement('span');
 span.className = 'escudo-fallback text-2xl font-heading font-bold text-inst-azul';
 span.textContent = 'CAREPA';
 parent.appendChild(span);
 }
 }}
 />
 </div>
 <div className="flex-shrink-0">
 <h1 className="text-lg font-heading font-bold text-inst-azul tracking-wide leading-tight">
 Evaluacion del Desempeno Laboral
 </h1>
 <p className="text-[11px] text-inst-texto-claro font-sans leading-tight">
 Alcaldia de Carepa
 </p>
 </div>

 <nav className="flex-1 flex items-end justify-center gap-0 overflow-x-auto">
 {menu.map((item) => {
 const ruta = item.ruta || '/';
 const icono = getTabIcon(item);
 const activo = isTabActivo(ruta);
 return (
 <button
 key={item.label}
 onClick={() => navigate(ruta)}
 className={`edl-tab ${activo ? 'edl-tab-active' : ''}`}
 title={item.label}
 >
 <span className="material-icons text-lg">{icono}</span>
 <span>{item.label}</span>
 </button>
 );
 })}
 </nav>

 <RoleSelector variant="header" />

 <div className="flex items-center gap-3 flex-shrink-0">
 <div className="text-right">
 <p className="text-sm font-medium text-inst-azul">{nombreCompleto}</p>
 <p className="text-xs text-inst-texto-claro">{usuario?.cargo || ''}</p>
 </div>
 <button
 onClick={logout}
 className="edl-btn-outline text-xs flex items-center gap-1"
 title="Cerrar sesion"
 >
 <span className="material-icons text-base">logout</span>
 {variant === 'admin' ? 'Salir' : 'Cerrar sesion'}
 </button>
 </div>
 </div>
 <div className="edl-divider" />
 <div className="edl-divider-accent" />
 </header>
 );
}
