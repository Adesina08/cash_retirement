import { formatDistanceToNow } from 'date-fns';
import { AuditLogEntry } from '@lib/types';

export function AuditTimeline({ entries }: { entries: AuditLogEntry[] }) {
  if (!entries.length) {
    return <p className="text-sm text-slate-500">No audit entries yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="font-medium">{entry.action}</span>
            <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(entry.at), { addSuffix: true })}</span>
          </div>
          <div className="mt-2 grid gap-2 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Actor:</span> {entry.actorId}
            </div>
            {entry.comment && <div className="italic">{entry.comment}</div>}
            {entry.before && (
              <pre className="overflow-x-auto rounded bg-slate-100 p-2 text-[10px] dark:bg-slate-950">{JSON.stringify(entry.before, null, 2)}</pre>
            )}
            {entry.after && (
              <pre className="overflow-x-auto rounded bg-slate-100 p-2 text-[10px] dark:bg-slate-950">{JSON.stringify(entry.after, null, 2)}</pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
