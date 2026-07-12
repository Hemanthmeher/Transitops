import prisma from '../utils/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { Prisma, MaintenanceStatus } from '@prisma/client';

export class MaintenanceService {
  async findAll(query: { page?: number; limit?: number; status?: string; vehicleId?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceLogWhereInput = {};
    if (query.status) where.status = query.status as MaintenanceStatus;
    if (query.vehicleId) where.vehicleId = query.vehicleId;

    const [data, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
        },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) throw new NotFoundError('Maintenance log');
    return log;
  }

  async create(data: {
    vehicleId: number;
    description: string;
    type: string;
    scheduledDate?: string;
    cost?: number;
    notes?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Vehicle');
    if (vehicle.status === 'RETIRED') throw new BadRequestError('Cannot add maintenance to a retired vehicle');

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        type: data.type as any,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        cost: data.cost || 0,
        notes: data.notes,
        status: 'OPEN',
      },
    });

    // Update vehicle status to IN_SHOP (unless currently on a trip)
    if (vehicle.status !== 'ON_TRIP') {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'IN_SHOP' },
      });
    }

    return log;
  }

  async update(id: number, data: any) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) throw new NotFoundError('Maintenance log');

    const updateData: any = { ...data };
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.status) updateData.status = data.status as MaintenanceStatus;

    const updated = await prisma.maintenanceLog.update({ where: { id }, data: updateData });

    // Handle vehicle status transitions based on maintenance status
    if (data.status === 'COMPLETED' && log.vehicle.status === 'IN_SHOP') {
      await prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updated;
  }

  async delete(id: number) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundError('Maintenance log');

    return prisma.maintenanceLog.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getPendingMaintenance() {
    return prisma.maintenanceLog.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}
