import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { DriverStatus, Prisma } from '@prisma/client';
import { calculateSafetyScore } from '../utils/helpers';

export class DriverService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    status?: DriverStatus; search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
        { licenseNumber: { contains: params.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.driver.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { trips: true } } },
      }),
      prisma.driver.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { include: { vehicle: { select: { id: true, plateNumber: true, make: true, model: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { trips: true } },
      },
    });
    if (!driver) throw new AppError('Driver not found.', 404);
    return driver;
  }

  async create(data: {
    licenseNumber: string; firstName: string; lastName: string; email: string;
    phone?: string; licenseExpiry?: string; experience?: number;
  }) {
    const existingLicense = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existingLicense) throw new AppError('A driver with this license number already exists.', 409);
    const existingEmail = await prisma.driver.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new AppError('A driver with this email already exists.', 409);

    return prisma.driver.create({
      data: {
        licenseNumber: data.licenseNumber, firstName: data.firstName, lastName: data.lastName,
        email: data.email, phone: data.phone,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
        experience: data.experience || 0,
        safetyScore: calculateSafetyScore(data.experience || 0, 0, 0, 0),
      },
    });
  }

  async update(id: number, data: {
    licenseNumber?: string; firstName?: string; lastName?: string; email?: string;
    phone?: string; licenseExpiry?: string; status?: DriverStatus; experience?: number;
  }) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new AppError('Driver not found.', 404);

    if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
      if (existing) throw new AppError('A driver with this license number already exists.', 409);
    }
    if (data.email && data.email !== driver.email) {
      const existing = await prisma.driver.findUnique({ where: { email: data.email } });
      if (existing) throw new AppError('A driver with this email already exists.', 409);
    }

    const updateData: any = { ...data };
    if (data.licenseExpiry) updateData.licenseExpiry = new Date(data.licenseExpiry);
    if (data.experience) {
      const completedTrips = await prisma.trip.count({ where: { driverId: id, status: 'COMPLETED' } });
      updateData.safetyScore = calculateSafetyScore(data.experience, completedTrips, completedTrips, 0);
    }

    return prisma.driver.update({ where: { id }, data: updateData });
  }

  async updateStatus(id: number, status: DriverStatus) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new AppError('Driver not found.', 404);
    return prisma.driver.update({ where: { id }, data: { status } });
  }

  async delete(id: number) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new AppError('Driver not found.', 404);
    const activeTrip = await prisma.trip.findFirst({
      where: { driverId: id, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } },
    });
    if (activeTrip) throw new AppError('Cannot delete a driver that is currently on a trip.', 400);
    return prisma.driver.update({ where: { id }, data: { deletedAt: new Date(), status: 'SUSPENDED' } });
  }

  async getAvailable() {
    return prisma.driver.findMany({
      where: { deletedAt: null, status: 'AVAILABLE' },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  async getStats() {
    const [total, available, onTrip, suspended, offDuty] = await Promise.all([
      prisma.driver.count({ where: { deletedAt: null } }),
      prisma.driver.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      prisma.driver.count({ where: { deletedAt: null, status: 'ON_TRIP' } }),
      prisma.driver.count({ where: { deletedAt: null, status: 'SUSPENDED' } }),
      prisma.driver.count({ where: { deletedAt: null, status: 'OFF_DUTY' } }),
    ]);
    return { total, available, onTrip, suspended, offDuty };
  }
}

export const driverService = new DriverService();
