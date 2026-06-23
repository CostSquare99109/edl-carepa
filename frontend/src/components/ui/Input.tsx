import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  required?: boolean;
}

let counter = 0;
function useId(provided?: string) {
  const generated = `input-${++counter}`;
  return provided ?? generated;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, iconLeft, iconRight, required, id, className = '', ...rest },
  ref,
) {
  const inputId = useId(id);
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="edl-label">
          {label}
          {required ? <span className="text-inst-rojo ml-0.5" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {iconLeft ? (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-inst-texto-claro pointer-events-none"
            aria-hidden="true"
          >
            {iconLeft}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
          className={[
            'edl-input',
            iconLeft ? 'pl-10' : '',
            iconRight ? 'pr-10' : '',
            error ? 'border-inst-rojo focus:border-inst-rojo focus:ring-inst-rojo/30' : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {iconRight ? (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-inst-texto-claro"
            aria-hidden="true"
          >
            {iconRight}
          </span>
        ) : null}
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
