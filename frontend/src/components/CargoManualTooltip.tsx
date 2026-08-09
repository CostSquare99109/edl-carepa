/**
 * CargoManualTooltip.tsx — Fase 8 integración EDL
 *
 * Tooltip/popover que muestra el "Proposito Principal" del cargo
 * del Manual de Funciones de un usuario. Para mostrar contexto en:
 *   - Panel del Evaluador
 *   - Formulario de Concertacion
 *   - Lista de Evaluados
 *
 * Props:
 *   usuarioId: ID del usuario (busca su cargo del manual)
 *   inline: renderiza inline sin popover
 *   className: estilos adicionales
 *
 * API: GET /api/v1/usuarios/{id}/cargo-manual
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Cargo {
  id: number;
  denominacion: string;
  codigo: string;
  grado: string;
  planta: string;
  dependencia_nombre: string;
  nivel: string;
  naturaleza: string;
  proposito_principal: string;
}

interface Props {
  usuarioId: number;
  inline?: boolean;
  className?: string;
}

export default function CargoManualTooltip({ usuarioId, inline = false, className = '' }: Props) {
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<Cargo>(`/usuarios/${usuarioId}/cargo-manual`)
      .then((data) => {
        if (mounted) setCargo(data);
      })
      .catch(() => {
        if (mounted) setCargo(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [usuarioId]);

  if (loading) {
    return (
      <span className={`text-xs text-gray-400 italic ${className}`}>Cargando cargo...</span>
    );
  }

  if (!cargo) {
    return (
      <span className={`text-xs text-amber-600 italic ${className}`} title="Este usuario no tiene cargo asignado del Manual de Funciones">
        Sin cargo del manual
      </span>
    );
  }

  const textoCorto = (cargo.proposito_principal || '').slice(0, 140) + (cargo.proposito_principal && cargo.proposito_principal.length > 140 ? '...' : '');

  if (inline) {
    return (
      <div className={`text-xs text-gray-600 bg-inst-azul-surface border-l-4 border-inst-azul p-2 my-1 ${className}`}>
        <div className="font-semibold text-inst-azul">Proposito Principal (Manual 159/2024)</div>
        <div className="text-gray-700 mt-1">{cargo.proposito_principal}</div>
      </div>
    );
  }

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-inst-azul-light text-inst-azul rounded-full hover:bg-inst-azul-light cursor-help"
        aria-label={`Ver proposito principal del cargo ${cargo.denominacion}`}
      >
        <span className="material-icons text-xs">info</span>
        <span>Mi Cargo</span>
      </button>
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-80 bg-inst-surface border border-gray-300 rounded-lg shadow-lg p-3 text-left"
        >
          <div className="text-xs font-bold text-inst-azul">{cargo.denominacion}</div>
          <div className="text-[10px] text-gray-500 mb-2">
            Codigo {cargo.codigo}-{cargo.grado} | {cargo.planta} | {cargo.dependencia_nombre}
          </div>
          <div className="text-[10px] font-semibold text-gray-700 mb-1">Proposito Principal:</div>
          <div className="text-xs text-gray-800 leading-snug">{textoCorto}</div>
          <div className="mt-2 text-right">
            <a
              href={`/dashboard/manual-funciones/${cargo.id}`}
              className="text-[10px] text-inst-azul hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver ficha completa
            </a>
          </div>
        </div>
      )}
    </span>
  );
}
