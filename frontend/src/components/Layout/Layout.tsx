import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { usuario, menu, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header institucional */}
      <header className="bg-white">
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Escudo CNSC */}
          <div className="flex-shrink-0">
            <img
              src="/escudo.png"
              alt="CNSC"
              className="h-12 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const span = document.createElement('span');
                  span.className = 'escudo-fallback text-2xl font-heading font-bold text-inst-azul';
                  span.textContent = 'CNSC';
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
              Comisión Nacional del Servicio Civil
            </p>
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
