import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
        {label && (
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {label}
          </span>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand',
            error && 'border-pink-500',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-pink-400">{error}</span>}
      </label>
    );
  }
);

TextArea.displayName = 'TextArea';

