import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ApprovalTimeline } from '@features/advances/approval-timeline';
import { StatusBadge } from '@features/advances/status-badge';
import { AuditTimeline } from '@features/audit/audit-timeline';
import { useDataClient } from '@lib/data';

export function AdvanceDetailPage() {
  const { advanceId } = useParams<{ advanceId: string }>();
  const dataClient = useDataClient();

  const { data: advance } = useQuery({
    queryKey: ['advance', advanceId],
    queryFn: () => dataClient.getAdvance(advanceId!),
    enabled: Boolean(advanceId)
  });

  const { data: audit = [] } = useQuery({
    queryKey: ['audit', advanceId],
    queryFn: () => dataClient.listAuditLogs(advanceId!, 'ADVANCE'),
    enabled: Boolean(advanceId)
  });

  if (!advance) {
    return <p className="text-sm text-slate-500">Loading advance…</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{advance.purpose}</CardTitle>
            <p className="text-sm text-slate-500">Project: {advance.project}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <StatusBadge status={advance.status} />
            <span>
              {advance.currency} {advance.amountRequested.toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-500">Cost center</p>
            <p className="text-sm font-medium">{advance.costCenterId}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">GL code</p>
            <p className="text-sm font-medium">{advance.glCodeId}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Approval history</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalTimeline steps={advance.approvals} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTimeline entries={audit} />
        </CardContent>
      </Card>
    </div>
  );
}
