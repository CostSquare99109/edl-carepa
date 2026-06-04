import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppHeader from '../../components/Shared/AppHeader';

const SIDEBAR_MENU = [
 { key: 'dashboard', label: 'Tablero de Control', icon: 'dashboard', path: '/admin' },
 { key: 'usuarios', label: 'Usuarios', icon: 'people', path: '/admin/usuarios' },
 { key: 'dependencias', label: 'Dependencias', icon: 'account_tree', path: '/admin/dependencias' },
 { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', path: '/admin/evaluaciones' },
 { key: 'reportes', label: 'Reportes', icon: 'summarize', path: '/admin/reportes' },
];

export default function AdminDashboard() {
 const { usuario } = useAuth();
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const location = useLocation();

 const nombreCompleto = usuario
  ? `${usuario.nombres} ${usuario.apellidos}`
  : 'Administrador';

 const activeMenu = SIDEBAR_MENU.find(m => {
  if (m.path === '/admin') return location.pathname === '/admin';
  return location.pathname.startsWith(m.path);
 })?.key || 'dashboard';

 const currentYear = new Date().getFullYear();

 return (
  <div className="min-h-screen bg-inst-gris flex">
   <div className={`fixed top-0 left-0 h-full z-40 lg:relative lg:z-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[250px]' : 'w-0'} overflow-hidden`}>
    <aside className="w-[250px] min-h-screen bg-[#003366] text-white flex flex-col flex-shrink-0">
     <div className="h-[60px] flex items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-3">
       <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
        <span className="material-icons text-2xl text-amber-400">account_balance</span>
       </div>
       <div className="leading-tight">
        <p className="font-heading font-bold text-sm tracking-wide">CAREPA</p>
        <p className="text-[10px] text-white/60">Panel de Administracion</p>
       </div>
      </div>
     </div>
     <div className="px-4 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
       <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
        {nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
       </div>
       <div className="min-w-0">
        <p className="text-sm font-medium truncate">{nombreCompleto}</p>
        <p className="text-[11px] text-white/50 truncate">Admin</p>
       </div>
      </div>
     </div>
     <nav className="flex-1 overflow-y-auto py-3 px-2">
      <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
       Navegacion Principal
      </p>
      {SIDEBAR_MENU.map((item) => {
       const isActive = activeMenu === item.key;
       return (
        <Link
         key={item.key}
         to={item.path}
         onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
         className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150 ${
          isActive
           ? 'bg-white/15 text-white font-semibold shadow-sm'
           : 'text-white/70 hover:bg-white/10 hover:text-white'
         }`}
        >
         <span className="material-icons text-lg">{item.icon}</span>
         <span>{item.label}</span>
         {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </Link>
       );
      })}
     </nav>
     <div className="px-4 py-3 border-t border-white/10 text-center">
      <p className="text-[10px] text-white/30">EDL-CAREPA v1.0.0</p>
     </div>
    </aside>
   </div>
   {sidebarOpen && (
    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
   )}
   <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
    <AppHeader
     variant="admin"
     onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
     breadcrumb={SIDEBAR_MENU.find(m => m.key === activeMenu)?.label}
     notificationPath="/admin/notificaciones"
    />
    <main className="flex-1">
     <Outlet />
    </main>
    <footer className="text-center py-4 border-t border-inst-borde text-xs text-inst-texto-claro">
     EDL-CAREPA &copy; {currentYear} — Alcaldia de Carepa
    </footer>
   </div>
  </div>
 );
}
