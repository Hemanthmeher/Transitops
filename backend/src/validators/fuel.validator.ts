import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.number().int().positive('Vehicle is required'),
  tripId: z.number().int().positive().optional(),
  liters: z.number().positive('Liters must be positive'),
  costPerLiter: z.number().positive('Cost per liter must be positive'),
  totalCost: z.number().positive('Total cost must be positive'),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial();
