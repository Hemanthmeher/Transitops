import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class DriverService {
  async findAll(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DriverWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { licenseNumber: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { trips: true } } },
      }),
      prisma.driver.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!driver) throw new NotFoundError('Driver');
    return driver;
  }

  async create(data: {
    licenseNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    const existing = await prisma.driver.findFirst({
      where: {
        OR: [
          { licenseNumber: data.licenseNumber },
          { email: data.email },
        ],
      },
    });
    if (existing) {
      if (existing.licenseNumber === data.licenseNumber) {
        throw new ConflictError('Driver with this license number already exists');
      }
      throw new ConflictError('Driver with this email already exists');
    }

    return prisma.driver.create({ data });
  }

  async update(id: number, data: any) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundError('Driver');

    if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
      if (existing) throw new ConflictError('Driver with this license number already exists');
    }
    if (data.email && data.email !== driver.email) {
      const existing = await prisma.driver.findUnique({ where: { email: data.email } });
      if (existing) throw new ConflictError('Driver with this email already exists');
    }

    return prisma.driver.update({ where: { id }, data });
  }

  async delete(id: number) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundError('Driver');

    return prisma.driver.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async getAvailableDrivers() {
    return prisma.driver.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { firstName: 'asc' },
    });
  }
}
