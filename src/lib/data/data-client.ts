import { Advance, AuditLogEntry, CostCenter, GLCode, Payment, Policy, RetirementSummary, Role, User } from '@lib/types';

export interface AdvanceInput {
  purpose: string;
  amountRequested: number;
  currency: string;
  project: string;
  costCenterId: string;
  glCodeId: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  attachments?: string[];
}

export interface RetirementInput {
  items: Array<{
    category: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    attachmentUrl?: string;
    tax?: number;
  }>;
  notes?: string;
  overrideReason?: string;
}

export interface DisbursementInput {
  method: Payment['method'];
  amount: number;
  ref: string;
  date: string;
}

export interface DataClient {
  currentUser(): Promise<User>;
  listUsers(role?: Role): Promise<User[]>;
  listPolicies(): Promise<Policy[]>;
  listCostCenters(): Promise<CostCenter[]>;
  listGlCodes(): Promise<GLCode[]>;
  listAdvances(params?: { status?: string; employeeId?: string; search?: string }): Promise<Advance[]>;
  getAdvance(id: string): Promise<Advance>;
  createAdvance(input: AdvanceInput): Promise<Advance>;
  submitAdvanceForApproval(id: string): Promise<Advance>;
  approveAdvance(id: string, payload: { role: Role; approve: boolean; comment?: string }): Promise<Advance>;
  recordDisbursement(id: string, payload: DisbursementInput): Promise<Advance>;
  submitRetirement(id: string, payload: RetirementInput): Promise<RetirementSummary>;
  verifyRetirement(id: string, payload: { approve: boolean; notes?: string }): Promise<RetirementSummary>;
  listAuditLogs(entityId: string, entityType: AuditLogEntry['entityType']): Promise<AuditLogEntry[]>;
  listPayments(advanceId: string): Promise<Payment[]>;
  recordPayment(advanceId: string, payment: DisbursementInput & { direction: Payment['direction'] }): Promise<Payment>;
  getFinanceDashboard(params: { range: string; department?: string; costCenterId?: string }): Promise<{
    outstanding: number;
    overdue: number;
    aging: Array<{ bucket: string; amount: number; count: number }>;
    byCostCenter: Array<{ costCenterId: string; total: number; count: number }>;
    byEmployee: Array<{ employeeId: string; total: number; count: number }>;
  }>;
  exportAdvances(format: 'csv' | 'json', params: { status?: string }): Promise<string>;
}

export type DataClientFactory = () => DataClient;
