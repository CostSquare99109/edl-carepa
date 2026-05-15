const API_BASE = '/api/v1';

interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('edl_token');
  }

  private headers(json = true): HeadersInit {
    const h: HeadersInit = {};
    if (json) h['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const opts: RequestInit = {
      method,
      headers: this.headers(typeof body !== 'undefined'),
    };
    if (body !== undefined && body !== null) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const json: ApiResponse<T> = await res.json();

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
}

export const api = new ApiClient();
export type { PaginatedData, ApiResponse };
