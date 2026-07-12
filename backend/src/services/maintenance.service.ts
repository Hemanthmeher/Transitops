import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { MaintenanceType, Prisma } from '@prisma/client';

export class MaintenanceService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    status?: string; vehicleId?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.vehicleId) where.vehicleId = params.vehicleId;

    const [data, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { vehicle: { select: { id: true, plateNumber: true, make: true, model: true } } },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!log) throw new AppError('Maintenance log not found.', 404);
    return log;
  }

  async create(data: {
    vehicleId: number; type: MaintenanceType; description: string;
    scheduledDate?: string; cost?: number; notes?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.status === 'RETIRED') throw new AppError('Cannot perform maintenance on a retired vehicle.', 400);

    const scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : new Date();

    const log = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const maintenanceLog = await tx.maintenanceLog.create({
        data: {
          vehicleId: data.vehicleId, type: data.type, description: data.description,
          scheduledDate, cost: data.cost, notes: data.notes, status: 'OPEN',
        },
      });
      if (vehicle.status === 'AVAILABLE' || vehicle.status === 'ON_TRIP') {
        await tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: 'IN_SHOP' } });
      }
      return maintenanceLog;
    });

    return this.findById(log.id);
  }

  async updateStatus(id: number, status: 'COMPLETED' | 'CANCELLED', data?: { cost?: number; notes?: string; completedDate?: string }) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!log) throw new AppError('Maintenance log not found.', 404);
    if (log.status === 'COMPLETED' || log.status === 'CANCELLED') {
      throw new AppError(`Maintenance is already ${log.status.toLowerCase()}.`, 400);
    }

    const updateData: any = { status };
    if (data?.cost) updateData.cost = data.cost;
    if (data?.notes) updateData.notes = data.notes;
    if (data?.completedDate) updateData.completedDate = new Date(data.completedDate);
    else if (status === 'COMPLETED') updateData.completedDate = new Date();

    const updatedLog = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const result = await tx.maintenanceLog.update({ where: { id }, data: updateData });
      if (status === 'COMPLETED' && log.vehicle.status !== 'RETIRED') {
        await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });
      }
      return result;
    });

    return this.findById(updatedLog.id);
  }

  async markDueSoon(id: number) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) throw new AppError('Maintenance log not found.', 404);
    if (log.status !== 'OPEN') throw new AppError('Can only mark open maintenance as due soon.', 400);
    return prisma.maintenanceLog.update({ where: { id }, data: { status: 'DUE_SOON' } });
  }

  async getAlerts() {
    // Find maintenance that is DUE_SOON or OPEN with scheduled date approaching
    const upcoming = await prisma.maintenanceLog.findMany({
      where: {
        deletedAt: null,
        status: { in: ['OPEN', 'DUE_SOON'] },
      },
      include: { vehicle: { select: { id: true, plateNumber: true } } },
      orderBy: { scheduledDate: 'asc' },
      take: 10,
    });
    return upcoming;
  }

  async delete(id: number) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) throw new AppError('Maintenance log not found.', 404);
    return prisma.maintenanceLog.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const maintenanceService = new MaintenanceService();
