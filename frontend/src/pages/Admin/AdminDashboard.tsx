import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppHeader from '../../components/Shared/AppHeader';

const ADMIN_TABS = [
 { key: 'dashboard', label: 'Tablero de Control', icon: 'dashboard', path: '/admin' },
 { key: 'usuarios', label: 'Usuarios', icon: 'people', path: '/admin/usuarios' },
 { key: 'dependencias', label: 'Dependencias', icon: 'account_tree', path: '/admin/dependencias' },
 { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', path: '/admin/evaluaciones' },
 { key: 'reportes', label: 'Reportes', icon: 'summarize', path: '/admin/reportes' },
];

export default function AdminDashboard() {
 const { usuario } = useAuth();
 const location = useLocation();

 const activeTab = ADMIN_TABS.find(m => {
 if (m.path === '/admin') return location.pathname === '/admin';
 return location.pathname.startsWith(m.path);
 })?.key || 'dashboard';

 const currentYear = new Date().getFullYear();

 return (
 <div className="min-h-screen flex flex-col bg-inst-gris">
 <AppHeader />

 {ADMIN_TABS.length > 0 && (
 <nav className="bg-inst-surface border-b border-inst-borde px-6 overflow-x-auto">
 <div className="flex items-center gap-0">
 {ADMIN_TABS.map((item) => {
 const isActive = activeTab === item.key;
 return (
 <Link
 key={item.key}
 to={item.path}
 className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
 isActive
 ? 'border-inst-rojo text-inst-azul'
 : 'border-transparent text-inst-texto-claro hover:text-inst-azul hover:bg-inst-gris/50'
 }`}
 >
 <span className="material-icons text-base">{item.icon}</span>
 {item.label}
 </Link>
 );
 })}
 </div>
 </nav>
 )}

 <main className="flex-1 px-6 py-6">
 <Outlet />
 </main>

 <footer className="text-center py-4 border-t border-inst-borde text-xs text-inst-texto-claro bg-inst-surface">
 EDL-CAREPA &copy; {currentYear} — Alcaldia de Carepa
 </footer>
 </div>
 );
}
