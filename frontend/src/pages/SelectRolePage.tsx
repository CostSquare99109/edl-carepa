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
 jefe_personal: {
  icon: 'shield',
  descripcion: 'Superadministrador global del sistema. Gestión de usuarios, dependencias, periodos, evaluaciones, reportes y configuración general.',
  colorBarra: 'bg-red-600',
  colorFondo: 'bg-red-100',
  colorTexto: 'text-red-800',
  badge: 'danger',
 },
 admin: {
  icon: 'shield',
  descripcion: 'Administrador del sistema. Gestión de usuarios, dependencias, evaluaciones, reportes, parámetros y configuración general.',
  colorBarra: 'bg-red-600',
  colorFondo: 'bg-red-100',
  colorTexto: 'text-red-800',
  badge: 'danger',
 },
 jefe_dependencia: {
  icon: 'supervisor_account',
  descripcion: 'Jefe de dependencia. Administra los usuarios de su dependencia, restablece contraseñas y realiza seguimiento.',
  colorBarra: 'bg-inst-azul',
  colorFondo: 'bg-inst-gris-med',
  colorTexto: 'text-inst-texto',
  badge: 'danger',
 },
 evaluador: {
  icon: 'rate_review',
  descripcion: 'Evalúe el desempeño de los funcionarios a su cargo. Concierte compromisos, registre evidencias y califique resultados.',
  colorBarra: 'bg-green-600',
  colorFondo: 'bg-green-100',
  colorTexto: 'text-green-800',
  badge: 'success',
 },
 evaluado: {
  icon: 'person',
  descripcion: 'Consulte sus compromisos, evidencias y resultados de evaluación. Proponga compromisos funcionales y comportamentales.',
  colorBarra: 'bg-blue-600',
  colorFondo: 'bg-inst-azul-light',
  colorTexto: 'text-inst-azul',
  badge: 'info',
 },
 comision_evaluadora: {
  icon: 'groups',
  descripcion: 'Órgano evaluador colegiado. Realiza evaluaciones conjuntas y aprueba calificaciones definitivas.',
  colorBarra: 'bg-amber-600',
  colorFondo: 'bg-amber-100',
  colorTexto: 'text-amber-800',
  badge: 'info',
 },
};

const ROL_DEFAULT: RolConfig = {
 icon: 'account_circle',
 descripcion: 'Rol del sistema.',
 colorBarra: 'bg-gray-500',
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
   navigate('/dashboard', { replace: true });
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
         span.className = 'escudo-fallback text-4xl font-heading font-bold text-inst-azul';
         span.textContent = 'CAREPA';
         parent.appendChild(span);
        }
       }}
      />
     </div>

     <h1 className="text-xl font-heading font-bold text-inst-azul mb-1">
      Evaluación del Desempeño Laboral
     </h1>
     <p className="text-sm text-inst-texto-claro mb-4">Alcaldía de Carepa</p>

     <div className="edl-divider" />
     <div className="edl-divider-accent" />

      <p className="text-lg font-heading font-semibold text-inst-azul mb-1">
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
          group relative w-full text-left overflow-hidden
          border border-inst-borde rounded-md bg-inst-surface
          hover:shadow-elegant-lg hover:-translate-y-0.5
          transition-all duration-base ease-standard
          py-5 pl-5 pr-12
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-inst-azul/30
         `}
        >
         <span aria-hidden="true" className={`absolute left-0 top-0 h-full w-1 ${cfg.colorBarra}`} />
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
          <div className="min-w-0 flex items-center gap-2 mb-1">
           <h3 className={`min-w-0 truncate text-base font-heading font-semibold ${cfg.colorTexto}`}>
            {rol.nombre}
           </h3>
           <Badge tone={cfg.badge} className="shrink-0 max-w-full">
            {rol.codigo.toUpperCase()}
           </Badge>
          </div>
          <p className="text-xs text-inst-texto-claro leading-relaxed">{cfg.descripcion}</p>
         </div>
        </div>

        <span
         className="absolute right-4 top-1/2 -translate-y-1/2 material-icons text-inst-borde group-hover:text-inst-azul transition-colors duration-200"
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
