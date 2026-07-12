import { z } from 'zod';

export const createTripSchema = z.object({
  vehicleId: z.number().int().positive('Vehicle is required'),
  driverId: z.number().int().positive('Driver is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});
