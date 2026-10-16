/**
 * Bus de eventos para errores 500.
 *
 * api.ts (modulo singleton, fuera del arbol React) dispara este evento cuando
 * el backend devuelve 500. El ErrorProvider (dentro del arbol React) escucha
 * el evento y llama a showError() para mostrar la UI amigable.
 *
 * Esto evita acoplar api.ts directamente con el contexto de React y mantiene
 * el ApiClient testeable de forma aislada.
 */

import { SERVER_ERROR_MESSAGE } from './serverErrorConstants';

export interface ServerErrorDetail {
  /** Mensaje que vera el usuario. Por defecto el institucional 500. */
  message?: string;
  /** Detalle tecnico SOLO para consola/logs. Nunca al usuario. */
  technical?: string;
  /** URL del endpoint que fallo. Solo log interno. */
  endpoint?: string;
  /** HTTP status code. */
  status?: number;
  /**
   * Si true, el ErrorProvider navegara a /error (fullPage).
   * Por defecto false (modal in-place). Usar solo para errores
   * que rompen la UI completa, no para 500 transitorios.
   */
  fullPage?: boolean;
}

export const SERVER_ERROR_EVENT = 'edl:server-error';

export function dispatchServerError(detail: ServerErrorDetail = {}): void {
  if (typeof window === 'undefined') return;
  const payload = {
    message: detail.message ?? SERVER_ERROR_MESSAGE,
    technical: detail.technical ?? '',
    endpoint: detail.endpoint ?? '',
    status: detail.status ?? 500,
    fullPage: detail.fullPage ?? false,
  };
  window.dispatchEvent(new CustomEvent(SERVER_ERROR_EVENT, { detail: payload }));
}
