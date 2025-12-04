import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
        {label && (
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand',
            error && 'border-pink-500',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <span className={clsx('text-xs', error ? 'text-pink-400' : 'text-slate-400')}>
            {error ?? helperText}
          </span>
        )}
      </label>
    );
  }
);

Input.displayName = 'Input';

