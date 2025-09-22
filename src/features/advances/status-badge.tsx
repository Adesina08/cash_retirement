import { Badge } from '@components/ui/badge';
import { AdvanceStatus } from '@lib/types';

const variantMap: Record<AdvanceStatus, Parameters<typeof Badge>[0]['variant']> = {
  DRAFT: 'default',
  PENDING_MANAGER: 'info',
  PENDING_FINANCE: 'info',
  APPROVED: 'success',
  DISBURSED: 'info',
  AWAITING_RETIREMENT: 'warning',
  UNDER_REVIEW: 'warning',
  SETTLED: 'success',
  REJECTED: 'danger',
  OVERDUE: 'danger'
};

const labelMap: Record<AdvanceStatus, string> = {
  DRAFT: 'Draft',
  PENDING_MANAGER: 'Awaiting Manager',
  PENDING_FINANCE: 'Awaiting Finance',
  APPROVED: 'Approved',
  DISBURSED: 'Disbursed',
  AWAITING_RETIREMENT: 'Awaiting Retirement',
  UNDER_REVIEW: 'Under Review',
  SETTLED: 'Settled',
  REJECTED: 'Rejected',
  OVERDUE: 'Overdue'
};

export function StatusBadge({ status }: { status: AdvanceStatus }) {
  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
