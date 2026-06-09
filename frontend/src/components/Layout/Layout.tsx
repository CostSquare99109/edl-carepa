import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleSelector from '../Shared/RoleSelector';
import type { MenuItem } from '../../lib/auth';

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
 consulta: 'search',
};

function getIcon(item: MenuItem): string {
 const key = (item.ruta || item.label || '').toLowerCase().replace(/^\/+/, '').split('/')[0];
 return ICON_MAP[key] || item.icon || 'chevron_right';
}

function getTabLabel(item: MenuItem): string {
 const map: Record<string, string> = {
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
 };
 return map[item.label] || item.label;
}

export default function Layout() {
 const { usuario, menu, logout } = useAuth();
 const location = useLocation();

 const nombreCompleto = usuario
  ? `${usuario.nombres} ${usuario.apellidos}`
  : 'Usuario';

 const activeTab = menu.find(item => {
  if (item.ruta === '/') return location.pathname === '/';
  return location.pathname.startsWith(item.ruta);
 });

 return (
  <div className="min-h-screen flex flex-col bg-inst-gris">
   <header className="bg-white border-b border-inst-borde sticky top-0 z-40">
    <div className="flex items-center gap-4 px-6 h-[56px] border-b border-inst-borde">
     <div className="flex items-center gap-3 flex-shrink-0">
      <img
       src={`${import.meta.env.BASE_URL}escudo.png`}
       alt="Carepa"
       className="h-10 w-auto"
       onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent && !parent.querySelector('.escudo-fallback')) {
         const span = document.createElement('span');
         span.className = 'escudo-fallback text-xl font-heading font-bold text-inst-azul';
         span.textContent = 'CAREPA';
         parent.appendChild(span);
        }
       }}
      />
      <div className="leading-tight">
       <h1 className="text-sm font-heading font-bold text-inst-azul tracking-wide">
        Evaluacion del Desempeno Laboral
       </h1>
       <p className="text-[10px] text-inst-texto-claro">
        Alcaldia de Carepa
       </p>
      </div>
     </div>

     <div className="flex-1" />

     <RoleSelector variant="header" />

     <div className="flex items-center gap-2 flex-shrink-0 border-l border-inst-borde pl-4">
      <div className="text-right">
       <p className="text-sm font-medium text-inst-azul truncate max-w-[160px]">
        {nombreCompleto}
       </p>
      </div>
      <button
       onClick={logout}
       className="p-1.5 rounded hover:bg-inst-gris text-inst-texto-claro hover:text-inst-rojo transition-colors"
       title="Cerrar sesion"
      >
       <span className="material-icons text-xl">logout</span>
      </button>
     </div>
    </div>

    {menu.length > 0 && (
     <nav className="flex items-center gap-0 px-6 overflow-x-auto">
      {menu.map((item) => {
       const isActive = activeTab?.ruta === item.ruta;
       return (
        <Link
         key={item.ruta}
         to={item.ruta}
         className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
          isActive
           ? 'border-inst-rojo text-inst-azul'
           : 'border-transparent text-inst-texto-claro hover:text-inst-azul hover:bg-inst-gris/50'
         }`}
        >
         <span className="material-icons text-base">
          {getIcon(item)}
         </span>
         {getTabLabel(item)}
        </Link>
       );
      })}
     </nav>
    )}
   </header>

   <main className="flex-1 px-6 py-6">
    <Outlet />
   </main>

   <footer className="text-center py-4 border-t border-inst-borde text-xs text-inst-texto-claro bg-white">
    EDL-CAREPA &copy; {new Date().getFullYear()} — Alcaldia de Carepa
   </footer>
  </div>
 );
}
