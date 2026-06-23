import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  iconLeft?: ReactNode;
}

let counter = 0;
function useId(provided?: string) {
  const generated = `select-${++counter}`;
  return provided ?? generated;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, error, required, options, placeholder, iconLeft, id, className = '', ...rest },
  ref,
) {
  const selectId = useId(id);
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="edl-label">
          {label}
          {required ? <span className="text-inst-rojo ml-0.5" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {iconLeft ? (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-inst-texto-claro pointer-events-none z-10"
            aria-hidden="true"
          >
            {iconLeft}
          </span>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
          className={[
            'edl-select',
            iconLeft ? 'pl-10' : '',
            error ? 'border-inst-rojo focus:border-inst-rojo focus:ring-inst-rojo/30' : '',
            className,
          ].join(' ')}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {helperText && !error ? (
        <p id={helperId} className="mt-1 text-xs text-inst-texto-claro">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-inst-rojo flex items-center gap-1" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
});
