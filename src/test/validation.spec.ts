import { describe, expect, it } from 'vitest';
import { AdvanceRequestSchema, RetirementSchema } from '@features/advances/schemas';

describe('validation schemas', () => {
  it('rejects excessive advance amounts', () => {
    const result = AdvanceRequestSchema.safeParse({
      purpose: 'Conference',
      project: 'Marketing',
      costCenterId: 'cc-100',
      glCodeId: 'gl-6000',
      currency: 'USD',
      amountRequested: 6000,
      expectedStartDate: '2024-05-01',
      expectedEndDate: '2024-05-02'
    });
    expect(result.success).toBe(false);
  });

  it('requires override when receipts missing above threshold', () => {
    const result = RetirementSchema.safeParse({
      items: [
        {
          category: 'MEALS',
          description: 'Dinner',
          amount: 30,
          currency: 'USD',
          date: '2024-05-01'
        }
      ],
      notes: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('overrideReason');
    }
  });
});
