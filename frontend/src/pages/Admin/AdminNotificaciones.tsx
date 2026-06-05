import { useState, useEffect, useCallback } from 'react';
import { COLORES_TAILWIND } from '../../styles/colors';
import { api, PaginatedData } from '../../lib/api';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  creado_en: string;
}

const NOTIF_ICON: Record<string, string> = {
  info: 'info', alerta: 'warning', exito: 'check_circle', error: 'error',
};
const NOTIF_COLOR: Record<string, string> = {
  info: 'border-inst-azul', alerta: 'border-amber-500', exito: 'border-inst-verde', error: 'border-inst-rojo',
};
const NOTIF_BG: Record<string, string> = {
  info: 'bg-blue-50', alerta: 'bg-amber-50', exito: 'bg-green-50', error: 'bg-red-50',
};

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const res = await api.get<any>(`/notificaciones?pagina=${pagina}&por_pagina=20`);
      // La respuesta puede venir como { data, total, pagina, por_pagina, total_paginas } o como array
      if (Array.isArray(res)) {
        setNotificaciones(res); setTotal(res.length);
      } else {
        setNotificaciones(res.data || res.items || []); setTotal(res.total || 0);
      }
    } catch (e: any) { setError(e.message); }
    setCargando(false);
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarLeida = async (id: number) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones(prev => prev.map(n => n.id === id ? {...n, leida: true} : n));
    } catch (e: any) { alert(e.message); }
  };

  const marcarTodasLeidas = async () => {
    setMarcandoTodas(true);
    try {
      // Marcar todas una por una (podría optimizarse con endpoint masivo)
      const noLeidas = notificaciones.filter(n => !n.leida);
      await Promise.all(noLeidas.map(n => api.put(`/notificaciones/${n.id}/leer`)));
      setNotificaciones(prev => prev.map(n => ({...n, leida: true})));
    } catch (e: any) { alert(e.message); }
    setMarcandoTodas(false);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${COLORES_TAILWIND.azulClaroText}`}><i className="fas fa-bell mr-2" />Notificaciones</h2>
        <button onClick={marcarTodasLeidas} disabled={marcandoTodas}
        className={`text-sm ${COLORES_TAILWIND.azulClaro} text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50`}>
          {marcandoTodas ? 'Marcando...' : 'Marcar todas como leídas'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      {cargando ? (
        <div className="flex justify-center py-20"><div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${COLORES_TAILWIND.azulClaroBorder}`} /></div>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-400">
          <span className="material-icons text-5xl mb-2 block">notifications_off</span>
          No hay notificaciones
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map(n => (
            <div key={n.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${NOTIF_COLOR[n.tipo] || 'border-gray-300'} ${!n.leida ? NOTIF_BG[n.tipo] || 'bg-blue-50/50' : ''} p-4 hover:shadow-md transition cursor-pointer`}
              onClick={() => { if (!n.leida) marcarLeida(n.id); }}
            >
              <div className="flex items-start gap-3">
                <span className="material-icons text-xl mt-0.5 text-inst-texto-claro">{NOTIF_ICON[n.tipo] || 'notifications'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${!n.leida ? 'font-semibold' : ''} text-inst-texto`}>{n.titulo}</p>
                    {!n.leida && <span className="w-2 h-2 rounded-full bg-inst-rojo flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-inst-texto-claro mt-1">{n.mensaje}</p>
                  <p className="text-xs text-inst-texto-claro/60 mt-2">
                    <span className="material-icons text-xs align-middle mr-1">schedule</span>
                    {new Date(n.creado_en).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pagina - 3), pagina + 2).map(p => (
                <button key={p} onClick={() => setPagina(p)}
                  className={`px-3 py-1 rounded text-sm ${p === pagina ? `${COLORES_TAILWIND.azulClaro} text-white` : 'bg-white border hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
