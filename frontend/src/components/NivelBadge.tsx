/**
 * NivelBadge.tsx — Fase 5 componente UI
 *
 * Badge visual para los 5 niveles jerárquicos del Manual de Funciones:
 *   directivo, asesor, profesional, tecnico, asistencial
 *
 * Uso:
 *   <NivelBadge nivel="profesional" />
 *   <NivelBadge nivel={cargo.nivel} size="sm" />
 */

export type NivelJerarquico = 'directivo' | 'asesor' | 'profesional' | 'tecnico' | 'asistencial';

interface Props {
  nivel: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const NIVEL_CONFIG: Record<NivelJerarquico, { label: string; color: string; textColor: string }> = {
  directivo: { label: 'Directivo', color: 'bg-inst-gris-med', textColor: 'text-inst-texto' },
  asesor: { label: 'Asesor', color: 'bg-inst-azul-light', textColor: 'text-inst-azul' },
  profesional: { label: 'Profesional', color: 'bg-inst-azul-light', textColor: 'text-inst-azul' },
  tecnico: { label: 'Tecnico', color: 'bg-amber-100', textColor: 'text-amber-800' },
  asistencial: { label: 'Asistencial', color: 'bg-gray-100', textColor: 'text-gray-800' },
};

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function NivelBadge({ nivel, size = 'sm', className = '' }: Props) {
  const key = (nivel || '').toLowerCase().trim() as NivelJerarquico;
  const cfg = NIVEL_CONFIG[key] || { label: nivel, color: 'bg-gray-100', textColor: 'text-gray-800' };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${cfg.color} ${cfg.textColor} ${SIZE_CLASSES[size]} ${className}`}
      title={`Nivel: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}
