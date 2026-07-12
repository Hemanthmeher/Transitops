import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export class FuelService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    vehicleId?: number; tripId?: number; startDate?: string; endDate?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.tripId) where.tripId = params.tripId;
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = new Date(params.startDate);
      if (params.endDate) where.date.lte = new Date(params.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { vehicle: { select: { id: true, plateNumber: true } }, trip: { select: { id: true, origin: true, destination: true } } },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const log = await prisma.fuelLog.findUnique({ where: { id }, include: { vehicle: true, trip: true } });
    if (!log) throw new AppError('Fuel log not found.', 404);
    return log;
  }

  async create(data: {
    vehicleId: number; tripId?: number; date: string; liters: number;
    costPerLiter: number; totalCost: number; station?: string; fuelType?: string;
    odometer?: number; notes?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (!trip) throw new AppError('Trip not found.', 404);
    }

    return prisma.fuelLog.create({
      data: { vehicleId: data.vehicleId, tripId: data.tripId, date: new Date(data.date), liters: data.liters, costPerLiter: data.costPerLiter, totalCost: data.totalCost, station: data.station, fuelType: data.fuelType, odometer: data.odometer, notes: data.notes },
      include: { vehicle: { select: { id: true, plateNumber: true } }, trip: { select: { id: true, origin: true, destination: true } } },
    });
  }

  async update(id: number, data: { date?: string; liters?: number; costPerLiter?: number; totalCost?: number; station?: string; notes?: string }) {
    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) throw new AppError('Fuel log not found.', 404);
    return prisma.fuelLog.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
      include: { vehicle: { select: { id: true, plateNumber: true } } },
    });
  }

  async delete(id: number) {
    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) throw new AppError('Fuel log not found.', 404);
    return prisma.fuelLog.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getMonthlySummary() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const agg = await prisma.fuelLog.aggregate({
      where: { deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { totalCost: true, liters: true },
      _avg: { costPerLiter: true },
      _count: true,
    });

    return {
      totalCost: agg._sum?.totalCost || 0,
      totalLiters: agg._sum?.liters || 0,
      avgCostPerLiter: agg._avg?.costPerLiter || 0,
      totalEntries: agg._count,
    };
  }
}

export const fuelService = new FuelService();
