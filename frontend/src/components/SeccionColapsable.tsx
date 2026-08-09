/**
 * SeccionColapsable.tsx — Componente UI reusable (Fase 5)
 *
 * Acordeon ligero para agrupar contenido en la ficha del Manual de Funciones.
 * Permite definir si inicia abierto o cerrado, mostrar contador, e icono.
 *
 * Uso:
 *   <SeccionColapsable titulo="Funciones Esenciales" icono="checklist" defaultAbierto badgeCount={15}>
 *     <ol>...</ol>
 *   </SeccionColapsable>
 */

import { useState } from 'react';

interface Props {
  titulo: string;
  icono?: string;
  defaultAbierto?: boolean;
  badgeCount?: number;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SeccionColapsable({
  titulo,
  icono = 'description',
  defaultAbierto = false,
  badgeCount,
  badgeColor = 'bg-inst-azul-light text-inst-azul',
  children,
  className = '',
}: Props) {
  const [abierto, setAbierto] = useState(defaultAbierto);

  return (
    <div className={`bg-inst-surface border rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="material-icons text-inst-azul">{icono}</span>
          <h2 className="text-base font-semibold text-inst-azul">{titulo}</h2>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badgeCount}
            </span>
          )}
        </div>
        <span className="material-icons text-gray-400">
          {abierto ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {abierto && (
        <div className="px-5 py-4 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}
