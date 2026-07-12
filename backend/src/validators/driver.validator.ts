import { z } from 'zod';

export const createDriverSchema = z.object({
  licenseNumber: z.string().min(2, 'License number is required').max(30),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'EXPIRED', 'SUSPENDED']).optional(),
});

export const updateDriverSchema = createDriverSchema.partial();
