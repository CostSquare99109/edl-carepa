import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppError, SERVER_ERROR_MESSAGE } from '../contexts/ErrorContext';

/**
 * Modal global de error.
 *
 * Aparece sobre la UI actual cuando se dispara un error que NO es fullPage.
 * Mantiene al usuario en su flujo (no rompe la navegacion) y le da una
 * opcion para ir a la pagina completa de error o reintentar.
 *
 * NUNCA muestra trazas, SQL ni detalles tecnicos. Solo el mensaje
 * institucional.
 */
export default function ErrorModal() {
  const navigate = useNavigate();
  const { error, clearError } = useAppError();

  // Bloquear scroll del body cuando el modal esta abierto.
  useEffect(() => {
    if (!error || error.fullPage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [error]);

  if (!error || error.fullPage) return null;

  const message = error.message || SERVER_ERROR_MESSAGE;

  const handleGoFullPage = () => {
    clearError();
    navigate('/error');
  };

  const handleClose = () => {
    clearError();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="edl-error-modal-title"
      aria-describedby="edl-error-modal-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-inst-borde animate-[fadeIn_0.18s_ease-out]">
        <div className="bg-[#0A2B5E] px-5 py-4 flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
              Alcaldia de Carepa
            </p>
            <h2
              id="edl-error-modal-title"
              className="text-base font-heading font-bold text-white leading-tight truncate"
            >
              Problema en el servidor
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white p-1 rounded focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6">
          <p
            id="edl-error-modal-desc"
            className="text-sm text-inst-texto leading-relaxed mb-5"
          >
            {message}
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-inst-texto-claro bg-inst-gris rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inst-borde"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleGoFullPage}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0A2B5E] hover:bg-[#082347] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2B5E]"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
