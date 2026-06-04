import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ROL_COLORS: Record<string, string> = {
 evaluado: 'bg-blue-100 text-blue-800',
 evaluador: 'bg-green-100 text-green-800',
 admin_entidad: 'bg-purple-100 text-purple-800',
 comision_evaluadora: 'bg-amber-100 text-amber-800',
 admin_carepa: 'bg-red-100 text-red-800',
 admin: 'bg-red-100 text-red-800',
};

const ROL_ICONS: Record<string, string> = {
 evaluado: 'person',
 evaluador: 'rate_review',
 admin_entidad: 'admin_panel_settings',
 comision_evaluadora: 'groups',
 admin_carepa: 'shield',
 admin: 'admin_panel_settings',
};

interface RoleSelectorProps {
 variant?: 'header' | 'sidebar';
 onRolChange?: (codigo: string) => void;
}

export default function RoleSelector({ variant = 'header', onRolChange }: RoleSelectorProps) {
 const { usuario, roles, rolActivo, cambiarRol, logout } = useAuth();
 const navigate = useNavigate();
 const [rolDropdownOpen, setRolDropdownOpen] = useState(false);
 const [cambiandoRol, setCambiandoRol] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

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
   if (onRolChange) {
    onRolChange(codigo);
   } else {
    if (['admin', 'admin_carepa', 'admin_entidad'].includes(codigo)) {
     navigate('/admin', { replace: true });
    } else if (['admin', 'admin_carepa', 'admin_entidad'].includes(rolActivo || '')) {
     navigate('/', { replace: true });
    }
   }
  } catch (err) {
   console.error('Error al cambiar rol:', err);
  } finally {
   setCambiandoRol(false);
  }
 }

 if (variant === 'header') {
  return (
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
  );
 }

 return (
  <div className="relative" ref={dropdownRef}>
   <button
    onClick={() => { setRolDropdownOpen(!rolDropdownOpen); }}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-inst-borde text-sm hover:bg-inst-gris transition-colors"
   >
    <span className="material-icons text-base text-inst-azul">admin_panel_settings</span>
    <span className="hidden sm:inline text-inst-texto font-medium">
     {rolActivoData?.nombre || rolActivo || 'Rol'}
    </span>
    <span className="material-icons text-base text-inst-texto-claro">
     {rolDropdownOpen ? 'expand_less' : 'expand_more'}
    </span>
   </button>
   {rolDropdownOpen && (
    <>
     <div className="fixed inset-0 z-10" onClick={() => setRolDropdownOpen(false)} />
     <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-inst-borde z-20 py-1">
      <p className="px-4 py-2 text-xs font-medium text-inst-texto-claro border-b border-inst-borde">
       Cambiar rol activo
      </p>
      {roles.map(r => (
       <button
        key={r.codigo}
        onClick={() => handleCambiarRol(r.codigo)}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-inst-gris transition-colors ${
         rolActivo === r.codigo ? 'font-semibold text-inst-azul' : 'text-inst-texto'
        }`}
       >
        {r.nombre}
        {rolActivo === r.codigo && (
         <span className="ml-2 text-xs text-inst-azul">&#10003;</span>
        )}
       </button>
      ))}
     </div>
    </>
   )}
  </div>
 );
}
