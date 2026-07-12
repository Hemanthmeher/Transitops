import { z } from 'zod';

export const createFuelSchema = z.object({
  body: z.object({
    vehicleId: z.number({ required_error: 'Vehicle ID is required' }),
    tripId: z.number().optional(),
    date: z.string().optional(),
    liters: z.number({ required_error: 'Liters is required' }).positive(),
    costPerLiter: z.number({ required_error: 'Cost per liter is required' }).positive(),
    totalCost: z.number({ required_error: 'Total cost is required' }).positive(),
    station: z.string().optional(),
    fuelType: z.string().optional(),
    odometer: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const updateFuelSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    liters: z.number().positive().optional(),
    costPerLiter: z.number().positive().optional(),
    totalCost: z.number().positive().optional(),
    station: z.string().optional(),
    notes: z.string().optional(),
  }),
});
