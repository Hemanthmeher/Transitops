import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class VehicleService {
  async findAll(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { plateNumber: { contains: query.search } },
        { make: { contains: query.search } },
        { model: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { trips: true, maintenanceLogs: true } } },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
        maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!vehicle) throw new NotFoundError('Vehicle');
    return vehicle;
  }

  async create(data: {
    plateNumber: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
  }) {
    const existing = await prisma.vehicle.findUnique({ where: { plateNumber: data.plateNumber } });
    if (existing) throw new ConflictError('Vehicle with this plate number already exists');

    return prisma.vehicle.create({ data });
  }

  async update(id: number, data: any) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Vehicle');

    if (data.plateNumber && data.plateNumber !== vehicle.plateNumber) {
      const existing = await prisma.vehicle.findUnique({ where: { plateNumber: data.plateNumber } });
      if (existing) throw new ConflictError('Vehicle with this plate number already exists');
    }

    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: number) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Vehicle');

    // Soft-delete by retiring
    return prisma.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' },
    });
  }

  async getAvailableVehicles() {
    return prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { plateNumber: 'asc' },
    });
  }
}
