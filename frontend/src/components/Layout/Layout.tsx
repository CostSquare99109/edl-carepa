import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import RoleSelector from '../Shared/RoleSelector';
import NotificationBell from '../Shared/NotificationBell';

// Breakpoint aligned with Tailwind's `lg` (1024px)
const LG_BREAKPOINT = 1024;

export default function Layout() {
  const navigate = useNavigate();
  const { usuario, rolActivo, logout } = useAuth();

  // Desktop sidebar expanded/collapsed state.
  // Always starts OPEN by default. User preference is persisted after they toggle.
  // We use a version key so any stale "collapsed" preference from previous builds
  // is ignored once and the user gets the intended default behavior.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const LAYOUT_VERSION = 'v2-open-by-default';
    if (localStorage.getItem('edl_layout_version') !== LAYOUT_VERSION) {
      localStorage.setItem('edl_layout_version', LAYOUT_VERSION);
      localStorage.setItem('edl_sidebar_open', '1');
      return true;
    }
    return localStorage.getItem('edl_sidebar_open') !== '0';
  });

  // Mobile drawer open state (separate from desktop collapse)
  const [mobileOpen, setMobileOpen] = useState(false);

  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('edl_layout_version', 'v2-open-by-default');
    localStorage.setItem('edl_sidebar_open', sidebarOpen ? '1' : '0');
  }, [sidebarOpen]);

  // Close mobile drawer when crossing up into desktop breakpoint
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= LG_BREAKPOINT && mobileOpen) {
        setMobileOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  useEffect(() => {
    if (!menuPerfilAbierto) return;
    function handleClickOutside(e: MouseEvent) {
      if (perfilRef.current && !perfilRef.current.contains(e.target as Node)) {
        setMenuPerfilAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuPerfilAbierto]);

  function irAPerfil() {
    setMenuPerfilAbierto(false);
    navigate('/dashboard/perfil');
    }

  const nombreCompleto = usuario
    ? `${usuario.primer_nombre || ''} ${usuario.primer_apellido || ''}`.trim() || usuario.nombre_completo || 'Usuario'
    : 'Usuario';
  const iniciales = usuario
    ? `${(usuario.primer_nombre || '?')[0]}${(usuario.primer_apellido || '?')[0]}`.toUpperCase()
    : '?';

  /**
   * Header hamburger handler.
   *
   * - On mobile (<lg): toggles the slide-in drawer (sidebar overlays content).
   * - On desktop (>=lg): toggles the collapsed/expanded sidebar width.
   *   The sidebar and main column are flex siblings, so they move coordinately
   *   without gaps or overlap.
   */
  function handleHamburgerClick() {
    if (typeof window !== 'undefined' && window.innerWidth < LG_BREAKPOINT) {
      setMobileOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  }

  function closeMobileDrawer() {
    setMobileOpen(false);
  }

  const hamburgerLabel = sidebarOpen ? 'Colapsar menú lateral' : 'Expandir menú lateral';

  return (
    // The root flex container holds BOTH sidebar and main column as siblings.
    // This is what makes them move coordinately: when the sidebar's width
    // changes, the flex-1 main column reflows automatically.
    <div className="min-h-screen bg-inst-gris flex">
      <Sidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileOpen}
        onClose={closeMobileDrawer}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-inst-borde sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 h-14">
            {/* Hamburger button - ALWAYS in the header, ALWAYS at the start,
                NEVER moves out of the header. Toggles sidebar open/close. */}
            <button
              type="button"
              onClick={handleHamburgerClick}
              aria-label={hamburgerLabel}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-main"
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-inst-texto-claro hover:bg-inst-gris-med hover:text-inst-azul-osc active:bg-inst-azul-osc-light transition-colors focus:outline-none focus:ring-2 focus:ring-inst-azul-osc/30"
            >
              <span className="material-icons text-2xl leading-none">menu</span>
            </button>

            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Carepa"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain flex-shrink-0"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const wrap = document.createElement('div');
                  wrap.className = 'escudo-fallback flex items-center gap-2';
                  wrap.innerHTML = `
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-inst-azul-osc flex items-center justify-center text-white font-heading font-bold text-sm">C</div>
                    <div class="leading-tight hidden sm:block">
                      <h1 class="text-sm font-heading font-bold text-inst-azul-osc tracking-wide">EDL Carepa</h1>
                      <p class="text-[10px] text-inst-texto-claro">Alcaldia de Carepa</p>
                    </div>
                  `;
                  parent.appendChild(wrap);
                }
              }}
            />
            <div className="leading-tight hidden sm:block">
              <h1 className="text-sm font-heading font-bold text-inst-azul-osc tracking-wide">
                EDL Carepa
              </h1>
              <p className="text-[10px] text-inst-texto-claro">
                Evaluacion del Desempeno Laboral
              </p>
            </div>

            <div className="flex-1" />

            <div className="hidden md:block">
              <RoleSelector variant="header" />
            </div>

            <NotificationBell />

            <div className="relative flex items-center gap-2 flex-shrink-0 border-l border-inst-borde pl-3 sm:pl-4" ref={perfilRef}>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-inst-azul-osc truncate max-w-[140px]">
                  {nombreCompleto}
                </p>
                {rolActivo && (
                  <p className="text-[10px] text-inst-texto-claro truncate max-w-[140px]">
                    {rolActivo.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMenuPerfilAbierto((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuPerfilAbierto}
                aria-label="Abrir menú de perfil"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-inst-azul-osc to-inst-azul-osc-hover text-white font-heading font-bold text-xs flex items-center justify-center hover:shadow-md transition-shadow ring-2 ring-white focus:outline-none focus:ring-inst-azul-osc"
              >
                {iniciales}
              </button>
              {menuPerfilAbierto ? (
                <div
                  role="menu"
                  aria-label="Opciones de perfil"
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-inst-borde overflow-hidden z-50 animate-fadeIn"
                >
                  <div className="px-4 py-3 bg-inst-gris border-b border-inst-borde">
                    <p className="text-sm font-semibold text-inst-azul-osc truncate">{nombreCompleto}</p>
                    <p className="text-xs text-inst-texto-claro truncate">{usuario?.email || ''}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={irAPerfil}
                    className="w-full text-left px-4 py-2 text-sm text-inst-texto hover:bg-inst-azul-osc-light hover:text-inst-azul-osc flex items-center gap-2 focus:outline-none focus:bg-inst-azul-osc-light focus:text-inst-azul-osc"
                  >
                    <span className="material-icons text-base">person</span>
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={irAPerfil}
                    className="w-full text-left px-4 py-2 text-sm text-inst-texto hover:bg-inst-azul-osc-light hover:text-inst-azul-osc flex items-center gap-2 focus:outline-none focus:bg-inst-azul-osc-light focus:text-inst-azul-osc"
                  >
                    <span className="material-icons text-base">lock_reset</span>
                    Cambiar contraseña
                  </button>
                  <div className="border-t border-inst-borde" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setMenuPerfilAbierto(false); logout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-inst-rojo hover:bg-red-50 flex items-center gap-2 focus:outline-none focus:bg-red-50"
                  >
                    <span className="material-icons text-base">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-inst-azul-osc via-inst-amarillo to-inst-azul-osc" />
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-x-hidden">
          <Outlet />
        </main>

        <footer className="text-center py-3 border-t border-inst-borde text-[11px] text-inst-texto-claro bg-white">
          EDL-CAREPA &copy; {new Date().getFullYear()} — Alcaldia de Carepa
        </footer>
      </div>
    </div>
  );
}