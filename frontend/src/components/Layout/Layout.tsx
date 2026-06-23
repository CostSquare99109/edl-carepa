import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import RoleSelector from '../Shared/RoleSelector';
import NotificationBell from '../Shared/NotificationBell';

export default function Layout() {
  const navigate = useNavigate();
  const { usuario, rolActivo, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('edl_sidebar_collapsed') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('edl_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

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
    navigate('/perfil');
  }

  const nombreCompleto = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Usuario';
  const iniciales = usuario
    ? `${(usuario.nombres || '?')[0]}${(usuario.apellidos || '?')[0]}`.toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-inst-gris flex">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-inst-borde sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 h-14">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú lateral"
              aria-expanded={mobileOpen}
              aria-controls="sidebar-main"
              className="lg:hidden p-2 -ml-1 rounded-md text-inst-azul-osc hover:bg-inst-gris-med focus:outline-none focus:ring-2 focus:ring-inst-verde"
            >
              <span className="material-icons text-2xl">menu</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}escudo.png`}
                alt="Carepa"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent && !parent.querySelector('.escudo-fallback')) {
                    const wrap = document.createElement('div');
                    wrap.className = 'escudo-fallback flex items-center gap-2';
                    wrap.innerHTML = `
                      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-inst-verde flex items-center justify-center text-white font-heading font-bold text-sm">C</div>
                      <div class="leading-tight hidden sm:block">
                        <h1 class="text-sm font-heading font-bold text-inst-azul-osc tracking-wide">EDL Digital</h1>
                        <p class="text-[10px] text-inst-texto-claro">Alcaldia de Carepa</p>
                      </div>
                    `;
                    parent.appendChild(wrap);
                  }
                }}
              />
              <div className="leading-tight hidden sm:block">
                <h1 className="text-sm font-heading font-bold text-inst-azul-osc tracking-wide">
                  EDL Digital
                </h1>
                <p className="text-[10px] text-inst-texto-claro">
                  Evaluacion del Desempeno Laboral
                </p>
              </div>
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
                className="w-9 h-9 rounded-full bg-gradient-to-br from-inst-verde to-inst-verde-hover text-white font-heading font-bold text-xs flex items-center justify-center hover:shadow-md transition-shadow ring-2 ring-white focus:outline-none focus:ring-inst-verde"
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
                    className="w-full text-left px-4 py-2 text-sm text-inst-texto hover:bg-inst-verde-light hover:text-inst-verde flex items-center gap-2 focus:outline-none focus:bg-inst-verde-light focus:text-inst-verde"
                  >
                    <span className="material-icons text-base">person</span>
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={irAPerfil}
                    className="w-full text-left px-4 py-2 text-sm text-inst-texto hover:bg-inst-verde-light hover:text-inst-verde flex items-center gap-2 focus:outline-none focus:bg-inst-verde-light focus:text-inst-verde"
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

          <div className="h-1 bg-gradient-to-r from-inst-verde via-inst-amarillo to-inst-verde" />
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
