import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class FuelService {
  async findAll(query: { page?: number; limit?: number; vehicleId?: number; tripId?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FuelLogWhereInput = {};
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.tripId) where.tripId = query.tripId;

    const [data, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          vehicle: { select: { id: true, plateNumber: true } },
          trip: { select: { id: true, origin: true, destination: true } },
        },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
    });
    if (!log) throw new NotFoundError('Fuel log');
    return log;
  }

  async create(data: {
    vehicleId: number;
    tripId?: number;
    liters: number;
    costPerLiter: number;
    totalCost: number;
    date?: string;
    notes?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Vehicle');

    return prisma.fuelLog.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async update(id: number, data: any) {
    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundError('Fuel log');

    return prisma.fuelLog.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async delete(id: number) {
    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundError('Fuel log');

    return prisma.fuelLog.delete({ where: { id } });
  }
}
