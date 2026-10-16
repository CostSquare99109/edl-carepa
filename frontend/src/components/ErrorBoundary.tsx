import { Component, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { useAppError, SERVER_ERROR_MESSAGE } from '../contexts/ErrorContext';

interface Props {
  children: ReactNode;
  /** Si true, redirige a /error al capturar. Si false, muestra modal in-place. */
  fullPage?: boolean;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary global.
 *
 * Captura cualquier excepcion no controlada durante el render de React y la
 * canaliza al <ErrorProvider>. NUNCA muestra trazas al usuario: siempre se
 * renderiza el mensaje institucional 500 (SERVER_ERROR_MESSAGE).
 *
 * El detalle tecnico va unicamente a la consola del navegador (para devs).
 */
class ErrorBoundaryImpl extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log tecnico SOLO en consola. NUNCA al usuario.
    // eslint-disable-next-line no-console
    console.error('[EDL ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback fullPage={this.props.fullPage} />;
    }
    return this.props.children;
  }
}

/** useEffect que solo se ejecuta una vez por montura del componente. */
function useEffectOnce(fn: () => void) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fn();
  }, [fn]);
}

/**
 * Sub-componente que vive dentro del Provider para poder usar el contexto.
 * Se monta cuando ErrorBoundary detecta un error.
 */
function ErrorBoundaryFallback({ fullPage = false }: { fullPage?: boolean }) {
  const { showError } = useAppError();

  // Disparamos el error al contexto una sola vez al montar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffectOnce(() => {
    showError({
      message: SERVER_ERROR_MESSAGE,
      technical: 'ErrorBoundary capturo una excepcion de render no controlada',
      fullPage,
    });
  });

  return null;
}

export default ErrorBoundaryImpl;
