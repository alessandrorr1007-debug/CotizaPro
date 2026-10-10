import * as React from 'react';
import { cn } from '@/lib/utils';
import { QuoteStatus } from '@/core/domain/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: QuoteStatus;
}

export function Badge({
  className,
  variant = 'default',
  status,
  children,
  ...props
}: BadgeProps) {
  let resolvedVariant = variant;

  if (status) {
    switch (status) {
      case 'draft':
        resolvedVariant = 'neutral';
        break;
      case 'sent':
        resolvedVariant = 'info';
        break;
      case 'accepted':
        resolvedVariant = 'success';
        break;
      case 'rejected':
        resolvedVariant = 'danger';
        break;
      case 'expired':
        resolvedVariant = 'warning';
        break;
    }
  }

  const variants = {
    default: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
        variants[resolvedVariant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
