/**
 * Helpers puros para construir headers HTTP. Aislados para poder testearlos
 * sin montar React ni jsdom (más rápido y más estable).
 *
 * Mantener sincronizado con `frontend/src/lib/api.ts` (CSRf + JWT).
 */

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('edl_token')
  const csrf = localStorage.getItem('edl_csrf')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (csrf) headers['X-CSRF-Token'] = csrf
  return headers
}
