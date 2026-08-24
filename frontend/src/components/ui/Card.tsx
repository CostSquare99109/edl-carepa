import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'interactive';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children?: ReactNode;
}

const variantClass: Record<CardVariant, string> = {
  default: 'edl-card',
  elevated: 'edl-card shadow-md hover:shadow-lg transition-shadow',
  interactive:
    'edl-card hover:shadow-md hover:border-inst-azul/40 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer',
};

export function Card({ variant = 'default', className = '', children, ...rest }: CardProps) {
  return (
    <div className={[variantClass[variant], className].join(' ')} {...rest}>
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  progress?: number;
}

const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
  neutral: 'text-inst-azul',
  success: 'text-inst-azul',
  warning: 'text-amber-600',
  danger: 'text-inst-rojo',
  info: 'text-inst-azul',
};

export function KpiCard({ label, value, hint, icon, tone = 'neutral', progress }: KpiCardProps) {
  return (
    <Card variant="elevated" className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-inst-texto-claro uppercase tracking-wide">
          {label}
        </span>
        {icon ? (
          <span className={[toneClasses[tone], 'opacity-70'].join(' ')} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className={['text-3xl font-bold', toneClasses[tone]].join(' ')}>{value}</div>
      {hint ? <div className="text-xs text-inst-texto-claro">{hint}</div> : null}
      {typeof progress === 'number' ? (
        <div className="edl-progress mt-1" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="edl-progress-bar" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      ) : null}
    </Card>
  );
}

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  dot?: boolean;
  className?: string;
}

const badgeTone: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'edl-badge-gris',
  success: 'edl-badge-verde',
  warning: 'edl-badge-amarillo',
  danger: 'edl-badge-rojo',
  info: 'edl-badge bg-inst-azul-surface text-inst-texto-2',
};

const dotTone: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-inst-azul',
  warning: 'bg-amber-500',
  danger: 'bg-inst-rojo',
  info: 'bg-inst-azul',
};

export function Badge({ children, tone = 'neutral', dot = false, className = '' }: BadgeProps) {
  return (
    <span className={[badgeTone[tone], className].join(' ')}>
      {dot ? <span className={['inline-block w-1.5 h-1.5 rounded-full mr-1.5', dotTone[tone]].join(' ')} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

interface AlertProps {
  children: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertTone: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'bg-inst-azul-surface border-inst-borde text-inst-texto',
  success: 'bg-inst-azul-light border-green-200 text-inst-azul',
  warning: 'bg-inst-amarillo-light border-amber-200 text-amber-800',
  danger: 'bg-red-50 border-red-200 text-inst-rojo',
};

const alertIcon: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

export function Alert({ children, tone = 'info', title, icon, onDismiss, className = '' }: AlertProps) {
  return (
    <div role="alert" className={['flex items-start gap-3 p-3 rounded-lg border text-sm', alertTone[tone], className].join(' ')}>
      <span className="text-base leading-none mt-0.5" aria-hidden="true">{icon ?? alertIcon[tone]}</span>
      <div className="flex-1">
        {title ? <div className="font-semibold mb-0.5">{title}</div> : null}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
