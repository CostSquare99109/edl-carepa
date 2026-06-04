import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

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

interface NotificationBellProps {
 adminPath?: string;
}

export default function NotificationBell({ adminPath = '/notificaciones' }: NotificationBellProps) {
 const navigate = useNavigate();
 const [open, setOpen] = useState(false);
 const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
 const [noLeidas, setNoLeidas] = useState(0);

 useEffect(() => {
  const cargar = async () => {
   try {
    const res = await api.get<any>('/notificaciones?por_pagina=10');
    const items = res.data || res.items || res || [];
    setNotificaciones(Array.isArray(items) ? items : []);
    setNoLeidas(items.filter?.((n: Notificacion) => !n.leida)?.length || 0);
   } catch { /* silencioso */ }
  };
  cargar();
  const interval = setInterval(cargar, 30000);
  return () => clearInterval(interval);
 }, []);

 const marcarLeida = async (id: number) => {
  try { await api.put(`/notificaciones/${id}/leer`); } catch {}
  setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  setNoLeidas(prev => Math.max(0, prev - 1));
 };

 return (
  <div className="relative mr-2">
   <button
    onClick={() => setOpen(!open)}
    className="relative p-2 rounded-lg hover:bg-inst-gris transition-colors"
   >
    <span className="material-icons text-inst-texto">notifications</span>
    {noLeidas > 0 && (
     <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-inst-rojo rounded-full text-white text-[10px] flex items-center justify-center font-bold px-1">
      {noLeidas}
     </span>
    )}
   </button>
   {open && (
    <>
     <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
     <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-inst-borde z-20">
      <div className="px-4 py-3 border-b border-inst-borde flex items-center justify-between">
       <p className="font-heading font-semibold text-inst-azul text-sm">Notificaciones</p>
       {noLeidas > 0 && <span className="text-xs bg-inst-rojo text-white rounded-full px-2 py-0.5">{noLeidas} nueva(s)</span>}
      </div>
      <div className="py-2 max-h-64 overflow-y-auto">
       {notificaciones.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">No hay notificaciones</p>
       ) : (
        notificaciones.map(n => (
         <div
          key={n.id}
          onClick={() => { if (!n.leida) marcarLeida(n.id); }}
          className={`px-4 py-3 hover:bg-inst-gris transition-colors cursor-pointer border-l-4 ${NOTIF_COLOR[n.tipo] || 'border-gray-300'} ${!n.leida ? 'bg-blue-50/50' : ''}`}
         >
          <div className="flex items-start gap-2">
           <span className="material-icons text-base mt-0.5 text-inst-texto-claro">{NOTIF_ICON[n.tipo] || 'notifications'}</span>
           <div className="min-w-0 flex-1">
            <p className={`text-sm ${!n.leida ? 'font-semibold text-inst-texto' : 'text-inst-texto'}`}>{n.titulo}</p>
            <p className="text-xs text-inst-texto-claro mt-0.5 line-clamp-2">{n.mensaje}</p>
            <p className="text-[10px] text-inst-texto-claro/60 mt-1">
             {new Date(n.creado_en).toLocaleString('es-CO')}
            </p>
           </div>
          </div>
         </div>
        ))
       )}
      </div>
      <div className="px-4 py-2 border-t border-inst-borde text-center">
       <button
        onClick={() => { setOpen(false); navigate(adminPath); }}
        className="text-xs text-inst-azul hover:underline font-medium"
       >
        Ver todas las notificaciones
       </button>
      </div>
     </div>
    </>
   )}
  </div>
 );
}
