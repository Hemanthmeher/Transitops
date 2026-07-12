import { z } from 'zod';

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required').max(20),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1980, 'Year must be 1980 or later').max(2030),
  capacity: z.number().positive('Capacity must be positive'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
