import prisma from '../utils/prisma';

export class DashboardService {
  async getStats() {
    const [
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      inShopVehicles,
      totalDrivers,
      availableDrivers,
      onTripDrivers,
      activeTrips,
      todaysTrips,
      pendingMaintenance,
      todayFuelCost,
      totalRevenue,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'AVAILABLE' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
      prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.trip.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.maintenanceLog.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      prisma.fuelLog.aggregate({
        _sum: { totalCost: true },
        where: {
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return {
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        onTrip: onTripVehicles,
        inShop: inShopVehicles,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        onTrip: onTripDrivers,
      },
      trips: {
        active: activeTrips,
        today: todaysTrips,
      },
      maintenance: {
        pending: pendingMaintenance,
      },
      finances: {
        fuelCostToday: todayFuelCost._sum.totalCost || 0,
        expensesToday: totalRevenue._sum.amount || 0,
      },
    };
  }

  async getRecentTrips(limit: number = 5) {
    return prisma.trip.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { id: true, plateNumber: true, make: true, model: true } },
        driver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getVehicleStatusDistribution() {
    const statuses = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: true,
    });
    return statuses.map((s) => ({ name: s.status, count: s._count }));
  }

  async getTripStatusSummary() {
    const statuses = await prisma.trip.groupBy({
      by: ['status'],
      _count: true,
    });
    return statuses.map((s) => ({ name: s.status, count: s._count }));
  }
}
