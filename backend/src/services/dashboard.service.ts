import { prisma } from '../utils/prisma';
import { calculateFleetUtilization } from '../utils/helpers';

export class DashboardService {
  async getStats(params?: { vehicleType?: string; region?: string; status?: string }) {
    const vehicleFilter: any = { deletedAt: null };
    if (params?.vehicleType) vehicleFilter.type = params.vehicleType;
    if (params?.region) vehicleFilter.region = params.region;
    if (params?.status) vehicleFilter.status = params.status;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalVehicles, availableVehicles, inShopVehicles, deployedVehicles,
      totalDrivers, availableDrivers,
      activeTrips, completedTrips, todayTrips, pendingTrips,
      monthlyFuelAgg, monthlyExpenseAgg, recentTrips,
      vehicleStatusDist, driverStatusDist, tripStatusDist, maintenanceAlerts,
    ] = await Promise.all([
      prisma.vehicle.count({ where: vehicleFilter }),
      prisma.vehicle.count({ where: { ...vehicleFilter, status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { ...vehicleFilter, status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { ...vehicleFilter, status: 'DEPLOYED' } }),
      prisma.driver.count({ where: { deletedAt: null } }),
      prisma.driver.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      prisma.trip.count({ where: { deletedAt: null, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.trip.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      prisma.trip.count({ where: { deletedAt: null, createdAt: { gte: today, lt: tomorrow } } }),
      prisma.trip.count({ where: { deletedAt: null, status: { in: ['REQUESTED', 'ASSIGNED'] } } }),
      this.getMonthlyFuelCost(),
      this.getMonthlyExpenseCost(),
      prisma.trip.findMany({
        where: { deletedAt: null },
        take: 5, orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
          driver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.vehicle.groupBy({ by: ['status'], _count: true, where: vehicleFilter }),
      prisma.driver.groupBy({ by: ['status'], _count: true }),
      prisma.trip.groupBy({ by: ['status'], _count: true, where: { deletedAt: null } }),
      prisma.maintenanceLog.findMany({
        where: { deletedAt: null, status: { in: ['OPEN', 'DUE_SOON'] } },
        include: { vehicle: { select: { id: true, plateNumber: true } } },
        orderBy: { scheduledDate: 'asc' },
        take: 5,
      }),
    ]);

    const fleetUtilization = calculateFleetUtilization(activeTrips, totalVehicles);

    return {
      // Core stats
      totalVehicles, availableVehicles, inShopVehicles, deployedVehicles,
      totalDrivers, availableDrivers, activeTrips, completedTrips,
      // New dashboard cards
      todayTrips, pendingTrips,
      // Financial
      monthlyFuelCost: (monthlyFuelAgg._sum as any)?.totalCost || 0,
      monthlyExpenseCost: (monthlyExpenseAgg._sum as any)?.amount || 0,
      // Fleet utilization
      fleetUtilization,
      // Recent data
      recentTrips,
      maintenanceAlerts: maintenanceAlerts.map((m: any) => ({
        id: m.id, description: m.description, status: m.status,
        scheduledDate: m.scheduledDate, vehicle: m.vehicle,
      })),
      // Distributions
      vehicleStatusDistribution: vehicleStatusDist.map((v: { status: string; _count: number }) => ({ status: v.status, count: v._count })),
      driverStatusDistribution: driverStatusDist.map((d: { status: string; _count: number }) => ({ status: d.status, count: d._count })),
      tripStatusDistribution: tripStatusDist.map((t: { status: string; _count: number }) => ({ status: t.status, count: t._count })),
    };
  }

  private async getMonthlyFuelCost() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return prisma.fuelLog.aggregate({
      where: { date: { gte: startOfMonth }, deletedAt: null },
      _sum: { totalCost: true },
    });
  }

  private async getMonthlyExpenseCost() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return prisma.expense.aggregate({
      where: { date: { gte: startOfMonth }, deletedAt: null },
      _sum: { amount: true },
    });
  }
}

export const dashboardService = new DashboardService();
