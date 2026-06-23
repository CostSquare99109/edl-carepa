import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'edl-btn-primary',
  secondary: 'edl-btn-secondary',
  danger: 'edl-btn-danger',
  outline: 'edl-btn-outline',
  ghost: 'edl-btn-ghost',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    iconLeft,
    iconRight,
    fullWidth = false,
    className = '',
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : iconLeft ? (
        <span aria-hidden="true">{iconLeft}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !loading ? <span aria-hidden="true">{iconRight}</span> : null}
    </button>
  );
});
