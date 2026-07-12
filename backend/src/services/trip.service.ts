import prisma from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Prisma, VehicleStatus, DriverStatus, TripStatus } from '@prisma/client';

export class TripService {
  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    vehicleId?: number;
    driverId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TripWhereInput = {};
    if (query.status) where.status = query.status as TripStatus;
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.driverId) where.driverId = query.driverId;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
          driver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
      },
    });
    if (!trip) throw new NotFoundError('Trip');
    return trip;
  }

  async create(data: {
    vehicleId: number;
    driverId: number;
    origin: string;
    destination: string;
    cargoWeight: number;
    notes?: string;
  }) {
    // Validate vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Vehicle');
    if (vehicle.status !== 'AVAILABLE') {
      if (vehicle.status === 'IN_SHOP') throw new BadRequestError('Vehicle is in shop and cannot be dispatched');
      if (vehicle.status === 'RETIRED') throw new BadRequestError('Vehicle is retired and cannot be dispatched');
      if (vehicle.status === 'ON_TRIP') throw new BadRequestError('Vehicle is already on a trip');
    }

    // Validate driver exists and is available
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) throw new NotFoundError('Driver');
    if (driver.status !== 'AVAILABLE') {
      if (driver.status === 'EXPIRED') throw new BadRequestError('Driver license is expired');
      if (driver.status === 'SUSPENDED') throw new BadRequestError('Driver is suspended');
      if (driver.status === 'ON_TRIP') throw new BadRequestError('Driver is already on a trip');
    }

    // Check cargo weight against vehicle capacity
    if (data.cargoWeight > vehicle.capacity) {
      throw new BadRequestError(
        `Cargo weight (${data.cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`
      );
    }

    // Create trip and update vehicle/driver status to ON_TRIP
    const trip = await prisma.trip.create({
      data: {
        ...data,
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
    });

    await Promise.all([
      prisma.vehicle.update({ where: { id: data.vehicleId }, data: { status: 'ON_TRIP' } }),
      prisma.driver.update({ where: { id: data.driverId }, data: { status: 'ON_TRIP' } }),
    ]);

    return trip;
  }

  async updateStatus(id: number, status: TripStatus, notes?: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundError('Trip');

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.endTime = new Date();
      // Restore vehicle and driver to available
      await Promise.all([
        prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } }),
        prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } }),
      ]);
    } else if (status === 'CANCELLED') {
      // Restore vehicle and driver to available
      await Promise.all([
        prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } }),
        prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } }),
      ]);
    }

    if (notes) updateData.notes = notes;
    if (status === 'IN_PROGRESS' && !trip.startTime) {
      updateData.startTime = new Date();
    }

    return prisma.trip.update({ where: { id }, data: updateData });
  }

  async getActiveTrips() {
    return prisma.trip.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
        driver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
