import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../lib/auth';
import Sidebar from './Sidebar';
import AppHeader from '../Shared/AppHeader';
import { COLORES } from '../../styles/colors';

export default function Layout() {
 const { menu, debeCambiarPassword, limpiarDebeCambiar } = useAuth();
 const location = useLocation();
 const [passActual, setPassActual] = useState('');
 const [passNueva, setPassNueva] = useState('');
 const [passConfirmar, setPassConfirmar] = useState('');
 const [guardando, setGuardando] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [location.pathname]);

 const cambiarPassword = async () => {
 if (!passActual || !passNueva || !passConfirmar) {
 setError('Todos los campos son obligatorios');
 return;
 }
 if (passNueva.length < 8) {
 setError('La nueva contrasena debe tener al menos 8 caracteres');
 return;
 }
 if (passNueva !== passConfirmar) {
 setError('Las contrasenas no coinciden');
 return;
 }
 setGuardando(true);
 setError('');
 try {
 await authApi.cambiarPassword({ password_actual: passActual, password_nueva: passNueva });
 limpiarDebeCambiar();
 setPassActual('');
 setPassNueva('');
 setPassConfirmar('');
 } catch (e: any) {
 setError(e.message || 'Error al cambiar contrasena');
 }
 setGuardando(false);
 };

 return (
 <div className="min-h-screen flex flex-col bg-white">
 <AppHeader variant="funcionario" notificationPath="/notificaciones" />
 <div className="flex flex-1">
 <Sidebar menu={menu} />
 <main className="flex-1 p-6 bg-white overflow-y-auto">
 <Outlet />
 </main>
 </div>

 {debeCambiarPassword && (
 <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
 <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
 <div className="px-6 py-4 border-b" style={{ borderColor: COLORES.rojo }}>
 <h3 className="font-bold text-lg" style={{ color: COLORES.rojo }}>Cambio de Contrasena Requerido</h3>
 <p className="text-sm text-gray-600 mt-1">Su contrasena fue restablecida por un administrador. Debe cambiarla para continuar.</p>
 </div>
 <div className="px-6 py-4 space-y-3">
 {error && <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-sm">{error}</div>}
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">Contrasena actual</label>
 <input type="password" value={passActual} onChange={e => setPassActual(e.target.value)}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">Nueva contrasena (minimo 8 caracteres)</label>
 <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nueva contrasena</label>
 <input type="password" value={passConfirmar} onChange={e => setPassConfirmar(e.target.value)}
 className="w-full border rounded-lg px-3 py-2 text-sm" />
 </div>
 </div>
 <div className="px-6 py-4 border-t flex justify-end">
 <button onClick={cambiarPassword} disabled={guardando}
 className="px-6 py-2 rounded-lg text-sm text-white hover:opacity-90 disabled:opacity-50"
 style={{ backgroundColor: COLORES.rojo }}>
 {guardando ? 'Guardando...' : 'Cambiar Contrasena'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
