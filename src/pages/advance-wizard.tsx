import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { PolicyAlert } from '@features/policies/policy-alert';
import { ReceiptViewer } from '@features/advances/receipt-viewer';
import { useAuth } from '@features/auth/auth-context';
import { useDataClient } from '@lib/data';
import { Advance } from '@lib/types';
import { format } from 'date-fns';
import {
  AdvanceRequestSchema,
  RetirementSchema,
  RetirementValues,
  AdvanceRequestValues
} from '@features/advances/schemas';

interface AdvanceWizardProps {
  mode: 'create' | 'retire';
}

export function AdvanceWizardPage({ mode }: AdvanceWizardProps) {
  return mode === 'create' ? <AdvanceRequestForm /> : <AdvanceRetirementForm />;
}

function AdvanceRequestForm() {
  const dataClient = useDataClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: policies = [] } = useQuery({ queryKey: ['policies'], queryFn: () => dataClient.listPolicies() });
  const { data: costCenters = [] } = useQuery({ queryKey: ['costCenters'], queryFn: () => dataClient.listCostCenters() });
  const { data: glCodes = [] } = useQuery({ queryKey: ['glCodes'], queryFn: () => dataClient.listGlCodes() });

  const form = useForm<AdvanceRequestValues>({
    resolver: zodResolver(AdvanceRequestSchema),
    defaultValues: {
      purpose: '',
      project: '',
      costCenterId: costCenters[0]?.id ?? '',
      glCodeId: glCodes[0]?.id ?? '',
      currency: 'USD',
      amountRequested: 0,
      expectedStartDate: format(new Date(), 'yyyy-MM-dd'),
      expectedEndDate: format(new Date(), 'yyyy-MM-dd')
    }
  });

  useEffect(() => {
    const cc = costCenters[0]?.id;
    const gl = glCodes[0]?.id;
    if (cc) form.setValue('costCenterId', cc);
    if (gl) form.setValue('glCodeId', gl);
  }, [costCenters, glCodes, form]);

  const createAdvance = useMutation({
    mutationFn: (values: AdvanceRequestValues) => dataClient.createAdvance(values),
    onSuccess: (advance) => {
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      navigate(`/advances/${advance.id}`);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request cash advance</CardTitle>
        <p className="text-sm text-slate-500">
          Provide purpose, budget allocations, and expected travel dates. Policy caps are enforced automatically.
        </p>
      </CardHeader>
      <CardContent>
        <Form methods={form} onSubmit={(values) => createAdvance.mutate(values)} className="space-y-6">
          <FormField
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Regional marketing roadshow" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project / Cost driver</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Campaign, initiative, or event" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="costCenterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost center</FormLabel>
                  <FormControl>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      {...field}
                    >
                      {costCenters.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.code} · {cc.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="glCodeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GL code</FormLabel>
                  <FormControl>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      {...field}
                    >
                      {glCodes.map((gl) => (
                        <option key={gl.id} value={gl.id}>
                          {gl.code} · {gl.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="amountRequested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount requested</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Caps from policy: {policies[0]?.perDiemCaps?.MEALS ?? 'N/A'} meals per day.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="expectedStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected start date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="expectedEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected end date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={createAdvance.isPending}>
              Submit for approval
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

function AdvanceRetirementForm() {
  const { advanceId } = useParams<{ advanceId: string }>();
  const dataClient = useDataClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: advance } = useQuery({
    queryKey: ['advance', advanceId],
    queryFn: () => dataClient.getAdvance(advanceId!),
    enabled: Boolean(advanceId)
  });

  const { data: policies = [] } = useQuery({ queryKey: ['policies'], queryFn: () => dataClient.listPolicies() });

  const policy = policies[0];

  const form = useForm<RetirementValues>({
    resolver: zodResolver(RetirementSchema),
    defaultValues: {
      items: [
        {
          category: 'MEALS',
          description: '',
          amount: 0,
          currency: 'USD',
          date: format(new Date(), 'yyyy-MM-dd'),
          attachmentUrl: ''
        }
      ],
      notes: '',
      overrideReason: ''
    }
  });

  const items = useFieldArray({ name: 'items', control: form.control });

  const mutation = useMutation({
    mutationFn: (values: RetirementValues) => dataClient.submitRetirement(advanceId!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance', advanceId] });
      queryClient.invalidateQueries({ queryKey: ['advances'] });
      navigate('/advances');
    }
  });

  const totals = useMemo(() => {
    const totalSpent = form.watch('items').reduce((sum, item) => sum + (item.amount || 0), 0);
    const balance = (advance?.amountRequested ?? 0) - totalSpent;
    return {
      totalSpent,
      refundDueToCompany: Math.max(balance, 0),
      topupDueToEmployee: Math.max(-balance, 0)
    };
  }, [form, advance]);

  const policyFlags = form.watch('items').flatMap((item) => {
    const categoryRule = policy?.categories.find((rule) => rule.category === item.category);
    const flags = [] as { message: string; severity: 'WARN' | 'ERROR' }[];
    if (categoryRule?.perDiem && item.amount > categoryRule.perDiem) {
      flags.push({ severity: 'ERROR', message: `Amount exceeds ${categoryRule.perDiem} per diem for ${item.category}` });
    }
    if ((categoryRule?.receiptRequiredOverAmount ?? policy?.receiptRequiredOverAmount ?? 0) < item.amount && !item.attachmentUrl) {
      flags.push({ severity: 'ERROR', message: 'Receipt required. Upload or document reason.' });
    }
    if (advance?.expectedEndDate) {
      const deadline = new Date(advance.expectedEndDate);
      deadline.setDate(deadline.getDate() + (policy?.retirementDeadlineDays ?? 7));
      if (new Date(item.date) > deadline) {
        flags.push({ severity: 'WARN', message: 'Submitted past retirement deadline. Add explanation.' });
      }
    }
    return flags.map((flag) => ({ code: 'CUSTOM', ...flag }));
  });

  if (!advance) {
    return <p className="text-sm text-slate-500">Loading advance details…</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card className="md:col-span-1 md:col-start-1 md:row-span-2">
        <CardHeader>
          <CardTitle>{advance.purpose}</CardTitle>
          <p className="text-sm text-slate-500">Retire advance #{advance.id}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Amount advanced</span>
            <span>
              {advance.currency} {advance.amountRequested.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-300">
            <span>Total spent</span>
            <span>
              {advance.currency} {totals.totalSpent.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-300">
            <span>Refund due to company</span>
            <span>
              {advance.currency} {totals.refundDueToCompany.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-300">
            <span>Top-up due to employee</span>
            <span>
              {advance.currency} {totals.topupDueToEmployee.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-1 md:col-start-2">
        <CardHeader>
          <CardTitle>Policy checks</CardTitle>
        </CardHeader>
        <CardContent>
          <PolicyAlert flags={policyFlags} />
          {!policyFlags.length && (
            <p className="text-sm text-emerald-600">All line items currently comply with policy.</p>
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Retirement line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form methods={form} onSubmit={(values) => mutation.mutate(values)} className="space-y-6">
            {items.fields.map((field, index) => (
              <div key={field.id} className="rounded-md border border-slate-200 p-4 shadow-sm dark:border-slate-800">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name={`items.${index}.category` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            {...field}
                          >
                            <option value="MEALS">Meals</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="LODGING">Lodging</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`items.${index}.amount` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name={`items.${index}.description` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Taxi from airport" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`items.${index}.date` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name={`items.${index}.attachmentUrl` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt upload</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="Paste receipt URL (stub for upload)"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Uploads go through anti-malware scanning before storing receipts securely.
                      </FormDescription>
                      <ReceiptViewer url={field.value ?? undefined} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => items.remove(index)}>
                    Remove line
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                items.append({
                  category: 'MEALS',
                  description: '',
                  amount: 0,
                  currency: advance.currency,
                  date: format(new Date(), 'yyyy-MM-dd'),
                  attachmentUrl: ''
                })
              }
            >
              Add another receipt
            </Button>
            <FormField
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes to Finance</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Context for exceptions, lost receipts, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="overrideReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy override justification</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Explain why an exception is needed." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                Submit retirement for review
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
