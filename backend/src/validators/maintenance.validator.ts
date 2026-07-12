import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.number().int().positive('Vehicle is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY']),
  scheduledDate: z.string().datetime().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateMaintenanceSchema = z.object({
  description: z.string().optional(),
  type: z.enum(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});
