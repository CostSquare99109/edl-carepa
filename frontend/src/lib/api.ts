export const API_BASE = '/api/v1';

const DEBUG = import.meta.env.DEV;

interface ApiResponse<T = unknown> {
 code: string;
 message: string;
 data: T;
}

interface PaginatedData<T> {
 data: T[];
 items?: T[];
 total: number;
 pagina: number;
 por_pagina: number;
 total_paginas: number;
}

class ApiClient {
 private getToken(): string | null {
 return localStorage.getItem('edl_token');
 }

 private getCsrfToken(): string | null {
 return localStorage.getItem('edl_csrf');
 }

 private headers(json = true): HeadersInit {
 const h: HeadersInit = {};
 if (json) h['Content-Type'] = 'application/json';
 const token = this.getToken();
 if (token) h['Authorization'] = `Bearer ${token}`;
 const csrf = this.getCsrfToken();
 if (csrf) h['X-CSRF-Token'] = csrf;
 return h;
 }

 async fetchCsrfToken(): Promise<void> {
 try {
 const res = await fetch(`${API_BASE}/auth/csrf`, {
 headers: { 'Authorization': `Bearer ${this.getToken()}` }
 });
 const json = await res.json();
 if (json.code === '01' && json.data?.csrf_token) {
 localStorage.setItem('edl_csrf', json.data.csrf_token);
 }
 } catch {
 // CSRF fetch failed, continue without
 }
 }

 async refreshToken(): Promise<string | null> {
 const token = this.getToken();
 if (!token) return null;

 try {
 const res = await fetch(`${API_BASE}/auth/refresh`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 }
 });

 if (!res.ok) return null;

 const json = await res.json();
 if (json.code === '01' && json.data?.token) {
 localStorage.setItem('edl_token', json.data.token);
 return json.data.token;
 }
 } catch {
 // Refresh failed
 }

 return null;
 }

 async request<T>(method: string, path: string, body?: unknown): Promise<T> {
 const opts: RequestInit = {
 method,
 headers: this.headers(typeof body !== 'undefined'),
 };
 if (body !== undefined && body !== null) opts.body = JSON.stringify(body);

 let res: Response;
 try {
 res = await fetch(`${API_BASE}${path}`, opts);
 } catch {
 throw new Error('No se puede conectar con el servidor. Verifique que el backend este corriendo.');
 }

 const text = await res.text();
 if (!text) {
 throw new Error('El servidor no respondio. Verifique que el backend este corriendo.');
 }

 let json: ApiResponse<T>;
 try {
 json = JSON.parse(text);
 } catch {
 if (DEBUG) console.error(`[API] ${method} ${path} JSON invalido:`, text.substring(0, 200));
 throw new Error('Respuesta invalida del servidor.');
 }

 if (DEBUG) console.log(`[API] ${method} ${path} status=${res.status} code=${json.code}`);

 if (res.status === 401) {
 const newToken = await this.refreshToken();
 if (newToken) {
 const retryOpts: RequestInit = {
 method,
 headers: this.headers(typeof body !== 'undefined'),
 };
 if (body !== undefined && body !== null) retryOpts.body = JSON.stringify(body);

 const retryRes = await fetch(`${API_BASE}${path}`, retryOpts);
 const retryText = await retryRes.text();
 if (retryText) {
 try {
 const retryJson = JSON.parse(retryText);
 if (retryJson.code === '01') return retryJson.data;
 throw new Error(retryJson.message || 'Error del servidor');
 } catch (e) {
 if (e instanceof Error && e.message !== 'Error del servidor') throw e;
 }
 }
 }

 localStorage.removeItem('edl_token');
 localStorage.removeItem('edl_user');
 localStorage.removeItem('edl_rol_activo');
 localStorage.removeItem('edl_csrf');
 window.location.href = '/login';
 throw new Error('Sesion expirada');
 }

 if (json.code !== '01') {
 throw new Error(json.message || 'Error del servidor');
 }

 return json.data;
 }

 get<T>(path: string): Promise<T> {
 return this.request<T>('GET', path);
 }

 post<T>(path: string, body?: unknown): Promise<T> {
 return this.request<T>('POST', path, body);
 }

 put<T>(path: string, body?: unknown): Promise<T> {
 return this.request<T>('PUT', path, body);
 }

 delete<T>(path: string): Promise<T> {
 return this.request<T>('DELETE', path);
 }

 async postFormData<T>(path: string, formData: FormData): Promise<T> {
 const opts: RequestInit = {
 method: 'POST',
 headers: {} as HeadersInit,
 };
 const token = this.getToken();
 if (token) (opts.headers as Record<string,string>)['Authorization'] = `Bearer ${token}`;
 const csrf = this.getCsrfToken();
 if (csrf) (opts.headers as Record<string,string>)['X-CSRF-Token'] = csrf;
 opts.body = formData;

 let res: Response;
 try {
 res = await fetch(`${API_BASE}${path}`, opts);
 } catch {
 throw new Error('No se puede conectar con el servidor.');
 }

 const text = await res.text();
 if (!text) throw new Error('El servidor no respondio.');

 let json: ApiResponse<T>;
 try {
 json = JSON.parse(text);
 } catch {
 throw new Error('Respuesta invalida del servidor.');
 }

 if (res.status === 401) {
 localStorage.removeItem('edl_token');
 localStorage.removeItem('edl_user');
 window.location.href = '/login';
 throw new Error('Sesion expirada');
 }

 if (json.code !== '01') {
 throw new Error(json.message || 'Error del servidor');
 }

 return json.data;
 }

 download(path: string, filename?: string): void {
 const token = this.getToken();
 const url = `${API_BASE}${path}`;
 const link = document.createElement('a');
 link.href = url;
 if (token) {
 fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
 .then(r => r.blob())
 .then(blob => {
 const blobUrl = URL.createObjectURL(blob);
 link.href = blobUrl;
 link.download = filename || 'reporte.csv';
 link.click();
 URL.revokeObjectURL(blobUrl);
 })
 .catch(() => { window.open(url, '_blank'); });
 } else {
 link.click();
 }
 }

 async getBlob(path: string): Promise<Blob> {
 const token = this.getToken();
 const res = await fetch(`${API_BASE}${path}`, {
 headers: { 'Authorization': `Bearer ${token}` }
 });
 if (!res.ok) throw new Error('Error al descargar archivo');
 return res.blob();
 }
}

export const api = new ApiClient();
export type { PaginatedData, ApiResponse };
