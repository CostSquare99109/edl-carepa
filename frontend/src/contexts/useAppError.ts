import { useContext } from 'react';
import { ErrorContext, type ErrorContextValue } from './errorContextValue';

/**
 * Hook para consumir el ErrorContext.
 *
 * Aislado en archivo propio (sin componentes React) para que Vite Fast Refresh
 * pueda actualizar el Provider sin hacer full page reload.
 *
 * Fallback defensivo: si se usa fuera del provider devuelve un noop para no
 * romper la app, pero loguea para que se note en consola.
 */
export function useAppError(): ErrorContextValue {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    // eslint-disable-next-line no-console
    console.warn('[EDL] useAppError usado fuera de <ErrorProvider>');
    return {
      error: null,
      showError: () => undefined,
      clearError: () => undefined,
    };
  }
  return ctx;
}
