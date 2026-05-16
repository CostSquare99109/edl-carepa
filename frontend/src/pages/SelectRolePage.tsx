import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Rol } from '../lib/auth';

/* ─── Config de roles ─── */
interface RolConfig {
  icon: string;
  descripcion: string;
  colorBarra: string;
  colorFondo: string;
  colorTexto: string;
}

const ROLES_CONFIG: Record<string, RolConfig> = {
 admin: {
 icon: 'shield',
 descripcion: 'Acceso total al sistema: gestión de usuarios, dependencias, evaluaciones, reportes.',
 colorBarra: 'border-l-red-600',
 colorFondo: 'bg-red-100',
 colorTexto: 'text-red-800',
 },
 evaluado: {
 icon: 'person',
 descripcion: 'Consulte sus metas, compromisos, evidencias y resultados de evaluación.',
 colorBarra: 'border-l-blue-600',
 colorFondo: 'bg-blue-100',
 colorTexto: 'text-blue-800',
 },
 evaluador: {
 icon: 'rate_review',
 descripcion: 'Evalúe el desempeño de los funcionarios a su cargo y gestione concertaciones.',
 colorBarra: 'border-l-green-600',
 colorFondo: 'bg-green-100',
 colorTexto: 'text-green-800',
 },
};

/* fallback para roles no previstos */
const ROL_DEFAULT: RolConfig = {
  icon: 'account_circle',
  descripcion: 'Rol del sistema.',
  colorBarra: 'border-l-gray-500',
  colorFondo: 'bg-gray-100',
  colorTexto: 'text-gray-800',
};

function getConfig(codigo: string): RolConfig {
  return ROLES_CONFIG[codigo] ?? ROL_DEFAULT;
}

/* ─── Componente ─── */
export default function SelectRolePage() {
  const { usuario, roles, cambiarRol } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSelect(rol: Rol) {
    setError('');
    setCargando(rol.codigo);
    try {
      await cambiarRol(rol.codigo);
      // Redirigir según el rol seleccionado
      if (['admin', 'admin_cnsc', 'admin_entidad'].includes(rol.codigo)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar de rol. Intente de nuevo.');
      setCargando(null);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* ── Escudo + título institucional ── */}
        <div className="edl-card text-center mb-0">
          {/* Escudo CNSC */}
          <div className="flex justify-center mb-5">
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="Escudo CNSC"
              className="h-24 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const span = document.createElement('span');
                  span.className = 'escudo-fallback text-4xl font-heading font-bold text-inst-azul';
                  span.textContent = 'CNSC';
                  parent.appendChild(span);
                }
              }}
            />
          </div>

          <h1 className="text-xl font-heading font-bold text-inst-azul mb-1">
            Evaluación del Desempeño Laboral
          </h1>
          <p className="text-sm text-inst-texto-claro mb-4">
            Comisión Nacional del Servicio Civil
          </p>

          {/* Doble línea divisoria institucional */}
          <div className="edl-divider" />
          <div className="edl-divider-accent" />

          {/* Bienvenida */}
          <p className="text-lg font-heading font-semibold text-inst-azul mb-1">
            Bienvenido, {usuario?.nombres ?? ''} {usuario?.apellidos ?? ''}
          </p>
          <p className="text-sm text-inst-texto-claro">
            Seleccione el rol con el que desea ingresar
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-inst-rojo/20 rounded-lg text-sm text-inst-rojo flex items-center gap-2">
            <span className="material-icons text-base">error</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* ── Tarjetas de roles ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {roles.map((rol) => {
            const cfg = getConfig(rol.codigo);
            const isLoading = cargando === rol.codigo;

            return (
              <button
                key={rol.codigo}
                type="button"
                onClick={() => handleSelect(rol)}
                disabled={!!cargando}
                className={`
                  group relative w-full text-left
                  border border-inst-borde rounded-lg
                  border-l-4 ${cfg.colorBarra}
                  bg-white hover:shadow-lg
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 ease-out
                  p-5
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-inst-azul/30
                `}
              >
                {/* Ícono + contenido */}
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-lg
                      flex items-center justify-center
                      ${cfg.colorFondo} ${cfg.colorTexto}
                      transition-transform duration-200 group-hover:scale-110
                    `}
                  >
                    {isLoading ? (
                      <span className="material-icons text-2xl animate-spin">refresh</span>
                    ) : (
                      <span className="material-icons text-2xl">{cfg.icon}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className={`text-base font-heading font-semibold ${cfg.colorTexto} mb-1`}>
                      {rol.nombre}
                    </h3>
                    <p className="text-xs text-inst-texto-claro leading-relaxed">
                      {cfg.descripcion}
                    </p>
                  </div>
                </div>

                {/* Flecha decorativa hover */}
                <span
                  className="
                    absolute right-4 top-1/2 -translate-y-1/2
                    material-icons text-inst-borde
                    group-hover:text-inst-azul
                    transition-colors duration-200
                  "
                >
                  chevron_right
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Footer sutil ── */}
        <p className="mt-8 text-center text-xs text-inst-texto-claro">
          CNSC — Sistema de Evaluación del Desempeño Laboral
        </p>
      </div>
    </div>
  );
}
