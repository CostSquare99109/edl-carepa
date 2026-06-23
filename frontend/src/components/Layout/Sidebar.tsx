import { useEffect, useState, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuItem } from '../../lib/auth';
import { Badge } from '../ui';
import { useContadores } from '../../lib/hooks/useContadores';

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
 mis_evidencias: 'folder_open',
 ausentismos: 'event_busy',
 movilidad: 'swap_horiz',
 reportes: 'summarize',
 admin_reportes: 'summarize',
 cargas: 'upload_file',
 carga_usuarios: 'upload_file',
 auditoria: 'history',
 parametros: 'tune',
 configuracion: 'settings',
 admin_configuracion: 'settings',
 notificaciones: 'notifications',
 admin_notificaciones: 'notifications',
 mejoramiento: 'trending_up',
 proponer: 'rate_review',
 consulta: 'search',
 consulta_funcionario: 'search',
 comision: 'gavel',
 gavel: 'gavel',
 fijacion: 'gavel',
 fijar: 'gavel',
 ajustar: 'tune',
 evaluar: 'rate_review',
 mios: 'inbox',
 concertar: 'edit',
 ver: 'visibility',
 mejores: 'trending_up',
 admin_home: 'space_dashboard',
 admin_usuarios: 'people',
 admin_dependencias: 'account_tree',
 admin_compromisos: 'task_alt',
 admin_evaluaciones: 'assessment',
};

const LABEL_MAP: Record<string, string> = {
 'Compromisos y Competencias': 'Compromisos',
 'Concertar Compromisos': 'Concertar',
 'Ver Compromisos por Aprobar': 'Por Aprobar',
 'Ver Compromisos Propuestos por Evaluado': 'Propuestos',
 'Ajustar Compromisos Concertados': 'Ajustar',
 'Compromisos de Mejoramiento': 'Mejoramiento',
 'Fijacion Unilateral': 'Fijacion',
 'Proponer Compromisos': 'Proponer',
 'Carga Masiva': 'Carga Masiva',
 'Consulta Funcionario': 'Consulta',
 'Comision Evaluadora': 'Comision',
 'Mis Compromisos': 'Mis Compromisos',
 'Mis Evidencias': 'Mis Evidencias',
 'Panel del Evaluador': 'Evaluar',
};

function getIcon(item: MenuItem): string {
 const key = (item.ruta || item.label || '').toLowerCase().replace(/^\/+/, '').split('/')[0];
 return ICON_MAP[key] || item.icon || 'chevron_right';
}

function getLabel(item: MenuItem): string {
 return LABEL_MAP[item.label] || item.label;
}

interface Section {
 title: string;
 items: MenuItem[];
}

function groupMenu(menu: MenuItem[]): Section[] {
 const inicioItems: MenuItem[] = [];
 const compromisosItems: MenuItem[] = [];
 const evaluacionesItems: MenuItem[] = [];
 const evidenciasItems: MenuItem[] = [];
 const adminItems: MenuItem[] = [];
 const consultasItems: MenuItem[] = [];

 menu.forEach((item) => {
 const ruta = (item.ruta || '').toLowerCase();
 const label = (item.label || '').toLowerCase();
 if (ruta === '/' || ruta === '/inicio' || label.includes('inicio')) {
 inicioItems.push(item);
 } else if (
 ruta.includes('compromiso') ||
 ruta.includes('concertar') ||
 ruta.includes('concertacion') ||
 ruta.includes('propuesto') ||
 ruta.includes('fijacion') ||
 ruta.includes('mejoramiento') ||
 ruta.includes('proponer') ||
 ruta.includes('ajustar')
 ) {
 compromisosItems.push(item);
 } else if (
 ruta.includes('evaluacion') ||
 ruta.includes('evaluar') ||
 ruta.includes('comision')
 ) {
 evaluacionesItems.push(item);
 } else if (
 ruta.includes('evidencia') ||
 ruta.includes('ausentismo') ||
 ruta.includes('movilidad')
 ) {
 evidenciasItems.push(item);
 } else if (
 ruta.includes('admin') ||
 ruta.includes('usuario') ||
 ruta.includes('periodo') ||
 ruta.includes('dependencia') ||
 ruta.includes('meta') ||
 ruta.includes('carga') ||
 ruta.includes('config') ||
 ruta.includes('parametro')
 ) {
 adminItems.push(item);
 } else if (
 ruta.includes('reporte') ||
 ruta.includes('consulta') ||
 ruta.includes('notificacion')
 ) {
 consultasItems.push(item);
 } else {
 inicioItems.push(item);
 }
 });

 const sections: Section[] = [];
 if (inicioItems.length) sections.push({ title: 'General', items: inicioItems });
 if (compromisosItems.length) sections.push({ title: 'Compromisos', items: compromisosItems });
 if (evaluacionesItems.length) sections.push({ title: 'Evaluaciones', items: evaluacionesItems });
 if (evidenciasItems.length) sections.push({ title: 'Seguimiento', items: evidenciasItems });
 if (adminItems.length) sections.push({ title: 'Administracion', items: adminItems });
 if (consultasItems.length) sections.push({ title: 'Consultas y reportes', items: consultasItems });
 return sections;
}

/**
 * Calcula el badge que se muestra junto a un item del menú,
 * según los contadores globales (notificaciones, compromisos, etc).
 */
function getBadge(item: MenuItem, c: ReturnType<typeof useContadores>): { count: number; tone: 'danger' | 'warning' | 'info' } | null {
 const ruta = (item.ruta || '').toLowerCase();
 const label = (item.label || '').toLowerCase();

 if (ruta.includes('notificacion') && c.notificaciones_no_leidas > 0) {
 return { count: c.notificaciones_no_leidas, tone: 'danger' };
 }
 if ((label.includes('por aprobar') || ruta.includes('aprobar')) && c.compromisos_pendientes_aprobacion > 0) {
 return { count: c.compromisos_pendientes_aprobacion, tone: 'warning' };
 }
 if ((label.includes('mis compromisos') || ruta.includes('mios')) && c.mis_compromisos_enviados > 0) {
 return { count: c.mis_compromisos_enviados, tone: 'info' };
 }
 if ((label.includes('evaluar') || ruta.includes('evaluar') || ruta.includes('panel')) && c.evaluaciones_pendientes > 0) {
 return { count: c.evaluaciones_pendientes, tone: 'warning' };
 }
 return null;
}

interface SidebarProps {
 collapsed: boolean;
 onToggle: () => void;
 mobileOpen: boolean;
 onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
 const { menu } = useAuth();
 const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
 const sidebarRef = useRef<HTMLElement>(null);
 const location = useLocation();
 const sections = groupMenu(menu);
 const contadores = useContadores();

 useEffect(() => {
 function handleResize() {
 setIsDesktop(window.innerWidth >= 1024);
 if (window.innerWidth >= 1024) {
 onMobileClose();
 }
 }
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, [onMobileClose]);

 useEffect(() => {
 onMobileClose();
 }, [location.pathname, onMobileClose]);

 const widthClass = collapsed ? 'lg:w-[72px]' : 'lg:w-64';
 const showLabels = !collapsed;

 function renderItem(item: MenuItem): ReactNode {
 const isActive =
 item.ruta === '/'
 ? location.pathname === '/'
 : location.pathname === item.ruta || location.pathname.startsWith(item.ruta + '/');
 const badge = getBadge(item, contadores);
 return (
 <li key={item.ruta}>
 <Link
 to={item.ruta}
 title={!showLabels ? getLabel(item) : undefined}
 aria-current={isActive ? 'page' : undefined}
 className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
 isActive
 ? 'bg-inst-verde text-white shadow-sm'
 : 'text-inst-texto hover:bg-inst-verde-light hover:text-inst-verde'
 }`}
 >
 <span className={`material-icons text-xl flex-shrink-0 ${
 isActive ? 'text-white' : 'text-inst-texto-claro group-hover:text-inst-verde'
 }`}>
 {getIcon(item)}
 </span>
 {showLabels && (
 <>
 <span className="flex-1 truncate">{getLabel(item)}</span>
 {badge ? (
 <span
 className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
 isActive
 ? 'bg-white text-inst-verde'
 : badge.tone === 'danger'
 ? 'bg-inst-rojo text-white'
 : badge.tone === 'warning'
 ? 'bg-amber-500 text-white'
 : 'bg-sky-500 text-white'
 }`}
 aria-label={`${badge.count} pendientes`}
 >
 {badge.count > 99 ? '99+' : badge.count}
 </span>
 ) : null}
 {showLabels && isActive ? (
 <span className="w-1.5 h-1.5 rounded-full bg-inst-amarillo flex-shrink-0" aria-hidden="true" />
 ) : null}
 </>
 )}
 {!showLabels && badge ? (
 <span
 className={`absolute ml-7 mt-[-18px] inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold ${
 badge.tone === 'danger' ? 'bg-inst-rojo text-white'
 : badge.tone === 'warning' ? 'bg-amber-500 text-white'
 : 'bg-sky-500 text-white'
 }`}
 aria-label={`${badge.count} pendientes`}
 >
 {badge.count > 9 ? '9+' : badge.count}
 </span>
 ) : null}
 </Link>
 </li>
 );
 }

 const sidebarContent = (
 <>
 <div className="hidden lg:flex items-center justify-between h-14 px-3 border-b border-inst-borde bg-white gap-2">
 {showLabels ? (
 <div className="flex items-center gap-2 min-w-0">
 <img
 src={`${import.meta.env.BASE_URL}escudo.png`}
 alt="Carepa"
 className="h-8 w-8 object-contain flex-shrink-0"
 onError={(e) => {
 const img = e.target as HTMLImageElement;
 img.style.display = 'none';
 const parent = img.parentElement;
 if (parent && !parent.querySelector('.escudo-fb')) {
 const fb = document.createElement('div');
 fb.className = 'escudo-fb h-8 w-8 rounded-lg bg-inst-verde text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0';
 fb.textContent = 'C';
 parent.prepend(fb);
 }
 }}
 />
 <div className="leading-tight min-w-0">
 <h1 className="text-sm font-heading font-bold text-inst-azul-osc truncate">EDL Digital</h1>
 <p className="text-[10px] text-inst-texto-claro truncate">Carepa</p>
 </div>
 </div>
 ) : (
 <img
 src={`${import.meta.env.BASE_URL}escudo.png`}
 alt="Carepa"
 className="h-8 w-8 object-contain"
 onError={(e) => {
 const img = e.target as HTMLImageElement;
 img.style.display = 'none';
 const parent = img.parentElement;
 if (parent && !parent.querySelector('.escudo-fb')) {
 const fb = document.createElement('div');
 fb.className = 'escudo-fb h-8 w-8 rounded-lg bg-inst-verde text-white flex items-center justify-center font-heading font-bold text-sm';
 fb.textContent = 'C';
 parent.appendChild(fb);
 }
 }}
 />
 )}
 <button
 onClick={onToggle}
 className="p-1.5 rounded-md hover:bg-inst-gris-med text-inst-texto-claro hover:text-inst-verde transition-colors flex-shrink-0"
 title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
 aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
 >
 <span className="material-icons text-xl">
 {collapsed ? 'chevron_right' : 'chevron_left'}
 </span>
 </button>
 </div>

 <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-inst-borde bg-white">
 <span className="font-heading font-bold text-inst-azul-osc text-sm">
 Navegación
 </span>
 <button
 onClick={onMobileClose}
 className="p-1.5 rounded-md hover:bg-inst-gris-med text-inst-texto-claro"
 aria-label="Cerrar menú"
 >
 <span className="material-icons text-xl">close</span>
 </button>
 </div>

 <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5" aria-label="Menú principal">
 {sections.map((section) => (
 <div key={section.title}>
 {showLabels && (
 <p className="px-3 mb-1.5 text-[10px] font-semibold text-inst-texto-claro uppercase tracking-wider">
 {section.title}
 </p>
 )}
 <ul className="space-y-0.5">
 {section.items.map((item) => renderItem(item))}
 </ul>
 </div>
 ))}
 </nav>

 <div className="border-t border-inst-borde p-3 bg-white">
 {showLabels ? (
 <p className="text-[10px] text-inst-texto-claro leading-tight">
 EDL Digital<br />
 <span className="text-inst-verde font-semibold">Carepa</span>
 </p>
 ) : (
 <div className="flex justify-center">
 <span className="w-2 h-2 rounded-full bg-inst-verde" />
 </div>
 )}
 </div>
 </>
 );

 return (
 <>
 {mobileOpen && (
 <div
 className="lg:hidden fixed inset-0 bg-black/40 z-30"
 onClick={onMobileClose}
 aria-hidden="true"
 />
 )}

 <aside
 ref={sidebarRef}
 id="sidebar-main"
 aria-label="Menú lateral"
 className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-inst-borde flex flex-col z-40 transition-transform duration-200 w-72 ${widthClass} ${
 mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
 } shadow-xl lg:shadow-none`}
 >
 {sidebarContent}
 </aside>
 </>
 );
}
