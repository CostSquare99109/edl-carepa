import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-inst-gris-med text-inst-texto-claro flex items-center justify-center mb-4" aria-hidden="true">
        {icon ?? <span className="material-icons text-3xl">inbox</span>}
      </div>
      <h3 className="text-base font-heading font-semibold text-inst-azul-osc mb-1">{title}</h3>
      {description ? (
        <p className="text-sm text-inst-texto-claro max-w-md">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
