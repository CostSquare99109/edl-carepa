import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/* ─────────────────────────────────────────────
 Menú lateral
 ───────────────────────────────────────────── */

const SIDEBAR_MENU = [
  { key: 'dashboard', label: 'Tablero de Control', icon: 'dashboard', path: '/admin' },
  { key: 'usuarios', label: 'Usuarios', icon: 'people', path: '/admin/usuarios' },
  { key: 'dependencias', label: 'Dependencias', icon: 'account_tree', path: '/admin/dependencias' },
  { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', path: '/admin/evaluaciones' },
  { key: 'reportes', label: 'Reportes', icon: 'summarize', path: '/admin/reportes' },
  { key: 'configuracion', label: 'Configuración', icon: 'settings', path: '/admin/configuracion' },
];

/* ─────────────────────────────────────────────
 Layout AdminLTE — Sidebar + Header + Outlet
 ───────────────────────────────────────────── */

export default function AdminDashboard() {
  const { usuario, roles, rolActivo, cambiarRol, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [rolDropdownOpen, setRolDropdownOpen] = useState(false);
  const location = useLocation();

  const nombreCompleto = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Administrador';

  const rolesAdmin = roles?.filter(r =>
    ['admin_cnsc', 'admin_entidad'].includes(r.codigo)
  ) || [];

  /* Detectar menú activo según la ruta */
  const activeMenu = SIDEBAR_MENU.find(m => {
    if (m.path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(m.path);
  })?.key || 'dashboard';

  /* ── Sidebar ── */
  const sidebar = (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40
        w-[250px] bg-[#003366] text-white
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-center border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <span className="material-icons text-2xl text-amber-400">account_balance</span>
          </div>
          <div className="leading-tight">
            <p className="font-heading font-bold text-sm tracking-wide">CNSC</p>
            <p className="text-[10px] text-white/60">Panel de Administración</p>
          </div>
        </div>
      </div>

      {/* Perfil breve */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-inst-azul flex items-center justify-center text-sm font-bold">
            {nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{nombreCompleto}</p>
            <p className="text-[11px] text-white/50 truncate">
              {rolActivo === 'admin_cnsc' ? 'Admin CNSC' : 'Admin Entidad'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
          Navegación Principal
        </p>
        {SIDEBAR_MENU.map((item) => {
          const isActive = activeMenu === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                text-sm transition-all duration-150
                ${isActive
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}
              `}
            >
              <span className="material-icons text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Versión */}
      <div className="px-4 py-3 border-t border-white/10 text-center">
        <p className="text-[10px] text-white/30">EDL-CNSC v1.0.0</p>
      </div>
    </aside>
  );

  /* ── Header ── */
  const header = (
    <header className="h-[60px] bg-white border-b border-inst-borde flex items-center px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-inst-gris transition-colors mr-3 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <span className="material-icons text-inst-texto">menu</span>
      </button>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-inst-gris transition-colors mr-3 hidden lg:inline-flex"
        aria-label="Toggle sidebar"
      >
        <span className="material-icons text-inst-texto">
          {sidebarOpen ? 'menu_open' : 'menu'}
        </span>
      </button>

      {/* Breadcrumb dinámico */}
      <div className="hidden sm:flex items-center gap-1 text-sm text-inst-texto-claro">
        <Link to="/admin" className="material-icons text-base text-inst-azul hover:opacity-70">home</Link>
        <span>/</span>
        <span className="text-inst-texto font-medium">
          {SIDEBAR_MENU.find(m => m.key === activeMenu)?.label || 'Admin'}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selector de rol */}
      {rolesAdmin.length > 1 && (
        <div className="relative mr-2">
          <button
            onClick={() => { setRolDropdownOpen(!rolDropdownOpen); setNotificacionesOpen(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-inst-borde text-sm hover:bg-inst-gris transition-colors"
          >
            <span className="material-icons text-base text-inst-azul">admin_panel_settings</span>
            <span className="hidden sm:inline text-inst-texto font-medium">
              {rolActivo === 'admin_cnsc' ? 'Admin CNSC' : 'Admin Entidad'}
            </span>
            <span className="material-icons text-base text-inst-texto-claro">
              {rolDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {rolDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRolDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-inst-borde z-20 py-1">
                {rolesAdmin.map(r => (
                  <button
                    key={r.codigo}
                    onClick={async () => {
                      try { await cambiarRol(r.codigo); } catch {}
                      setRolDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2 text-sm hover:bg-inst-gris transition-colors
                      ${rolActivo === r.codigo ? 'font-semibold text-inst-azul' : 'text-inst-texto'}
                    `}
                  >
                    {r.nombre}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Notificaciones */}
      <div className="relative mr-2">
        <button
          onClick={() => { setNotificacionesOpen(!notificacionesOpen); setRolDropdownOpen(false); }}
          className="relative p-2 rounded-lg hover:bg-inst-gris transition-colors"
        >
          <span className="material-icons text-inst-texto">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-inst-rojo rounded-full" />
        </button>
        {notificacionesOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotificacionesOpen(false)} />
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-inst-borde z-20">
              <div className="px-4 py-3 border-b border-inst-borde">
                <p className="font-heading font-semibold text-inst-azul text-sm">Notificaciones</p>
              </div>
              <div className="py-2 max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-inst-gris transition-colors cursor-pointer border-l-4 border-inst-azul">
                  <p className="text-sm font-medium text-inst-texto">Nuevo evaluador registrado</p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">Hace 5 minutos</p>
                </div>
                <div className="px-4 py-3 hover:bg-inst-gris transition-colors cursor-pointer border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-inst-texto">Evaluación pendiente de aprobación</p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">Hace 1 hora</p>
                </div>
                <div className="px-4 py-3 hover:bg-inst-gris transition-colors cursor-pointer border-l-4 border-inst-verde">
                  <p className="text-sm font-medium text-inst-texto">Periodo 2025-I activado</p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">Hace 3 horas</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-inst-borde text-center">
                <Link to="/admin/reportes" onClick={() => setNotificacionesOpen(false)}
                  className="text-xs text-inst-azul hover:underline font-medium">
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Nombre usuario */}
      <div className="hidden md:flex items-center gap-2 mr-2">
        <span className="text-sm font-medium text-inst-texto">{nombreCompleto}</span>
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={logout}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-inst-rojo hover:bg-red-50 transition-colors"
        title="Cerrar sesión"
      >
        <span className="material-icons text-base">logout</span>
        <span className="hidden sm:inline">Salir</span>
      </button>
    </header>
  );

  /* ── Layout completo con Outlet ── */
  return (
    <div className="min-h-screen bg-inst-gris">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebar}

      {/* Contenedor derecho */}
      <div
        className={`
          transition-all duration-300
          ${sidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-0'}
        `}
      >
        {/* Header */}
        {header}

        {/* Contenido dinámico — aquí se renderizan las sub-páginas */}
        <Outlet />

        {/* Footer */}
        <footer className="text-center py-4 border-t border-inst-borde text-xs text-inst-texto-claro">
          EDL-CNSC © 2025 — Comisión Nacional del Servicio Civil
        </footer>
      </div>
    </div>
  );
}
