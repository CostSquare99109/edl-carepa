import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'row';
  width?: string | number;
  height?: string | number;
}

const variantClass: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-3 w-full rounded',
  circle: 'rounded-full',
  rect: 'rounded-lg',
  card: 'rounded-xl h-32',
  row: 'h-10 w-full rounded-lg',
};

export function Skeleton({ variant = 'text', width, height, className = '', style, ...rest }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={['animate-pulse bg-inst-gris-med', variantClass[variant], className].join(' ')}
      style={{
        ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : null),
        ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : null),
        ...style,
      }}
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
