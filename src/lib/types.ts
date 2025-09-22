export type Role = 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  dept?: string;
}

export interface PolicyCategoryRule {
  category: string;
  perDiem?: number;
  receiptRequiredOverAmount?: number;
}

export interface Policy {
  id: string;
  name: string;
  perDiemCaps?: Record<string, number>;
  categories: PolicyCategoryRule[];
  receiptRequiredOverAmount?: number;
  retirementDeadlineDays: number;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
}

export interface GLCode {
  id: string;
  name: string;
  code: string;
}

export type AdvanceStatus =
  | 'DRAFT'
  | 'PENDING_MANAGER'
  | 'PENDING_FINANCE'
  | 'APPROVED'
  | 'DISBURSED'
  | 'AWAITING_RETIREMENT'
  | 'UNDER_REVIEW'
  | 'SETTLED'
  | 'REJECTED'
  | 'OVERDUE';

export interface ApprovalStep {
  role: Role;
  actorId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  actedAt?: string;
  comment?: string;
}

export interface AdvanceItem {
  id: string;
  advanceId: string;
  type: 'REQUEST' | 'RETIREMENT';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  attachmentUrl?: string;
  ocrText?: string;
  policyFlags?: PolicyFlag[];
}

export interface PolicyFlag {
  code: 'MISSING_RECEIPT' | 'OVER_PER_DIEM' | 'PAST_DEADLINE' | 'CUSTOM';
  message: string;
  severity: 'WARN' | 'ERROR';
}

export interface Advance {
  id: string;
  employeeId: string;
  purpose: string;
  amountRequested: number;
  currency: string;
  project: string;
  costCenterId: string;
  glCodeId: string;
  status: AdvanceStatus;
  approvals: ApprovalStep[];
  disbursedAt?: string;
  disbursementRef?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  createdAt: string;
  updatedAt: string;
  items?: AdvanceItem[];
}

export interface RetirementSummary {
  id: string;
  advanceId: string;
  submittedBy: string;
  submittedAt: string;
  totalSpent: number;
  refundDueToCompany: number;
  topupDueToEmployee: number;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'SETTLED';
  financeNotes?: string;
}

export interface Payment {
  id: string;
  advanceId: string;
  direction: 'OUT' | 'IN';
  method: 'CASH' | 'TRANSFER';
  amount: number;
  ref: string;
  date: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: 'ADVANCE' | 'RETIREMENT' | 'POLICY' | 'PAYMENT';
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  at: string;
  comment?: string;
}

export interface AgingBucket {
  label: string;
  days: [number, number?];
}
