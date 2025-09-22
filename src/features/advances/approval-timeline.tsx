import { format } from 'date-fns';
import { ApprovalStep, Role } from '@lib/types';
import { cn } from '@lib/utils/cn';

const roleLabels: Record<Role, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  ADMIN: 'Admin'
};

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  return (
    <ol className="space-y-4 border-l border-slate-200 pl-4 dark:border-slate-800">
      {steps.map((step, index) => (
        <li key={index} className="relative">
          <span
            className={cn(
              'absolute -left-2 top-1 h-3 w-3 rounded-full border border-white',
              step.status === 'APPROVED' && 'bg-emerald-500',
              step.status === 'REJECTED' && 'bg-rose-500',
              step.status === 'PENDING' && 'bg-slate-300'
            )}
          />
          <div className="ml-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{roleLabels[step.role]}</span>
              <span className="text-xs uppercase tracking-wide text-slate-500">{step.status}</span>
              {step.actedAt && <span className="text-xs text-slate-400">{format(new Date(step.actedAt), 'PPpp')}</span>}
            </div>
            {step.comment && <p className="text-xs text-slate-500">{step.comment}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
