import { PolicyFlag } from '@lib/types';
import { AlertTriangle, Info } from 'lucide-react';

export function PolicyAlert({ flags }: { flags?: PolicyFlag[] }) {
  if (!flags?.length) return null;
  return (
    <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4" />
        Policy warnings
      </div>
      <ul className="list-inside list-disc space-y-1">
        {flags.map((flag, index) => (
          <li key={index} className="flex items-start gap-2">
            <span>{flag.message}</span>
            <span className="text-xs uppercase text-amber-500">{flag.severity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InfoAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
      <Info className="mt-0.5 h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
