import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be positive'),
  category: z.enum([
    'food',
    'transport',
    'shopping',
    'entertainment',
    'bills',
    'health',
    'education',
    'other',
  ]),
  note: z.string().max(500, 'Note is too long').optional(),
  date: z.string().min(1, 'Date is required'),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
