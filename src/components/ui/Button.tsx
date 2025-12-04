import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
};

const baseStyles =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Required<ButtonProps>['variant'], string> = {
  primary: 'bg-brand hover:bg-brand-dark text-white',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-200'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Please wait...' : children}
    </button>
  )
);

Button.displayName = 'Button';

