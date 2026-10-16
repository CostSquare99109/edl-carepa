import { createContext } from 'react';
import type { Usuario, Rol, MenuItem } from '../lib/auth';

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | null>(null);
