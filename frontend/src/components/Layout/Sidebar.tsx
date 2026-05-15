import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
};

function getIcon(item: MenuItem): string {
  const key = (item.ruta || item.label || '').toLowerCase().replace(/^\/+/, '').split('/')[0];
  return ICON_MAP[key] || item.icon || 'chevron_right';
}

interface SidebarProps {
  menu: MenuItem[];
}

export default function Sidebar({ menu }: SidebarProps) {
  const [colapsado, setColapsado] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`bg-white border-r border-inst-borde min-h-screen transition-all duration-200 flex flex-col ${
        colapsado ? 'w-16' : 'w-56'
      }`}
    >
      {/* Botón colapsar */}
      <div className="flex items-center justify-end p-2 border-b border-inst-borde">
        <button
          onClick={() => setColapsado(!colapsado)}
          className="p-1.5 rounded hover:bg-inst-gris text-inst-texto-claro transition-colors"
          title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="material-icons text-xl">
            {colapsado ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Items del menú */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menu.map((item) => {
          const ruta = item.ruta || '/';
          const activo = location.pathname === ruta || location.pathname.startsWith(ruta + '/');
          const icono = getIcon(item);

          return (
            <button
              key={item.label}
              onClick={() => navigate(ruta)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                activo
                  ? 'bg-inst-azul/5 text-inst-azul font-medium border-r-2 border-inst-azul'
                  : 'text-inst-texto hover:bg-inst-gris'
              }`}
              title={colapsado ? item.label : undefined}
            >
              <span className="material-icons text-xl flex-shrink-0">{icono}</span>
              {!colapsado && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
