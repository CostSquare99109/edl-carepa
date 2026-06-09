import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { authApi, type Usuario, type Rol, type MenuItem } from '../lib/auth';

interface AuthContextType {
 usuario: Usuario | null;
 roles: Rol[];
 rolActivo: string | null;
 menu: MenuItem[];
 token: string | null;
 loading: boolean;
 login: (documento: string, password: string) => Promise<Rol[]>;
 logout: () => void;
 cambiarRol: (rolCodigo: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
 return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
 const [token, setToken] = useState<string | null>(() => localStorage.getItem('edl_token'));
 const [usuario, setUsuario] = useState<Usuario | null>(() => {
 const saved = localStorage.getItem('edl_user');
 try { return saved ? JSON.parse(saved) : null; } catch { return null; }
 });
 const [roles, setRoles] = useState<Rol[]>([]);
 const [rolActivo, setRolActivo] = useState<string | null>(() =>
 localStorage.getItem('edl_rol_activo')
 );
 const [menu, setMenu] = useState<MenuItem[]>([]);
 const [loading, setLoading] = useState(false);

 const skipNextRolEffect = useRef(false);
 const sessionLoadedRef = useRef(false);

 useEffect(() => {
 if (!token) {
 sessionLoadedRef.current = false;
 return;
 }

 if (sessionLoadedRef.current) return;

 let cancelled = false;

 async function load() {
 try {
 const [perfilData, menuData] = await Promise.all([
 authApi.perfil(),
 authApi.menu(),
 ]);
 if (cancelled) return;

 setUsuario(perfilData.usuario);
 setRoles(perfilData.roles);
 setMenu(menuData);
 localStorage.setItem('edl_user', JSON.stringify(perfilData.usuario));

 const savedRol = localStorage.getItem('edl_rol_activo');
 if (!savedRol && perfilData.roles.length > 0) {
 const primerRol = perfilData.roles[0].codigo;
 setRolActivo(primerRol);
 localStorage.setItem('edl_rol_activo', primerRol);
 }

 sessionLoadedRef.current = true;
 } catch (err) {
 if (cancelled) return;
 const msg = err instanceof Error ? err.message : '';
 if (msg === 'Sesion expirada') {
 localStorage.removeItem('edl_token');
 localStorage.removeItem('edl_user');
 localStorage.removeItem('edl_rol_activo');
 setToken(null);
 setUsuario(null);
 setRoles([]);
 setRolActivo(null);
 setMenu([]);
 }
 console.warn('Error cargando sesion:', msg);
 }
 }

 load();
 return () => { cancelled = true; };
 }, [token]);

 const login = useCallback(async (documento: string, password: string): Promise<Rol[]> => {
 setLoading(true);
 try {
  const resp = await authApi.login({ documento, password });
  localStorage.setItem('edl_token', resp.token);
  localStorage.setItem('edl_user', JSON.stringify(resp.usuario));
  localStorage.setItem('edl_rol_activo', resp.rol_activo);
  setToken(resp.token);
  setUsuario(resp.usuario);
  setRoles(resp.roles);
  setRolActivo(resp.rol_activo);

  if (resp.debe_cambiar_password) {
   localStorage.setItem('edl_forzar_cambio', '1');
   return resp.roles;
  }

  try {
   const menuData = await authApi.menu();
   setMenu(menuData);
  } catch {
   console.warn('No se pudo cargar el menu despues de login');
  }

  sessionLoadedRef.current = true;
  return resp.roles;
 } finally {
  setLoading(false);
 }
 }, []);

 const cambiarRol = useCallback(async (rolCodigo: string) => {
 skipNextRolEffect.current = true;

 try {
 const resp = await authApi.cambiarRol(rolCodigo);

 setRolActivo(resp.rol_activo);
 localStorage.setItem('edl_rol_activo', resp.rol_activo);

 if (resp.token) {
 localStorage.setItem('edl_token', resp.token);
 setToken(resp.token);
 }

 const menuData = await authApi.menu();
 setMenu(menuData);
 } catch (err) {
 console.error('Error cambiando rol:', err);
 throw err;
 }
 }, []);

 const logout = useCallback(() => {
 authApi.logout().catch(() => {});
 localStorage.removeItem('edl_token');
 localStorage.removeItem('edl_user');
 localStorage.removeItem('edl_rol_activo');
 sessionLoadedRef.current = false;
 setToken(null);
 setUsuario(null);
 setRoles([]);
 setRolActivo(null);
 setMenu([]);
 }, []);

 return (
 <AuthContext.Provider value={{ usuario, roles, rolActivo, menu, token, loading, login, logout, cambiarRol }}>
 {children}
 </AuthContext.Provider>
 );
}
