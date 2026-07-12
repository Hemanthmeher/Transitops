import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { VehicleStatus, Prisma } from '@prisma/client';

export class VehicleService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    status?: VehicleStatus; search?: string; type?: string; region?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.region) where.region = params.region;
    if (params.search) {
      where.OR = [
        { plateNumber: { contains: params.search } },
        { make: { contains: params.search } },
        { model: { contains: params.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } } },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { include: { driver: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
        maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        fuelLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
      },
    });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    return vehicle;
  }

  async create(data: {
    plateNumber: string; make: string; model: string; year: number; capacity: number;
    type?: string; fuelType?: string; mileage?: number; region?: string;
  }) {
    const existing = await prisma.vehicle.findUnique({ where: { plateNumber: data.plateNumber } });
    if (existing) throw new AppError('A vehicle with this plate number already exists.', 409);
    return prisma.vehicle.create({ data: { ...data, mileage: data.mileage || 0 } });
  }

  async update(id: number, data: {
    plateNumber?: string; make?: string; model?: string; year?: number; capacity?: number;
    status?: VehicleStatus; type?: string; fuelType?: string; mileage?: number; region?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (data.plateNumber && data.plateNumber !== vehicle.plateNumber) {
      const existing = await prisma.vehicle.findUnique({ where: { plateNumber: data.plateNumber } });
      if (existing) throw new AppError('A vehicle with this plate number already exists.', 409);
    }
    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: number) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    const activeTrip = await prisma.trip.findFirst({
      where: { vehicleId: id, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } },
    });
    if (activeTrip) throw new AppError('Cannot delete a vehicle that is currently on a trip.', 400);
    // Soft delete
    return prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), status: 'RETIRED' } });
  }

  async getAvailable() {
    return prisma.vehicle.findMany({
      where: { deletedAt: null, status: { in: ['AVAILABLE', 'DEPLOYED'] } },
      orderBy: { plateNumber: 'asc' },
    });
  }

  async getStats() {
    const [total, available, onTrip, inShop, retired, deployed] = await Promise.all([
      prisma.vehicle.count({ where: { deletedAt: null } }),
      prisma.vehicle.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { deletedAt: null, status: 'ON_TRIP' } }),
      prisma.vehicle.count({ where: { deletedAt: null, status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { deletedAt: null, status: 'RETIRED' } }),
      prisma.vehicle.count({ where: { deletedAt: null, status: 'DEPLOYED' } }),
    ]);
    return { total, available, onTrip, inShop, retired, deployed };
  }
}

export const vehicleService = new VehicleService();
