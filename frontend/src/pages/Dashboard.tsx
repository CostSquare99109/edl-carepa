import { useEffect, useState } from 'react';
import { api, type PaginatedData } from '../lib/api';

interface Resumen {
  entidades: number;
  usuarios: number;
  evaluaciones: number;
  periodos: number;
}

interface Actividad {
  id: number;
  descripcion: string;
  fecha: string;
  tipo: string;
}

const CARD_ITEMS = [
  { key: 'entidades', label: 'Entidades', icon: 'domain', color: 'text-inst-azul' },
  { key: 'usuarios', label: 'Usuarios', icon: 'people', color: 'text-inst-azul' },
  { key: 'evaluaciones', label: 'Evaluaciones', icon: 'assessment', color: 'text-inst-verde' },
  { key: 'periodos', label: 'Periodos activos', icon: 'calendar_today', color: 'text-inst-rojo' },
] as const;

export default function Dashboard() {
  const [resumen, setResumen] = useState<Resumen>({ entidades: 0, usuarios: 0, evaluaciones: 0, periodos: 0 });
  const [actividad, setActividad] = useState<Actividad[]>([]);

  useEffect(() => {
    api.get<Resumen>('/dashboard/resumen').then(setResumen).catch(() => {});
    api.get<PaginatedData<Actividad>>('/dashboard/actividad?por_pagina=10')
      .then((r) => setActividad(r.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="edl-section-title mb-6">Panel principal</h2>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARD_ITEMS.map((item) => (
          <div key={item.key} className="edl-card flex items-center gap-4">
            <div className={`${item.color} bg-inst-gris rounded-lg p-3`}>
              <span className="material-icons text-2xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-inst-azul">
                {resumen[item.key]}
              </p>
              <p className="text-sm text-inst-texto-claro">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actividad reciente */}
      <div className="edl-card">
        <h3 className="edl-section-title mb-4">Actividad reciente</h3>
        {actividad.length === 0 ? (
          <p className="text-sm text-inst-texto-claro py-4">No hay actividad registrada.</p>
        ) : (
          <div className="space-y-0">
            {actividad.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-3 border-b border-inst-borde last:border-b-0"
              >
                {/* Línea roja a la izquierda */}
                <div className="w-1 self-stretch bg-inst-rojo rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-inst-texto">{a.descripcion}</p>
                  <p className="text-xs text-inst-texto-claro mt-0.5">{a.fecha}</p>
                </div>
                <span className="edl-badge bg-inst-gris text-inst-texto-claro text-xs">
                  {a.tipo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
