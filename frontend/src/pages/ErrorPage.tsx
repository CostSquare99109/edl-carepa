import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppError, SERVER_ERROR_MESSAGE } from '../contexts/ErrorContext';

/**
 * Pagina institucional de error.
 *
 * Reglas duras:
 * - NUNCA muestra trazas, SQL, rutas internas ni detalles tecnicos.
 * - HTTP 500 en el backend sigue siendo 500 (esto es solo UI).
 * - El usuario SIEMPRE ve el mensaje institucional.
 *
 * Casos de uso:
 * - Cualquier 500 del backend redirige aqui (/error).
 * - Cualquier excepcion React no controlada que dispare ErrorBoundary
 *   renderiza este mismo componente.
 * - Puede invocarse manualmente via useAppError().showError({ fullPage: true }).
 */
export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, clearError } = useAppError();

  // Si llegamos aqui sin un error en el contexto (ej. navegacion manual),
  // igualmente mostramos el mensaje institucional para no exponer nada raro.
  const message = error?.message ?? SERVER_ERROR_MESSAGE;

  useEffect(() => {
    // Forzar el titulo de la pestana para que tampoco diga algo tecnico.
    document.title = 'Problema en el servidor | EDL Carepa';
  }, []);

  const handleRetry = () => {
    clearError();
    // Volver a la pantalla anterior o al dashboard.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleHome = () => {
    clearError();
    navigate('/dashboard');
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center bg-inst-fondo px-4 py-8"
    >
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-inst-borde">
        {/* Banda superior institucional azul Carepa */}
        <div className="bg-[#0A2B5E] px-6 py-5 flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-white"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              Alcaldia de Carepa
            </p>
            <h1 className="text-xl font-heading font-bold text-white leading-tight">
              Evaluacion del Desempeno Laboral
            </h1>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="text-2xl font-heading font-bold text-inst-azul mb-3">
            Tenemos una dificultad tecnica
          </h2>

          <p className="text-base text-inst-texto leading-relaxed mb-6">
            {message}
          </p>

          <div className="bg-inst-fondo border border-inst-borde rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-inst-texto-claro">
              <strong className="text-inst-azul">Que puedo hacer?</strong>
              <br />
              Espera unos minutos y vuelve a intentarlo. Si el problema persiste,
              contacta al administrador del sistema.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="flex-1 px-5 py-3 bg-[#0A2B5E] hover:bg-[#082347] text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2B5E]"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={handleHome}
              className="flex-1 px-5 py-3 bg-white border border-inst-borde text-inst-azul hover:bg-inst-fondo font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2B5E]"
            >
              Ir al inicio
            </button>
          </div>

          <p className="text-xs text-inst-texto-claro text-center mt-6">
            Codigo de referencia: HTTP 500.{' '}
            <Link to="/login" className="underline hover:text-inst-azul">
              Iniciar sesion nuevamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
