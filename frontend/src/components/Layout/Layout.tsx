import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

const ROL_COLORS: Record<string, string> = {
  evaluado: 'bg-blue-100 text-blue-800',
  evaluador: 'bg-green-100 text-green-800',
  admin_entidad: 'bg-purple-100 text-purple-800',
  comision_evaluadora: 'bg-amber-100 text-amber-800',
	admin_carepa: 'bg-red-100 text-red-800',
};

const ROL_ICONS: Record<string, string> = {
  evaluado: 'person',
  evaluador: 'rate_review',
  admin_entidad: 'admin_panel_settings',
  comision_evaluadora: 'groups',
	admin_carepa: 'shield',
};

export default function Layout() {
 const { usuario, roles, rolActivo, menu, logout, cambiarRol } = useAuth();
 const navigate = useNavigate();
  const [rolDropdownOpen, setRolDropdownOpen] = useState(false);
  const [cambiandoRol, setCambiandoRol] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRolDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolActivoData = roles.find(r => r.codigo === rolActivo);
  const tieneMultiplesRoles = roles.length > 1;

	async function handleCambiarRol(codigo: string) {
		if (codigo === rolActivo) {
			setRolDropdownOpen(false);
			return;
		}
		setCambiandoRol(true);
		try {
			await cambiarRol(codigo);
			setRolDropdownOpen(false);
			// Navegar al layout correcto según el rol
			if (['admin', 'admin_carepa', 'admin_entidad'].includes(codigo)) {
				navigate('/admin', { replace: true });
			} else if (['admin', 'admin_carepa', 'admin_entidad'].includes(rolActivo || '')) {
				// Venía de un rol admin y cambió a no-admin
				navigate('/', { replace: true });
			}
		} catch (err) {
			console.error('Error al cambiar rol:', err);
		} finally {
			setCambiandoRol(false);
		}
	}

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header institucional */}
      <header className="bg-white">
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Escudo Carepa */}
          <div className="flex-shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Carepa"
              className="h-12 w-auto"
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
          {/* Título */}
          <div className="flex-1">
            <h1 className="text-xl font-heading font-bold text-inst-azul tracking-wide">
              Evaluación del Desempeño Laboral
            </h1>
            <p className="text-xs text-inst-texto-claro font-sans">
		Alcaldía de Carepa
            </p>
          </div>

          {/* Selector de rol activo */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => tieneMultiplesRoles && setRolDropdownOpen(!rolDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tieneMultiplesRoles ? 'cursor-pointer hover:bg-inst-gris' : 'cursor-default'
              } ${ROL_COLORS[rolActivo || ''] || 'bg-gray-100 text-gray-700'}`}
              title={tieneMultiplesRoles ? 'Cambiar rol activo' : `Rol: ${rolActivoData?.nombre || rolActivo}`}
              disabled={cambiandoRol}
            >
              <span className="material-icons text-sm">
                {cambiandoRol ? 'refresh' : (ROL_ICONS[rolActivo || ''] || 'badge')}
              </span>
              {cambiandoRol ? 'Cambiando...' : (rolActivoData?.nombre || rolActivo || 'Sin rol')}
              {tieneMultiplesRoles && (
                <span className="material-icons text-sm">
                  {rolDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </button>

            {/* Dropdown de roles */}
            {rolDropdownOpen && tieneMultiplesRoles && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-inst-borde rounded-lg shadow-lg z-50 py-1">
                <p className="px-3 py-2 text-xs font-medium text-inst-texto-claro border-b border-inst-borde">
                  Cambiar rol activo
                </p>
                {roles.map(rol => (
                  <button
                    key={rol.codigo}
                    onClick={() => handleCambiarRol(rol.codigo)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      rol.codigo === rolActivo
                        ? 'bg-inst-azul/5 text-inst-azul font-medium'
                        : 'text-inst-texto hover:bg-inst-gris'
                    }`}
                  >
                    <span className="material-icons text-base">
                      {ROL_ICONS[rol.codigo] || 'badge'}
                    </span>
                    <span className="flex-1">{rol.nombre}</span>
                    {rol.codigo === rolActivo && (
                      <span className="material-icons text-sm text-inst-azul">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nombre usuario + cerrar sesión */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-medium text-inst-azul">
                {usuario
                  ? `${usuario.nombres} ${usuario.apellidos}`
                  : 'Usuario'}
              </p>
              <p className="text-xs text-inst-texto-claro">
                {usuario?.cargo || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="edl-btn-outline text-xs flex items-center gap-1"
              title="Cerrar sesión"
            >
              <span className="material-icons text-base">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
        {/* Doble línea divisoria: azul 2px + roja 1px */}
        <div className="edl-divider" />
        <div className="edl-divider-accent" />
      </header>

      {/* Cuerpo: sidebar + contenido */}
      <div className="flex flex-1">
        <Sidebar menu={menu} />
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
