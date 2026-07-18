/**
 * NaturalezaBadge.tsx — Fase 5 componente UI
 *
 * Badge para las 6 naturalezas del cargo del Manual de Funciones:
 *   carrera_administrativa, libre_nombramiento,
 *   libre_nombramiento_gerencia_publica, libre_nombramiento_remocion,
 *   periodo_fijo, temporal
 *
 * Uso:
 *   <NaturalezaBadge naturaleza="carrera_administrativa" />
 */

export type Naturaleza =
  | 'carrera_administrativa'
  | 'libre_nombramiento'
  | 'libre_nombramiento_gerencia_publica'
  | 'libre_nombramiento_remocion'
  | 'periodo_fijo'
  | 'temporal';

interface Props {
  naturaleza: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const NATURALEZA_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
  carrera_administrativa: {
    label: 'Carrera Admin.',
    color: 'bg-green-100',
    textColor: 'text-green-800',
  },
  libre_nombramiento: {
    label: 'Libre Nombramiento',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  libre_nombramiento_gerencia_publica: {
    label: 'Libre Nom. Gerencia Pub.',
    color: 'bg-pink-100',
    textColor: 'text-pink-800',
  },
  libre_nombramiento_remocion: {
    label: 'Libre Nom. y Remocion',
    color: 'bg-rose-100',
    textColor: 'text-rose-800',
  },
  periodo_fijo: {
    label: 'Periodo Fijo',
    color: 'bg-violet-100',
    textColor: 'text-violet-800',
  },
  temporal: {
    label: 'Temporal',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
};

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function NaturalezaBadge({ naturaleza, size = 'sm', className = '' }: Props) {
  const key = (naturaleza || '').toLowerCase().trim();
  const cfg = NATURALEZA_CONFIG[key] || {
    label: naturaleza,
    color: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${cfg.color} ${cfg.textColor} ${SIZE_CLASSES[size]} ${className}`}
      title={`Naturaleza: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}
