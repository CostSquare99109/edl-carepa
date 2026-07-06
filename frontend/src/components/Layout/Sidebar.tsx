import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuItem } from '../../lib/auth';
import { useContadores } from '../../lib/hooks/useContadores';

const ICON_MAP: Record<string, string> = {
  dashboard: 'dashboard',
  inicio: 'home',
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
  solicitudes: 'sync_alt',
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
  isOpen: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, isMobileOpen, onClose }: SidebarProps) {
  const { menu } = useAuth();
  const sidebarRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const sections = groupMenu(menu);
  const contadores = useContadores();

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobileOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function renderItem(item: MenuItem): ReactNode {
    const rutaConDashboard = item.ruta === '/' ? '/dashboard' : `/dashboard${item.ruta}`;
    const isActive =
      item.ruta === '/'
        ? location.pathname === '/dashboard'
        : location.pathname === rutaConDashboard || location.pathname.startsWith(rutaConDashboard + '/');
    const badge = getBadge(item, contadores);
    const label = getLabel(item);
    const icon = getIcon(item);

        return (
      <li key={item.ruta}>
        <Link
          to={rutaConDashboard}
          aria-current={isActive ? 'page' : undefined}
          title={!isOpen ? label : undefined}
          className={`group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
            isOpen ? 'px-3 py-2 justify-start' : 'px-0 py-2 justify-center'
          } ${
            isActive
              ? 'bg-inst-azul-osc text-white shadow-sm'
              : 'text-inst-texto hover:bg-inst-azul-osc-light hover:text-inst-azul-osc'
          }`}
        >
          <span className={`material-icons text-xl flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-inst-texto-claro group-hover:text-inst-azul-osc'}`}>
            {icon}
          </span>
          <span
            className={`flex-1 truncate transition-all duration-200 ease-out overflow-hidden ${
              isOpen
                ? 'opacity-100 max-w-[200px] ml-2'
                : 'opacity-0 max-w-0 ml-0'
            }`}
          >
            {label}
          </span>
          {badge && isOpen ? (
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-white text-inst-azul-osc'
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
          {badge && !isOpen ? (
            <span
              className={`absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold ring-2 ring-white ${
                badge.tone === 'danger'
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
          {isActive && isOpen ? (
            <span className="w-1.5 h-1.5 rounded-full bg-inst-amarillo flex-shrink-0" aria-hidden="true" />
          ) : null}
        </Link>
      </li>
    );
  }

  return (
    <>
      {/* Mobile scrim - only on small screens when drawer is open */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        id="sidebar-main"
        aria-label="Menú lateral"
        aria-hidden={!isMobileOpen}
        className={`
          bg-white border-r border-inst-borde flex flex-col overflow-hidden shadow-xl lg:shadow-none
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'w-64' : 'w-16'}
          /* Desktop: flex sibling that pushes content */
          lg:relative lg:z-auto lg:translate-x-0 lg:flex-shrink-0
          /* Mobile: fixed drawer that slides in/out */
          fixed inset-y-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header / brand area */}
        <div className="flex items-center h-14 border-b border-inst-borde bg-white flex-shrink-0">
          <div
            className={`flex items-center gap-2 min-w-0 flex-1 overflow-hidden px-3 transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
            }`}
          >
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
                  fb.className = 'escudo-fb h-8 w-8 rounded-lg bg-inst-azul-osc text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0';
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

          {/* Collapsed brand mark (desktop only) - always visible when sidebar is collapsed */}
          <div
            className={`hidden lg:flex items-center justify-center w-full transition-opacity duration-200 ${
              isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Carepa"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('.escudo-fb-collapsed')) {
                  const fb = document.createElement('div');
                  fb.className = 'escudo-fb-collapsed h-8 w-8 rounded-lg bg-inst-azul-osc text-white flex items-center justify-center font-heading font-bold text-sm';
                  fb.textContent = 'C';
                  parent.appendChild(fb);
                }
              }}
            />
          </div>

          {/* Mobile close button inside drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md hover:bg-inst-gris-med text-inst-texto-claro hover:text-inst-azul-osc transition-colors mx-1"
            aria-label="Cerrar menú lateral"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <nav
          className={`flex-1 overflow-y-auto py-4 space-y-5 transition-all duration-200 ${
            isOpen ? 'px-2 opacity-100' : 'px-1.5 opacity-100'
          }`}
          aria-label="Menú principal"
        >
          {sections.map((section) => (
            <div key={section.title}>
              <p
                className={`mb-1.5 text-[10px] font-semibold text-inst-texto-claro uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  isOpen ? 'opacity-100 max-h-4 px-3' : 'opacity-0 max-h-0 px-0'
                }`}
              >
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => renderItem(item))}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className={`border-t border-inst-borde bg-white flex-shrink-0 transition-all duration-200 ${
            isOpen ? 'p-3 opacity-100' : 'p-2 opacity-0 max-h-0 overflow-hidden border-t-0'
          }`}
        >
          <p className="text-[10px] text-inst-texto-claro leading-tight whitespace-nowrap">
            EDL Digital<br />
            <span className="text-inst-azul-osc font-semibold">Carepa</span>
          </p>
        </div>
      </aside>
    </>
  );
}