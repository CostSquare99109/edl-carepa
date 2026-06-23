import { useEffect, useState } from 'react';
import { api } from '../api';

export interface Contadores {
  notificaciones_no_leidas: number;
  compromisos_pendientes_aprobacion: number;
  mis_compromisos_enviados: number;
  evaluaciones_pendientes: number;
}

const EMPTY: Contadores = {
  notificaciones_no_leidas: 0,
  compromisos_pendientes_aprobacion: 0,
  mis_compromisos_enviados: 0,
  evaluaciones_pendientes: 0,
};

export function useContadores(intervalMs = 60_000): Contadores {
  const [contadores, setContadores] = useState<Contadores>(EMPTY);

  useEffect(() => {
    let cancel = false;
    async function fetchData() {
      try {
        const res = await api.get<Contadores>('/dashboard/resumen');
        if (!cancel) setContadores({ ...EMPTY, ...res });
      } catch {
        if (!cancel) setContadores(EMPTY);
      }
    }
    fetchData();
    const t = window.setInterval(fetchData, intervalMs);
    return () => {
      cancel = true;
      window.clearInterval(t);
    };
  }, [intervalMs]);

  return contadores;
}
