import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type Usuario, type Rol, type MenuItem } from '../lib/auth';

interface AuthContextType {
  usuario: Usuario | null;
  roles: Rol[];
  menu: MenuItem[];
  token: string | null;
  loading: boolean;
  login: (documento: string, tipo_documento: string, password: string) => Promise<void>;
  logout: () => void;
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
    } catch {
      localStorage.removeItem('edl_token');
      localStorage.removeItem('edl_user');
      setToken(null);
      setUsuario(null);
      setRoles([]);
      setMenu([]);
    }
  }, []);

  useEffect(() => {
    if (token) {
      cargarSesion();
    }
  }, [token, cargarSesion]);

  const login = useCallback(async (documento: string, tipo_documento: string, password: string) => {
    setLoading(true);
    try {
      const resp = await authApi.login({ documento, tipo_documento, password });
      localStorage.setItem('edl_token', resp.token);
      localStorage.setItem('edl_user', JSON.stringify(resp.usuario));
      setToken(resp.token);
      setUsuario(resp.usuario);
      setRoles(resp.roles);
      const menuData = await authApi.menu();
      setMenu(menuData);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('edl_token');
    localStorage.removeItem('edl_user');
    setToken(null);
    setUsuario(null);
    setRoles([]);
    setMenu([]);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, roles, menu, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
