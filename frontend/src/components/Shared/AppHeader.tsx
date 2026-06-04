import { useAuth } from '../../contexts/AuthContext';
import RoleSelector from './RoleSelector';
import NotificationBell from './NotificationBell';

interface AppHeaderProps {
 variant: 'funcionario' | 'admin';
 onToggleSidebar?: () => void;
 breadcrumb?: string;
 notificationPath?: string;
}

export default function AppHeader({ variant, onToggleSidebar, breadcrumb, notificationPath = '/notificaciones' }: AppHeaderProps) {
 const { usuario, logout } = useAuth();
 const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario';

 if (variant === 'funcionario') {
  return (
   <header className="bg-white">
    <div className="flex items-center gap-4 px-6 py-4">
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
     <div className="flex-1">
      <h1 className="text-xl font-heading font-bold text-inst-azul tracking-wide">
       Evaluacion del Desempeno Laboral
      </h1>
      <p className="text-xs text-inst-texto-claro font-sans">
       Alcaldia de Carepa
      </p>
     </div>
     <RoleSelector variant="header" />
     <NotificationBell adminPath={notificationPath} />
     <div className="flex items-center gap-3 flex-shrink-0">
      <div className="text-right">
       <p className="text-sm font-medium text-inst-azul">{nombreCompleto}</p>
       <p className="text-xs text-inst-texto-claro">{usuario?.cargo || ''}</p>
      </div>
      <button
       onClick={logout}
       className="edl-btn-outline text-xs flex items-center gap-1"
       title="Cerrar sesion"
      >
       <span className="material-icons text-base">logout</span>
       Cerrar sesion
      </button>
     </div>
    </div>
    <div className="edl-divider" />
    <div className="edl-divider-accent" />
   </header>
  );
 }

 return (
  <header className="h-[60px] bg-white border-b border-inst-borde flex items-center px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
   {onToggleSidebar && (
    <button
     onClick={onToggleSidebar}
     className="p-2 rounded-lg hover:bg-inst-gris transition-colors mr-3"
     aria-label="Toggle menu"
    >
     <span className="material-icons text-inst-texto">menu</span>
    </button>
   )}
   {breadcrumb && (
    <div className="hidden sm:flex items-center gap-1 text-sm text-inst-texto-claro">
     <span className="material-icons text-base text-inst-azul">home</span>
     <span>/</span>
     <span className="text-inst-texto font-medium">{breadcrumb}</span>
    </div>
   )}
   <div className="flex-1" />
   <RoleSelector variant="sidebar" />
   <NotificationBell adminPath={notificationPath} />
   <div className="hidden md:flex items-center gap-2 mr-2">
    <span className="text-sm font-medium text-inst-texto">{nombreCompleto}</span>
   </div>
   <button
    onClick={logout}
    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-inst-rojo hover:bg-red-50 transition-colors"
    title="Cerrar sesion"
   >
    <span className="material-icons text-base">logout</span>
    <span className="hidden sm:inline">Salir</span>
   </button>
  </header>
 );
}
