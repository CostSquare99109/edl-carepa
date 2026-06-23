import { type ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pills';
  ariaLabel: string;
}

export function Tabs({ items, activeKey, onChange, variant = 'underline', ariaLabel }: TabsProps) {
  const isPills = variant === 'pills';
  return (
    <div role="tablist" aria-label={ariaLabel} className={isPills ? 'inline-flex bg-inst-gris-med rounded-lg p-1 gap-1' : 'border-b border-inst-borde'}>
      {items.map((item) => {
        const active = item.key === activeKey;
        const baseClass = isPills
          ? 'px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-150'
          : 'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150';
        const stateClass = active
          ? isPills
            ? 'bg-white text-inst-azul-osc shadow-sm'
            : 'text-inst-azul-osc border-inst-verde'
          : isPills
            ? 'text-inst-texto-claro hover:text-inst-texto'
            : 'text-inst-texto-claro border-transparent hover:text-inst-texto hover:border-inst-borde';
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`tabpanel-${item.key}`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.key)}
            className={[baseClass, stateClass, item.disabled ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}
          >
            <span className="inline-flex items-center gap-2">
              {item.label}
              {item.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ tabKey, activeKey, children }: { tabKey: string; activeKey: string; children: ReactNode }) {
  if (tabKey !== activeKey) return null;
  return (
    <div role="tabpanel" id={`tabpanel-${tabKey}`} className="animate-fadeIn">
      {children}
    </div>
  );
}
