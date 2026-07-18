/**
 * PlantaBadge.tsx — Fase 5 componente UI
 *
 * Badge para diferenciar Planta Global (permanente) de Planta Temporal.
 *
 * Uso:
 *   <PlantaBadge planta="global" />
 *   <PlantaBadge planta="temporal" />
 */

export type Planta = 'global' | 'temporal';

interface Props {
  planta: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const PLANTA_CONFIG: Record<Planta, { label: string; color: string; textColor: string }> = {
  global: { label: 'Global', color: 'bg-blue-100', textColor: 'text-blue-800' },
  temporal: { label: 'Temporal', color: 'bg-amber-100', textColor: 'text-amber-800' },
};

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function PlantaBadge({ planta, size = 'sm', className = '' }: Props) {
  const key = (planta || '').toLowerCase().trim() as Planta;
  const cfg = PLANTA_CONFIG[key] || { label: planta, color: 'bg-gray-100', textColor: 'text-gray-800' };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${cfg.color} ${cfg.textColor} ${SIZE_CLASSES[size]} ${className}`}
      title={`Planta: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}
