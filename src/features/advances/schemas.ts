import { z } from 'zod';

export const AdvanceRequestSchema = z.object({
  purpose: z.string().min(3, 'Provide a short description of the activity.'),
  project: z.string().min(2, 'Project or initiative is required.'),
  costCenterId: z.string().min(1, 'Cost center is required.'),
  glCodeId: z.string().min(1, 'GL code is required.'),
  currency: z.string().min(1),
  amountRequested: z
    .number({ invalid_type_error: 'Enter a numeric amount.' })
    .positive('Amount must be greater than zero.')
    .max(5000, 'For amounts above 5,000 please attach executive approval.'),
  expectedStartDate: z.string().min(1, 'Expected start date is required.'),
  expectedEndDate: z.string().min(1, 'Expected end date is required.')
});

export const RetirementItemSchema = z.object({
  category: z.string().min(1, 'Select a category.'),
  description: z.string().min(2, 'Add a description.'),
  amount: z.number().positive('Amount must be positive.'),
  currency: z.string().min(1),
  date: z.string().min(1, 'Provide the spend date.'),
  attachmentUrl: z.string().optional()
});

export const RetirementSchema = z
  .object({
    items: z.array(RetirementItemSchema).min(1, 'Add at least one receipt.'),
    notes: z.string().optional(),
    overrideReason: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const missingReceipts = data.items.filter((item) => !item.attachmentUrl && item.amount > 25);
    if (missingReceipts.length && !data.overrideReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Receipts are required above $25. Provide an override reason to continue.',
        path: ['overrideReason']
      });
    }
  });

export type AdvanceRequestValues = z.infer<typeof AdvanceRequestSchema>;
export type RetirementValues = z.infer<typeof RetirementSchema>;
