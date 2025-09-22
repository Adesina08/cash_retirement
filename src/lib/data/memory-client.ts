import { addDays, differenceInCalendarDays, formatISO } from 'date-fns';
import { nanoid } from 'nanoid';

import {
  Advance,
  AdvanceItem,
  AdvanceStatus,
  AuditLogEntry,
  CostCenter,
  GLCode,
  Payment,
  Policy,
  RetirementSummary,
  Role,
  User
} from '@lib/types';
import {
  AdvanceInput,
  DataClient,
  DisbursementInput,
  RetirementInput
} from './data-client';

const agingBuckets = [
  { label: '0-30', range: [0, 30] },
  { label: '31-60', range: [31, 60] },
  { label: '61-90', range: [61, 90] },
  { label: '90+', range: [91, undefined] }
] as const;

const defaultSeed = {
  users: [
    { id: 'employee-1', name: 'Erin Employee', email: 'erin@example.com', role: 'EMPLOYEE', dept: 'Marketing' },
    { id: 'manager-1', name: 'Manny Manager', email: 'manny@example.com', role: 'MANAGER', dept: 'Marketing' },
    { id: 'finance-1', name: 'Fiona Finance', email: 'fiona@example.com', role: 'FINANCE', dept: 'Finance' },
    { id: 'admin-1', name: 'Ada Admin', email: 'ada@example.com', role: 'ADMIN', dept: 'Operations' }
  ] satisfies User[],
  policies: [
    {
      id: 'policy-1',
      name: 'Global Travel Policy',
      perDiemCaps: { MEALS: 80, LODGING: 200 },
      categories: [
        { category: 'MEALS', perDiem: 80, receiptRequiredOverAmount: 20 },
        { category: 'TRANSPORT', perDiem: 150, receiptRequiredOverAmount: 30 },
        { category: 'LODGING', perDiem: 200, receiptRequiredOverAmount: 50 }
      ],
      receiptRequiredOverAmount: 25,
      retirementDeadlineDays: 7
    }
  ] satisfies Policy[],
  costCenters: [
    { id: 'cc-100', name: 'Marketing', code: 'MKT-100' },
    { id: 'cc-200', name: 'Engineering', code: 'ENG-200' }
  ] satisfies CostCenter[],
  glCodes: [
    { id: 'gl-6000', name: 'Travel Expenses', code: '6000' },
    { id: 'gl-6100', name: 'Meals & Entertainment', code: '6100' }
  ] satisfies GLCode[],
  advances: [
    {
      id: 'adv-1001',
      employeeId: 'employee-1',
      purpose: 'Kenya field activation',
      amountRequested: 1200,
      currency: 'USD',
      project: 'East Africa Launch',
      costCenterId: 'cc-100',
      glCodeId: 'gl-6000',
      status: 'SETTLED',
      approvals: [
        { role: 'MANAGER', status: 'APPROVED', actorId: 'manager-1', actedAt: formatISO(new Date()), comment: 'Approved' },
        { role: 'FINANCE', status: 'APPROVED', actorId: 'finance-1', actedAt: formatISO(new Date()), comment: 'Disburse' }
      ],
      disbursedAt: formatISO(new Date()),
      disbursementRef: 'TRX-12345',
      expectedStartDate: formatISO(new Date()),
      expectedEndDate: formatISO(new Date()),
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date())
    }
  ] as Advance[],
  retirements: [
    {
      id: 'ret-adv-1001',
      advanceId: 'adv-1001',
      submittedBy: 'employee-1',
      submittedAt: formatISO(new Date()),
      totalSpent: 1180,
      refundDueToCompany: 20,
      topupDueToEmployee: 0,
      status: 'SETTLED',
      financeNotes: 'Verified receipts'
    }
  ] as RetirementSummary[],
  audit: [],
  payments: [
    {
      id: 'pay-1',
      advanceId: 'adv-1001',
      direction: 'OUT',
      method: 'TRANSFER',
      amount: 1200,
      ref: 'TRX-12345',
      date: formatISO(new Date())
    }
  ] as Payment[],
  items: {
    'adv-1001': [
      {
        id: 'item-1',
        advanceId: 'adv-1001',
        type: 'REQUEST',
        category: 'MEALS',
        description: 'Meal per diem estimate',
        amount: 400,
        currency: 'USD',
        date: formatISO(new Date())
      },
      {
        id: 'item-2',
        advanceId: 'adv-1001',
        type: 'RETIREMENT',
        category: 'TRANSPORT',
        description: 'Airport taxi',
        amount: 80,
        currency: 'USD',
        date: formatISO(new Date()),
        attachmentUrl: 'https://placehold.co/400x300'
      }
    ]
  } as Record<string, AdvanceItem[]>
};

export class MemoryDataClient implements DataClient {
  private users: User[] = [];
  private policies: Policy[] = [];
  private costCenters: CostCenter[] = [];
  private glCodes: GLCode[] = [];
  private advances: Advance[] = [];
  private retirements: RetirementSummary[] = [];
  private audit: AuditLogEntry[] = [];
  private payments: Payment[] = [];
  private currentUserId: string;

  constructor(seed?: Partial<MemoryDataClient>) {
    Object.assign(this, { ...defaultSeed, ...seed });
    this.currentUserId = seed?.currentUserId ?? 'employee-1';
  }

  async currentUser(): Promise<User> {
    const user = this.users.find((u) => u.id === this.currentUserId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async listUsers(role?: Role): Promise<User[]> {
    return role ? this.users.filter((u) => u.role === role) : this.users;
  }

  async listPolicies(): Promise<Policy[]> {
    return this.policies;
  }

  async listCostCenters(): Promise<CostCenter[]> {
    return this.costCenters;
  }

  async listGlCodes(): Promise<GLCode[]> {
    return this.glCodes;
  }

  async listAdvances(params?: { status?: string; employeeId?: string; search?: string }): Promise<Advance[]> {
    return this.advances.filter((advance) => {
      if (params?.status && advance.status !== params.status) return false;
      if (params?.employeeId && advance.employeeId !== params.employeeId) return false;
      if (params?.search) {
        const haystack = `${advance.purpose} ${advance.project}`.toLowerCase();
        if (!haystack.includes(params.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  async getAdvance(id: string): Promise<Advance> {
    const advance = this.advances.find((a) => a.id === id);
    if (!advance) throw new Error('Advance not found');
    return { ...advance, items: this.getItems(id) };
  }

  async createAdvance(input: AdvanceInput): Promise<Advance> {
    const now = formatISO(new Date());
    const advance: Advance = {
      id: nanoid(),
      employeeId: this.currentUserId,
      purpose: input.purpose,
      amountRequested: input.amountRequested,
      currency: input.currency,
      project: input.project,
      costCenterId: input.costCenterId,
      glCodeId: input.glCodeId,
      expectedStartDate: input.expectedStartDate,
      expectedEndDate: input.expectedEndDate,
      status: 'DRAFT',
      approvals: [
        { role: 'MANAGER', status: 'PENDING' },
        { role: 'FINANCE', status: 'PENDING' }
      ],
      disbursedAt: undefined,
      disbursementRef: undefined,
      createdAt: now,
      updatedAt: now
    };
    this.advances.push(advance);
    this.log(advance.id, 'ADVANCE', 'ADVANCE_CREATED', {}, advance);
    return advance;
  }

  async submitAdvanceForApproval(id: string): Promise<Advance> {
    const advance = await this.getAdvanceOrThrow(id);
    advance.status = 'PENDING_MANAGER';
    advance.updatedAt = formatISO(new Date());
    this.log(id, 'ADVANCE', 'SUBMITTED', { status: 'DRAFT' }, advance);
    return advance;
  }

  async approveAdvance(
    id: string,
    payload: { role: Role; approve: boolean; comment?: string }
  ): Promise<Advance> {
    const advance = await this.getAdvanceOrThrow(id);
    const step = advance.approvals.find((approval) => approval.role === payload.role);
    if (!step) throw new Error('Approval step not found');
    step.status = payload.approve ? 'APPROVED' : 'REJECTED';
    step.actorId = this.currentUserId;
    step.actedAt = formatISO(new Date());
    step.comment = payload.comment;

    const previousStatus = advance.status;
    if (!payload.approve) {
      advance.status = 'REJECTED';
    } else if (payload.role === 'MANAGER') {
      advance.status = 'PENDING_FINANCE';
    } else if (payload.role === 'FINANCE') {
      advance.status = 'APPROVED';
    }
    advance.updatedAt = step.actedAt;
    this.log(id, 'ADVANCE', 'APPROVAL_UPDATED', { status: previousStatus }, advance);
    return advance;
  }

  async recordDisbursement(id: string, payload: DisbursementInput): Promise<Advance> {
    const advance = await this.getAdvanceOrThrow(id);
    if (advance.status !== 'APPROVED') {
      throw new Error('Advance must be approved before disbursement');
    }
    advance.status = 'DISBURSED';
    advance.disbursedAt = payload.date;
    advance.disbursementRef = payload.ref;
    advance.updatedAt = formatISO(new Date());
    this.payments.push({
      id: nanoid(),
      advanceId: id,
      direction: 'OUT',
      method: payload.method,
      amount: payload.amount,
      ref: payload.ref,
      date: payload.date
    });
    this.log(id, 'ADVANCE', 'DISBURSED', {}, advance);
    return advance;
  }

  async submitRetirement(id: string, payload: RetirementInput): Promise<RetirementSummary> {
    const advance = await this.getAdvanceOrThrow(id);
    if (!['DISBURSED', 'AWAITING_RETIREMENT', 'UNDER_REVIEW'].includes(advance.status)) {
      throw new Error('Advance not eligible for retirement');
    }
    const totalSpent = payload.items.reduce((sum, item) => sum + item.amount, 0);
    const balance = advance.amountRequested - totalSpent;

    const retirement: RetirementSummary = {
      id: nanoid(),
      advanceId: id,
      submittedBy: this.currentUserId,
      submittedAt: formatISO(new Date()),
      totalSpent,
      refundDueToCompany: balance > 0 ? balance : 0,
      topupDueToEmployee: balance < 0 ? Math.abs(balance) : 0,
      status: 'SUBMITTED',
      financeNotes: payload.notes
    };
    this.retirements.push(retirement);

    const retirementItems: AdvanceItem[] = payload.items.map((item) => ({
      id: nanoid(),
      advanceId: id,
      type: 'RETIREMENT',
      category: item.category,
      description: item.description,
      amount: item.amount,
      currency: item.currency,
      date: item.date,
      attachmentUrl: item.attachmentUrl,
      policyFlags: this.evaluatePolicyFlags(item, advance)
    }));
    this.setItems(id, [...this.getItems(id).filter((item) => item.type === 'REQUEST'), ...retirementItems]);

    advance.status = 'UNDER_REVIEW';
    advance.updatedAt = retirement.submittedAt;
    this.log(id, 'RETIREMENT', 'RETIREMENT_SUBMITTED', {}, retirement);
    return retirement;
  }

  async verifyRetirement(id: string, payload: { approve: boolean; notes?: string }): Promise<RetirementSummary> {
    const retirement = this.retirements.find((r) => r.advanceId === id);
    if (!retirement) throw new Error('Retirement not found');
    retirement.status = payload.approve ? 'VERIFIED' : 'DRAFT';
    retirement.financeNotes = payload.notes;
    const advance = await this.getAdvanceOrThrow(id);
    advance.status = payload.approve ? 'SETTLED' : 'UNDER_REVIEW';
    advance.updatedAt = formatISO(new Date());
    this.log(id, 'RETIREMENT', 'RETIREMENT_VERIFIED', {}, retirement);
    return retirement;
  }

  async listAuditLogs(entityId: string, entityType: AuditLogEntry['entityType']): Promise<AuditLogEntry[]> {
    return this.audit.filter((entry) => entry.entityId === entityId && entry.entityType === entityType);
  }

  async listPayments(advanceId: string): Promise<Payment[]> {
    return this.payments.filter((p) => p.advanceId === advanceId);
  }

  async recordPayment(
    advanceId: string,
    payment: DisbursementInput & { direction: Payment['direction'] }
  ): Promise<Payment> {
    const record: Payment = {
      id: nanoid(),
      advanceId,
      direction: payment.direction,
      method: payment.method,
      amount: payment.amount,
      ref: payment.ref,
      date: payment.date
    };
    this.payments.push(record);
    this.log(advanceId, 'PAYMENT', 'PAYMENT_RECORDED', {}, record);
    return record;
  }

  async getFinanceDashboard(_params: { range: string; department?: string; costCenterId?: string }): Promise<{
    outstanding: number;
    overdue: number;
    aging: Array<{ bucket: string; amount: number; count: number }>;
    byCostCenter: Array<{ costCenterId: string; total: number; count: number }>;
    byEmployee: Array<{ employeeId: string; total: number; count: number }>;
  }> {
    const outstandingAdvances = this.advances.filter((advance) =>
      ['DISBURSED', 'AWAITING_RETIREMENT', 'UNDER_REVIEW', 'OVERDUE'].includes(advance.status)
    );
    const outstanding = outstandingAdvances.reduce((sum, adv) => sum + adv.amountRequested, 0);
    const overdue = outstandingAdvances
      .filter((advance) => advance.status === 'OVERDUE')
      .reduce((sum, adv) => sum + adv.amountRequested, 0);

    const aging = agingBuckets.map((bucket) => {
      const advancesInBucket = outstandingAdvances.filter((advance) => {
        const disbursedAt = advance.disbursedAt ?? advance.createdAt;
        const days = differenceInCalendarDays(new Date(), new Date(disbursedAt));
        if (bucket.range[1]) {
          return days >= bucket.range[0] && days <= bucket.range[1];
        }
        return days >= bucket.range[0];
      });
      return {
        bucket: bucket.label,
        amount: advancesInBucket.reduce((sum, adv) => sum + adv.amountRequested, 0),
        count: advancesInBucket.length
      };
    });

    const byCostCenter = this.costCenters.map((cc) => ({
      costCenterId: cc.id,
      total: outstandingAdvances
        .filter((advance) => advance.costCenterId === cc.id)
        .reduce((sum, adv) => sum + adv.amountRequested, 0),
      count: outstandingAdvances.filter((advance) => advance.costCenterId === cc.id).length
    }));

    const byEmployee = this.users.map((user) => ({
      employeeId: user.id,
      total: outstandingAdvances
        .filter((advance) => advance.employeeId === user.id)
        .reduce((sum, adv) => sum + adv.amountRequested, 0),
      count: outstandingAdvances.filter((advance) => advance.employeeId === user.id).length
    }));

    return { outstanding, overdue, aging, byCostCenter, byEmployee };
  }

  async exportAdvances(format: 'csv' | 'json', params: { status?: string }): Promise<string> {
    const advances = await this.listAdvances(params);
    if (format === 'json') {
      return JSON.stringify(advances, null, 2);
    }
    const header = [
      'id',
      'employeeId',
      'purpose',
      'amountRequested',
      'currency',
      'status',
      'costCenterId',
      'glCodeId',
      'disbursedAt'
    ];
    const rows = advances.map((a) =>
      [
        a.id,
        a.employeeId,
        a.purpose,
        a.amountRequested.toFixed(2),
        a.currency,
        a.status,
        a.costCenterId,
        a.glCodeId,
        a.disbursedAt ?? ''
      ].join(',')
    );
    return [header.join(','), ...rows].join('\n');
  }

  private async getAdvanceOrThrow(id: string): Promise<Advance> {
    const advance = this.advances.find((a) => a.id === id);
    if (!advance) throw new Error('Advance not found');
    return advance;
  }

  private evaluatePolicyFlags(
    item: RetirementInput['items'][number],
    advance: Advance
  ): AdvanceItem['policyFlags'] {
    const policy = this.policies[0];
    if (!policy) return [];
    const flags: AdvanceItem['policyFlags'] = [];
    const categoryRule = policy.categories.find((rule) => rule.category === item.category);
    if (categoryRule?.perDiem && item.amount > categoryRule.perDiem) {
      flags.push({ code: 'OVER_PER_DIEM', severity: 'ERROR', message: 'Amount exceeds per diem limit' });
    }
    const receiptThreshold = categoryRule?.receiptRequiredOverAmount ?? policy.receiptRequiredOverAmount;
    if (receiptThreshold && item.amount > receiptThreshold && !item.attachmentUrl) {
      flags.push({ code: 'MISSING_RECEIPT', severity: 'ERROR', message: 'Receipt required above threshold' });
    }
    if (advance.expectedEndDate) {
      const deadline = addDays(new Date(advance.expectedEndDate), policy.retirementDeadlineDays);
      if (new Date(item.date) > deadline) {
        flags.push({ code: 'PAST_DEADLINE', severity: 'WARN', message: 'Submitted past retirement deadline' });
      }
    }
    return flags;
  }

  private log(
    entityId: string,
    entityType: AuditLogEntry['entityType'],
    action: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ) {
    this.audit.push({
      id: nanoid(),
      actorId: this.currentUserId,
      action,
      entityType,
      entityId,
      before,
      after,
      at: formatISO(new Date())
    });
  }

  private items: Record<string, AdvanceItem[]> = {};

  private getItems(advanceId: string): AdvanceItem[] {
    return this.items[advanceId] ?? [];
  }

  private setItems(advanceId: string, items: AdvanceItem[]) {
    this.items[advanceId] = items;
  }
}
