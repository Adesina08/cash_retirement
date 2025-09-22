import { AdvanceStatus, Role } from '@lib/types';

type Transition = {
  from: AdvanceStatus;
  to: AdvanceStatus;
  allowedRoles: Role[];
  action: string;
};

const transitions: Transition[] = [
  { from: 'DRAFT', to: 'PENDING_MANAGER', allowedRoles: ['EMPLOYEE', 'ADMIN'], action: 'SUBMIT' },
  { from: 'PENDING_MANAGER', to: 'PENDING_FINANCE', allowedRoles: ['MANAGER', 'ADMIN'], action: 'APPROVE' },
  { from: 'PENDING_MANAGER', to: 'REJECTED', allowedRoles: ['MANAGER', 'ADMIN'], action: 'REJECT' },
  { from: 'PENDING_FINANCE', to: 'APPROVED', allowedRoles: ['FINANCE', 'ADMIN'], action: 'APPROVE' },
  { from: 'PENDING_FINANCE', to: 'REJECTED', allowedRoles: ['FINANCE', 'ADMIN'], action: 'REJECT' },
  { from: 'APPROVED', to: 'DISBURSED', allowedRoles: ['FINANCE', 'ADMIN'], action: 'DISBURSE' },
  { from: 'DISBURSED', to: 'AWAITING_RETIREMENT', allowedRoles: ['FINANCE', 'ADMIN'], action: 'REQUEST_RETIREMENT' },
  { from: 'AWAITING_RETIREMENT', to: 'UNDER_REVIEW', allowedRoles: ['EMPLOYEE', 'ADMIN'], action: 'SUBMIT_RETIREMENT' },
  { from: 'UNDER_REVIEW', to: 'SETTLED', allowedRoles: ['FINANCE', 'ADMIN'], action: 'SETTLE' },
  { from: 'UNDER_REVIEW', to: 'AWAITING_RETIREMENT', allowedRoles: ['FINANCE', 'ADMIN'], action: 'REQUEST_CHANGES' },
  { from: 'DISBURSED', to: 'OVERDUE', allowedRoles: ['FINANCE', 'ADMIN'], action: 'MARK_OVERDUE' }
];

export function getAvailableTransitions(status: AdvanceStatus, role: Role) {
  return transitions.filter((transition) => transition.from === status && transition.allowedRoles.includes(role));
}

export function canTransition(status: AdvanceStatus, next: AdvanceStatus, role: Role) {
  return transitions.some(
    (transition) => transition.from === status && transition.to === next && transition.allowedRoles.includes(role)
  );
}

export function assertTransition(status: AdvanceStatus, next: AdvanceStatus, role: Role) {
  if (!canTransition(status, next, role)) {
    throw new Error(`Transition from ${status} to ${next} is not allowed for role ${role}`);
  }
}

export function getNextStatuses(status: AdvanceStatus) {
  return transitions.filter((transition) => transition.from === status).map((transition) => transition.to);
}

export const advanceWorkflow = {
  transitions,
  getAvailableTransitions,
  canTransition,
  assertTransition,
  getNextStatuses
};
