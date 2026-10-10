import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
