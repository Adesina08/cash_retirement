import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@components/ui/button';

export function ReceiptViewer({ url }: { url?: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  return (
    <div>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen((prev) => !prev)}>
        <Eye className="mr-1 h-4 w-4" />
        {open ? 'Hide receipt' : 'View receipt'}
      </Button>
      {open && (
        <div className="mt-2 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          {url.endsWith('.pdf') ? (
            <iframe title="Receipt PDF" src={url} className="h-64 w-full" />
          ) : (
            <img src={url} alt="Receipt" className="h-64 w-full object-contain" />
          )}
        </div>
      )}
    </div>
  );
}
