import { z } from 'zod';

export const createExpenseSchema = z.object({
  tripId: z.number().int().positive().optional(),
  category: z.enum(['TOLL', 'PARKING', 'FOOD', 'ACCOMMODATION', 'SUPPLIES', 'OTHER']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime().optional(),
  receiptUrl: z.string().url().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
