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
 debe_cambiar_password?: boolean;
}

export interface Usuario {
	id: number;
	documento: string;
	tipo_documento: string;
	primer_nombre: string;
	segundo_nombre?: string;
	primer_apellido: string;
	segundo_apellido?: string;
	nombre_completo?: string;
	email: string;
	telefono1?: string;
	telefono2?: string;
	estado: string;
	genero?: string;
	denominacion_empleo?: string;
	cargo?: string;
	nivel?: string;
	naturaleza?: string;
	tipo_nombramiento?: string;
	es_contratista?: number;
	en_periodo_prueba?: number;
	intentos_fallidos?: number;
	ultimo_acceso?: string;
	email_confirmado?: number;
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
 cambiarRol: (rolCodigo: string) => api.put<{ rol_activo: string; token?: string; csrf_token?: string }>('/auth/rol', { rol_codigo: rolCodigo }),
};
