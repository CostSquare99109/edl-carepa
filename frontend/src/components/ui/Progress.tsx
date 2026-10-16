interface ProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className = '', showLabel = false }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full ${className}`}>
      <div className="edl-progress h-full bg-inst-gris-med rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="edl-progress-bar h-full bg-inst-azul rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="text-xs text-inst-texto-claro ml-1">{pct}%</span>
      )}
    </div>
  );
}
