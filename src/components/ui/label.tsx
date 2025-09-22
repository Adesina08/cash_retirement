import { forwardRef, LabelHTMLAttributes } from 'react';
import { cn } from '@lib/utils/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function Label(
  { className, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none text-slate-700 dark:text-slate-200', className)}
      {...props}
    />
  );
});
