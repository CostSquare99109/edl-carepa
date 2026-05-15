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

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, opts);
    } catch {
      throw new Error('No se puede conectar con el servidor. Verifique que el backend este corriendo en localhost:8000');
    }

    const text = await res.text();
    if (!text) {
      throw new Error('El servidor no respondio. Verifique que el backend este corriendo en localhost:8000');
    }

    let json: ApiResponse<T>;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Respuesta invalida del servidor. El backend esta corriendo? Respuesta: ' + text.substring(0, 200));
    }

    if (res.status === 401) {
      localStorage.removeItem('edl_token');
      localStorage.removeItem('edl_user');
      window.location.href = '/edl-cnsc/login';
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
