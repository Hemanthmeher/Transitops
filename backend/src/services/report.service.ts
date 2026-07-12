import prisma from '../utils/prisma';

export class ReportService {
  async getTripReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalFuelCost = trips.reduce((sum, t) =>
      sum + t.fuelLogs.reduce((s, f) => s + f.totalCost, 0), 0);
    const totalExpenses = trips.reduce((sum, t) =>
      sum + t.expenses.reduce((s, e) => s + e.amount, 0), 0);
    const totalCargoMoved = trips
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.cargoWeight, 0);

    return {
      summary: {
        totalTrips: trips.length,
        completedTrips: trips.filter((t) => t.status === 'COMPLETED').length,
        cancelledTrips: trips.filter((t) => t.status === 'CANCELLED').length,
        activeTrips: trips.filter((t) => t.status === 'IN_PROGRESS').length,
        totalFuelCost,
        totalExpenses,
        totalCargoMoved,
        averageCargoPerTrip: trips.length > 0 ? totalCargoMoved / trips.length : 0,
      },
      trips,
    };
  }

  async getFuelReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const fuelLogs = await prisma.fuelLog.findMany({
      where,
      include: { vehicle: true, trip: true },
      orderBy: { date: 'desc' },
    });

    const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const totalCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    return {
      summary: {
        totalFuelLogs: fuelLogs.length,
        totalLiters,
        totalCost,
        avgCostPerLiter,
      },
      fuelLogs,
    };
  }

  async getExpenseReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { trip: true },
      orderBy: { date: 'desc' },
    });

    const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return {
      summary: {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
        byCategory,
      },
      expenses,
    };
  }

  async getFleetUtilizationReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: { select: { trips: true } },
        trips: { where, select: { status: true } },
      },
    });

    const utilization = vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      make: v.make,
      model: v.model,
      status: v.status,
      totalTrips: v._count.trips,
      completedTrips: v.trips.filter((t) => t.status === 'COMPLETED').length,
    }));

    return utilization;
  }

  generateCsv(data: Record<string, any>[], headers: string[]): string {
    const headerRow = headers.join(',');
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h]?.toString() || '';
        // Escape commas and quotes
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  }
}
