import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Rol } from '../lib/auth';
import { Card, Button, Alert, Badge } from '../components/ui';

interface RolConfig {
 icon: string;
 descripcion: string;
 colorBarra: string;
 colorFondo: string;
 colorTexto: string;
 badge: 'danger' | 'success' | 'info';
}const ROLES_CONFIG: Record<string, RolConfig> = {
 admin: {
  icon: 'shield',
  descripcion: 'Administrador del sistema. Gestión de usuarios, dependencias, evaluaciones, reportes, parámetros y configuración general.',
  colorBarra: 'border-l-red-600',
  colorFondo: 'bg-red-100',
  colorTexto: 'text-red-800',
  badge: 'danger',
 },
 evaluador: {
  icon: 'rate_review',
  descripcion: 'Evalúe el desempeño de los funcionarios a su cargo. Concierte compromisos, registre evidencias y califique resultados.',
  colorBarra: 'border-l-green-600',
  colorFondo: 'bg-green-100',
  colorTexto: 'text-green-800',
  badge: 'success',
 },
 evaluado: {
  icon: 'person',
  descripcion: 'Consulte sus compromisos, evidencias y resultados de evaluación. Proponga compromisos funcionales y comportamentales.',
  colorBarra: 'border-l-blue-600',
  colorFondo: 'bg-blue-100',
  colorTexto: 'text-blue-800',
  badge: 'info',
 },
};

const ROL_DEFAULT: RolConfig = {
 icon: 'account_circle',
 descripcion: 'Rol del sistema.',
 colorBarra: 'border-l-gray-500',
 colorFondo: 'bg-gray-100',
 colorTexto: 'text-gray-800',
 badge: 'info',
};

function getConfig(codigo: string): RolConfig {
 return ROLES_CONFIG[codigo] ?? ROL_DEFAULT;
}

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
   navigate('/', { replace: true });
  } catch (err) {
   setError(err instanceof Error ? err.message : 'Error al cambiar de rol. Intente de nuevo.');
   setCargando(null);
  }
 }

 return (
  <div className="min-h-screen bg-inst-gris flex items-center justify-center px-4 py-10">
   <div className="w-full max-w-2xl">
    <Card className="text-center animate-fadeIn">
     <div className="flex justify-center mb-5">
      <img
       src={`${import.meta.env.BASE_URL}escudo.png`}
       alt="Escudo de Carepa"
       className="h-24 w-auto"
       onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent && !parent.querySelector('.escudo-fallback')) {
         const span = document.createElement('span');
         span.className = 'escudo-fallback text-4xl font-heading font-bold text-inst-azul-osc';
         span.textContent = 'CAREPA';
         parent.appendChild(span);
        }
       }}
      />
     </div>

     <h1 className="text-xl font-heading font-bold text-inst-azul-osc mb-1">
      Evaluación del Desempeño Laboral
     </h1>
     <p className="text-sm text-inst-texto-claro mb-4">Alcaldía de Carepa</p>

     <div className="edl-divider" />
     <div className="edl-divider-accent" />

      <p className="text-lg font-heading font-semibold text-inst-azul-osc mb-1">
       Bienvenido, {usuario?.primer_nombre ?? ''} {usuario?.primer_apellido ?? ''}
      </p>
      {usuario?.denominacion_empleo || usuario?.cargo ? (
       <p className="text-sm text-inst-texto-claro">Cargo: {usuario.denominacion_empleo || usuario.cargo}</p>
      ) : null}
     <p className="text-sm text-inst-texto-claro">Seleccione el rol con el que desea ingresar</p>
    </Card>

    {error ? (
     <div className="mt-4">
      <Alert tone="danger" onDismiss={() => setError('')}>
       {error}
      </Alert>
     </div>
    ) : null}

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
        aria-busy={isLoading || undefined}
        className={`
         group relative w-full text-left
         border border-inst-borde rounded-lg bg-white
         border-l-4 ${cfg.colorBarra}
         hover:shadow-lg hover:-translate-y-0.5
         transition-all duration-200 ease-out
         p-5
         disabled:opacity-60 disabled:cursor-not-allowed
         focus:outline-none focus:ring-2 focus:ring-inst-azul-osc/30
        `}
       >
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
          <div className="flex items-center gap-2 mb-1">
           <h3 className={`text-base font-heading font-semibold ${cfg.colorTexto}`}>
            {rol.nombre}
           </h3>
           <Badge tone={cfg.badge}>{rol.codigo.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-inst-texto-claro leading-relaxed">{cfg.descripcion}</p>
         </div>
        </div>

        <span
         className="absolute right-4 top-1/2 -translate-y-1/2 material-icons text-inst-borde group-hover:text-inst-azul-osc transition-colors duration-200"
         aria-hidden="true"
        >
         chevron_right
        </span>
       </button>
      );
     })}
    </div>

    <p className="mt-8 text-center text-xs text-inst-texto-claro">
     CAREPA — Sistema de Evaluación del Desempeño Laboral
    </p>
   </div>
  </div>
 );
}
