import { HTMLAttributes } from 'react';
import { cn } from '@lib/utils/cn';

const variantStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  danger: 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200',
  info: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200'
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variantStyles[variant], className)}
      {...props}
    />
  );
}
