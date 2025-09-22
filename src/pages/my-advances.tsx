import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { StatusBadge } from '@features/advances/status-badge';
import { useAuth } from '@features/auth/auth-context';
import { useDataClient } from '@lib/data';
import { Advance } from '@lib/types';

const tabFilters: Record<string, (advance: Advance) => boolean> = {
  all: () => true,
  active: (advance) => ['APPROVED', 'DISBURSED', 'AWAITING_RETIREMENT', 'UNDER_REVIEW', 'OVERDUE'].includes(advance.status),
  awaiting: (advance) => ['PENDING_MANAGER', 'PENDING_FINANCE'].includes(advance.status)
};

export function MyAdvancesPage() {
  const dataClient = useDataClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<keyof typeof tabFilters>('all');

  const { data: advances = [] } = useQuery({
    queryKey: ['advances', user?.id],
    queryFn: () => dataClient.listAdvances({ employeeId: user?.role === 'EMPLOYEE' ? user.id : undefined })
  });

  const filtered = useMemo(() => {
    return advances.filter((advance) => {
      if (!tabFilters[tab](advance)) return false;
      if (search && !advance.purpose.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [advances, tab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Advances</h1>
          <p className="text-sm text-slate-500">Track requests, approvals, and retirements in one place.</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search purpose or project"
            className="w-64"
            aria-label="Search advances"
          />
          <Button asChild>
            <Link to="/advances/new">New request</Link>
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as keyof typeof tabFilters)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting My Action</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AdvanceTable advances={filtered} empty="No advances yet. Start by creating a request." />
        </TabsContent>
        <TabsContent value="active">
          <AdvanceTable advances={filtered} empty="No active advances. You're all settled!" />
        </TabsContent>
        <TabsContent value="awaiting">
          <AdvanceTable
            advances={filtered}
            empty="You have no requests awaiting your action right now."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdvanceTable({ advances, empty }: { advances: Advance[]; empty: string }) {
  if (!advances.length) {
    return <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">{empty}</p>;
  }

  return (
    <div className="grid gap-4">
      {advances.map((advance) => (
        <Card key={advance.id}>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{advance.purpose}</CardTitle>
              <p className="text-sm text-slate-500">{advance.project}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <StatusBadge status={advance.status} />
              <span>
                {advance.currency} {advance.amountRequested.toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-500">Cost center</p>
              <p className="text-sm font-medium">{advance.costCenterId}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">GL Code</p>
              <p className="text-sm font-medium">{advance.glCodeId}</p>
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              <Button asChild variant="secondary" size="sm">
                <Link to={`/advances/${advance.id}/retire`}>Retire advance</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/advances/${advance.id}`}>Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
