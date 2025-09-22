import { describe, expect, it } from 'vitest';
import { advanceWorkflow, canTransition } from '@lib/utils/workflow';

describe('advanceWorkflow', () => {
  it('allows manager approval path', () => {
    expect(canTransition('PENDING_MANAGER', 'PENDING_FINANCE', 'MANAGER')).toBe(true);
    expect(() => advanceWorkflow.assertTransition('PENDING_MANAGER', 'PENDING_FINANCE', 'MANAGER')).not.toThrow();
  });

  it('blocks employee from approving finance step', () => {
    expect(canTransition('PENDING_FINANCE', 'APPROVED', 'EMPLOYEE')).toBe(false);
    expect(() => advanceWorkflow.assertTransition('PENDING_FINANCE', 'APPROVED', 'EMPLOYEE')).toThrow();
  });

  it('enumerates next statuses', () => {
    expect(advanceWorkflow.getNextStatuses('UNDER_REVIEW')).toEqual(['SETTLED', 'AWAITING_RETIREMENT']);
  });
});
