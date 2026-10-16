/**
 * Constantes del mensaje institucional 500. Aisladas para romper el ciclo
 * de importacion entre `ErrorContext.tsx` y `lib/errorEvents.ts`.
 *
 * Cualquier parte que necesite el texto puede importarlo desde aqui sin
 * generar dependencias circulares.
 *
 * Mantener sincronizado con `backend/src/Helper/ResponseHelper.php -> SERVER_ERROR_MESSAGE`.
 */
export const SERVER_ERROR_MESSAGE =
  'Estamos presentando un problema en el servidor. Ya estamos trabajando para solucionarlo. Por favor, intentalo de nuevo en unos minutos.';
