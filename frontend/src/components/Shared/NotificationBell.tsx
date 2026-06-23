import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, type PaginatedData } from '../../lib/api';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: number;
  creado_en: string;
}

const NOTI_ICON: Record<string, string> = {
  info: 'info',
  alerta: 'notifications_active',
  error: 'error',
  exito: 'check_circle',
};

const NOTI_COLOR: Record<string, string> = {
  info: 'text-blue-600 bg-blue-100',
  alerta: 'text-yellow-700 bg-yellow-100',
  error: 'text-red-600 bg-red-100',
  exito: 'text-green-600 bg-green-100',
};

export default function NotificationBell() {
  const { rolActivo } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    load();
  }, [rolActivo]);

  async function load() {
    try {
      setLoading(true);
      const r = await api.get<PaginatedData<Notificacion>>('/notificaciones?por_pagina=8');
      setNotificaciones(Array.isArray(r?.data) ? r.data : []);
    } catch {
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }

  async function marcarLeida(id: number) {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
    } catch {}
  }

  function handleClickNoti() {
    setOpen(false);
    navigate('/notificaciones');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-inst-gris-med text-inst-texto-claro hover:text-inst-verde transition-colors"
        title="Notificaciones"
      >
        <span className="material-icons text-xl">notifications</span>
        {noLeidas > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-inst-rojo text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-inst-borde rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-inst-borde bg-inst-gris-med">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-inst-azul-osc text-sm">
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span className="bg-inst-amarillo text-inst-azul-osc text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {noLeidas} nueva{noLeidas > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={load}
              className="p-1 rounded hover:bg-white text-inst-texto-claro"
              title="Actualizar"
            >
              <span className={`material-icons text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-inst-texto-claro">
                <span className="material-icons text-4xl opacity-40">notifications_none</span>
                <p className="text-sm mt-2">Sin notificaciones</p>
              </div>
            ) : (
              notificaciones.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.leida) marcarLeida(n.id);
                    handleClickNoti();
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-inst-borde last:border-b-0 hover:bg-inst-gris transition-colors ${
                    !n.leida ? 'bg-inst-verde-light/40' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${NOTI_COLOR[n.tipo] || 'bg-gray-100 text-gray-600'}`}>
                    <span className="material-icons text-base">{NOTI_ICON[n.tipo] || 'info'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${n.leida ? 'text-inst-texto-claro' : 'text-inst-texto font-semibold'}`}>
                      {n.titulo}
                    </p>
                    <p className="text-xs text-inst-texto-claro mt-1 line-clamp-2">
                      {n.mensaje}
                    </p>
                    <p className="text-[10px] text-inst-texto-claro mt-1">
                      {n.creado_en}
                    </p>
                  </div>
                  {!n.leida && (
                    <span className="w-2 h-2 rounded-full bg-inst-verde flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-inst-borde px-4 py-2 bg-inst-gris-med">
            <button
              onClick={handleClickNoti}
              className="w-full text-center text-xs font-medium text-inst-verde hover:text-inst-verde-hover py-1"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
