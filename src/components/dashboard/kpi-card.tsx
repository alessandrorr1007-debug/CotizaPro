import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose';
  trendBadge?: {
    text: string;
    positive?: boolean;
  };
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  trendBadge,
}: KpiCardProps) {
  const variantStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-800',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      borderHover: 'hover:border-amber-300 dark:hover:border-amber-800',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-800',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      borderHover: 'hover:border-rose-300 dark:hover:border-rose-800',
    },
  };

  const style = variantStyles[variant];

  return (
    <Card
      className={cn(
        'p-5 transition-all duration-200 shadow-xs hover:shadow-md',
        style.borderHover
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl shadow-inner', style.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {trendBadge && (
            <span
              className={cn(
                'inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md',
                trendBadge.positive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              )}
            >
              {trendBadge.text}
            </span>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
