import { useContext } from 'react';
import { AuthContext, type AuthContextType } from './authContextValue';

/**
 * Hook para consumir el AuthContext.
 *
 * Aislado en archivo propio (sin componentes React) para que Vite Fast Refresh
 * pueda reemplazar la UI sin hacer full page reload cuando se edita el Provider.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
