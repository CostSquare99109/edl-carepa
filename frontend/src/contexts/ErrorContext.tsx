import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SERVER_ERROR_EVENT, type ServerErrorDetail } from '../lib/errorEvents';
import { SERVER_ERROR_MESSAGE } from '../lib/serverErrorConstants';
import { ErrorContext, type ErrorContextValue } from './errorContextValue';

export { useAppError } from './useAppError';
export { ErrorContext } from './errorContextValue';
export type { ErrorContextValue } from './errorContextValue';
// Re-export para no romper imports existentes que importaban
// SERVER_ERROR_MESSAGE desde ErrorContext. Se conserva la API publica.
export { SERVER_ERROR_MESSAGE };

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ErrorContextValue['error']>(null);

  const showError = useCallback((opts: Partial<NonNullable<ErrorContextValue['error']>> = {}) => {
    const next: NonNullable<ErrorContextValue['error']> = {
      message: opts.message ?? SERVER_ERROR_MESSAGE,
      technical: opts.technical,
      fullPage: opts.fullPage ?? false,
    };

    if (next.technical) {
      // eslint-disable-next-line no-console
      console.error('[EDL ERROR]', next.technical);
    } else {
      // eslint-disable-next-line no-console
      console.error('[EDL ERROR]', next.message);
    }

    setError(next);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    function handler(ev: Event) {
      const detail = (ev as CustomEvent<ServerErrorDetail>).detail ?? {};
      const requestedFullPage = detail.fullPage === true;
      showError({
        message: detail.message ?? SERVER_ERROR_MESSAGE,
        technical: [detail.technical, detail.endpoint ? `endpoint=${detail.endpoint}` : '']
          .filter(Boolean)
          .join(' | '),
        fullPage: requestedFullPage,
      });
      if (requestedFullPage && typeof window !== 'undefined') {
        if (window.location.pathname !== '/error') {
          window.history.pushState({}, '', '/error');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }
    window.addEventListener(SERVER_ERROR_EVENT, handler);
    return () => window.removeEventListener(SERVER_ERROR_EVENT, handler);
  }, [showError]);

  const value = useMemo<ErrorContextValue>(
    () => ({ error, showError, clearError }),
    [error, showError, clearError],
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}
