import { api } from '../lib/api';

export interface LoginRequest {
 documento: string;
 password: string;
}

export interface LoginResponse {
  token: string;
  expiracion: string;
  usuario: Usuario;
  roles: Rol[];
  rol_activo: string;
}

export interface Usuario {
  id: number;
  documento: string;
  tipo_documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  cargo: string;
  entidad_id: number | null;
  dependencia_id: number | null;
}

export interface Rol {
  codigo: string;
  nombre: string;
  entidad_id: number | null;
}

export interface MenuItem {
  label: string;
  icon: string;
  ruta: string;
  permisos: { codigo: string; nombre: string }[];
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  perfil: () => api.get<{ usuario: Usuario; roles: Rol[] }>('/auth/perfil'),
  menu: () => api.get<MenuItem[]>('/menu'),
  cambiarPassword: (data: { password_actual: string; password_nueva: string }) =>
    api.put('/auth/password', data),
  cambiarRol: (rolCodigo: string) => api.put<{ rol_activo: string; token?: string }>('/auth/rol', { rol_codigo: rolCodigo }),
};
