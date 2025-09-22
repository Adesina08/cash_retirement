import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Select } from '@components/ui/select';
import { InfoAlert } from '@features/policies/policy-alert';
import { useDataClient } from '@lib/data';
import { useAuth } from '@features/auth/auth-context';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ranges = [
  { label: 'This month', value: 'month' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Year to date', value: 'ytd' }
];

export function FinanceDashboardPage() {
  const dataClient = useDataClient();
  const { user } = useAuth();
  const [range, setRange] = useState('month');
  const [department, setDepartment] = useState<string | undefined>();
  const [costCenterId, setCostCenterId] = useState<string | undefined>();

  const { data: dashboard } = useQuery({
    queryKey: ['finance-dashboard', range, department, costCenterId],
    queryFn: () => dataClient.getFinanceDashboard({ range, department, costCenterId })
  });

  const { data: costCenters = [] } = useQuery({ queryKey: ['costCenters'], queryFn: () => dataClient.listCostCenters() });

  const agingChartData = dashboard?.aging.map((bucket) => ({
    bucket: bucket.bucket,
    Outstanding: bucket.amount,
    Count: bucket.count
  }));

  const outstandingByCostCenter = dashboard?.byCostCenter
    .filter((item) => item.total > 0)
    .map((item) => ({ ...item, name: costCenters.find((cc) => cc.id === item.costCenterId)?.name ?? item.costCenterId }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Finance insights</h1>
        <p className="text-sm text-slate-500">Monitor outstanding imprest balances, overdue retirements, and cost center exposure.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Outstanding advances</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {dashboard?.outstanding?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Overdue amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-rose-600">
            {dashboard?.overdue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '--'}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 md:flex-row">
            <Select
              value={range}
              onChange={(value) => setRange(value)}
              options={ranges.map((item) => ({ value: item.value, label: item.label }))}
            />
            <Select
              value={department}
              onChange={(value) => setDepartment(value)}
              options={[{ value: '', label: 'All departments' }, ...(user?.dept ? [{ value: user.dept, label: user.dept }] : [])]}
            />
            <Select
              value={costCenterId}
              onChange={(value) => setCostCenterId(value)}
              options={[
                { value: '', label: 'All cost centers' },
                ...costCenters.map((cc) => ({ value: cc.id, label: `${cc.code} · ${cc.name}` }))
              ]}
            />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aging buckets</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {agingChartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Outstanding" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <InfoAlert message="No outstanding advances in the selected range." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exposure by cost center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstandingByCostCenter?.length ? (
              outstandingByCostCenter.map((item) => (
                <div key={item.costCenterId} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              ))
            ) : (
              <InfoAlert message="No cost center exposure in this filter." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
