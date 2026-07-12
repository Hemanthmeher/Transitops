import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { calculateSafetyScore } from '../utils/helpers';

export class TripService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    status?: string; vehicleId?: number; driverId?: number; search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.driverId) where.driverId = params.driverId;
    if (params.search) {
      where.OR = [
        { origin: { contains: params.search } },
        { destination: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
          driver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, fuelLogs: { orderBy: { createdAt: 'desc' } } },
    });
    if (!trip) throw new AppError('Trip not found.', 404);
    return trip;
  }

  async create(data: {
    vehicleId: number; driverId: number; origin: string; destination: string;
    cargoWeight?: number; cargoType?: string; description?: string; scheduledDate?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) throw new AppError('Driver not found.', 404);

    // Business rules
    if (vehicle.status === 'IN_SHOP') throw new AppError('Vehicle is in shop for maintenance.', 400);
    if (vehicle.status === 'RETIRED') throw new AppError('Vehicle is retired.', 400);
    if (driver.status === 'SUSPENDED') throw new AppError('Driver is suspended.', 400);
    if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
      throw new AppError('Driver license has expired.', 400);
    }
    if (['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_TRIP'].includes(vehicle.status)) {
      throw new AppError('Vehicle is already on an active trip.', 400);
    }
    if (driver.status === 'ON_TRIP') throw new AppError('Driver is already on an active trip.', 400);
    if (data.cargoWeight && data.cargoWeight > vehicle.capacity) {
      throw new AppError(`Cargo weight (${data.cargoWeight} kg) exceeds capacity (${vehicle.capacity} kg).`, 400);
    }

    const trip = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newTrip = await tx.trip.create({
        data: {
          vehicleId: data.vehicleId, driverId: data.driverId,
          origin: data.origin, destination: data.destination,
          cargoWeight: data.cargoWeight, cargoType: data.cargoType,
          description: data.description,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
          status: 'REQUESTED',
        },
      });
      await tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: 'ON_TRIP' } });
      await tx.driver.update({ where: { id: data.driverId }, data: { status: 'ON_TRIP' } });
      return newTrip;
    });

    return this.findById(trip.id);
  }

  async assign(id: number) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.status !== 'REQUESTED') throw new AppError(`Trip is already ${trip.status.toLowerCase()}.`, 400);
    return prisma.trip.update({ where: { id }, data: { status: 'ASSIGNED' } });
  }

  async startTrip(id: number) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.status !== 'ASSIGNED') throw new AppError('Trip must be assigned before starting.', 400);
    return prisma.trip.update({ where: { id }, data: { status: 'IN_PROGRESS', startTime: new Date() } });
  }

  async updateStatus(id: number, status: 'COMPLETED' | 'CANCELLED', notes?: string) {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new AppError(`Trip is already ${trip.status.toLowerCase()}. Cannot update.`, 400);
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') updateData.completedDate = new Date();
    if (notes) updateData.notes = notes;

    const updatedTrip = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const result = await tx.trip.update({ where: { id }, data: updateData });
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });

      // Update driver safety score on completion
      if (status === 'COMPLETED') {
        const totalTrips = await tx.trip.count({ where: { driverId: trip.driverId } });
        const completedTrips = await tx.trip.count({ where: { driverId: trip.driverId, status: 'COMPLETED' } });
        const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
        if (driver) {
          const newScore = calculateSafetyScore(driver.experience || 0, totalTrips, completedTrips, 0);
          await tx.driver.update({ where: { id: trip.driverId }, data: { safetyScore: newScore } });
        }
      }

      return result;
    });

    return this.findById(updatedTrip.id);
  }

  async delete(id: number) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'].includes(trip.status)) {
      throw new AppError('Cannot delete an active trip. Cancel it first.', 400);
    }
    return prisma.trip.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getTodayCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.trip.count({
      where: {
        deletedAt: null,
        createdAt: { gte: today, lt: tomorrow },
      },
    });
  }

  async getPendingCount() {
    return prisma.trip.count({
      where: { deletedAt: null, status: { in: ['REQUESTED', 'ASSIGNED'] } },
    });
  }
}

export const tripService = new TripService();
