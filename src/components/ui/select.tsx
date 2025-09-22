import { ChangeEvent } from 'react';
import { cn } from '@lib/utils/cn';

export interface Option<T extends string = string> {
  label: string;
  value: T | '';
}

interface SelectProps<T extends string> {
  value?: T | '';
  onChange?: (value: T | '') => void;
  placeholder?: string;
  options: Option<T>[];
  disabled?: boolean;
}

export function Select<T extends string>({ value, onChange, placeholder, options, disabled }: SelectProps<T>) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.((event.target.value as T | '') ?? '');
  };

  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        !value && 'text-slate-400'
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
