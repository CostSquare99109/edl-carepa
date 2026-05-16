import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type Usuario, type Rol, type MenuItem } from '../lib/auth';

interface AuthContextType {
  usuario: Usuario | null;
  roles: Rol[];
  rolActivo: string | null;
  menu: MenuItem[];
  token: string | null;
  loading: boolean;
  login: (documento: string, tipo_documento: string, password: string) => Promise<Rol[]>;
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
    return saved ? JSON.parse(saved) : null;
  });
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolActivo, setRolActivo] = useState<string | null>(() =>
    localStorage.getItem('edl_rol_activo')
  );
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarSesion = useCallback(async () => {
    try {
      const [perfilData, menuData] = await Promise.all([
        authApi.perfil(),
        authApi.menu(),
      ]);
      setUsuario(perfilData.usuario);
      setRoles(perfilData.roles);
      setMenu(menuData);
      localStorage.setItem('edl_user', JSON.stringify(perfilData.usuario));
      // Si no hay rol activo, usar el primero
      if (!rolActivo && perfilData.roles.length > 0) {
        const primerRol = perfilData.roles[0].codigo;
        setRolActivo(primerRol);
        localStorage.setItem('edl_rol_activo', primerRol);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Sesion expirada') {
        setToken(null);
        setUsuario(null);
        setRoles([]);
        setRolActivo(null);
        setMenu([]);
        localStorage.removeItem('edl_rol_activo');
      }
      console.warn('Error cargando sesion:', msg);
    }
  }, [rolActivo]);

  useEffect(() => {
    if (token) {
      cargarSesion();
    }
  }, [token, cargarSesion]);

  // Recargar menú cuando cambie el rol activo
  useEffect(() => {
    if (token && rolActivo) {
      authApi.menu().then(setMenu).catch(() => {
        console.warn('No se pudo cargar el menu al cambiar rol');
      });
    }
  }, [rolActivo, token]);

  const login = useCallback(async (documento: string, tipo_documento: string, password: string): Promise<Rol[]> => {
    setLoading(true);
    try {
      const resp = await authApi.login({ documento, tipo_documento, password });
      localStorage.setItem('edl_token', resp.token);
      localStorage.setItem('edl_user', JSON.stringify(resp.usuario));
      localStorage.setItem('edl_rol_activo', resp.rol_activo);
      setToken(resp.token);
      setUsuario(resp.usuario);
      setRoles(resp.roles);
      setRolActivo(resp.rol_activo);
      // Cargar menu despues del login
      try {
        const menuData = await authApi.menu();
        setMenu(menuData);
      } catch {
        console.warn('No se pudo cargar el menu');
      }
      return resp.roles;
    } finally {
      setLoading(false);
    }
  }, []);

  const cambiarRol = useCallback(async (rolCodigo: string) => {
    try {
      const resp = await authApi.cambiarRol(rolCodigo);
      setRolActivo(resp.rol_activo);
      localStorage.setItem('edl_rol_activo', resp.rol_activo);
      // El backend genera un nuevo JWT con el rol activo — actualizarlo
      if (resp.token) {
        localStorage.setItem('edl_token', resp.token);
        setToken(resp.token);
      }
      // Recargar menú con el nuevo rol
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
