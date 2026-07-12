import { prisma } from '../utils/prisma';
import { generateCsv } from '../utils/helpers';

export class ReportService {
  async getReport(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const expenseDateFilter: any = {};
    if (startDate || endDate) { expenseDateFilter.date = {}; if (startDate) expenseDateFilter.date.gte = new Date(startDate); if (endDate) expenseDateFilter.date.lte = new Date(endDate); }

    const fuelDateFilter: any = {};
    if (startDate || endDate) { fuelDateFilter.date = {}; if (startDate) fuelDateFilter.date.gte = new Date(startDate); if (endDate) fuelDateFilter.date.lte = new Date(endDate); }

    const [tripsAgg, fuelAgg, expensesAgg, tripsOverTime, expensesByCat, fuelOverTime, vehiclePerformance] = await Promise.all([
      prisma.trip.aggregate({ where: { ...dateFilter, deletedAt: null }, _count: true }),
      prisma.fuelLog.aggregate({ where: { ...fuelDateFilter, deletedAt: null }, _sum: { totalCost: true, liters: true } }),
      prisma.expense.aggregate({ where: { ...expenseDateFilter, deletedAt: null }, _sum: { amount: true } }),
      prisma.trip.findMany({ where: { ...dateFilter, deletedAt: null }, select: { createdAt: true, status: true, revenue: true }, orderBy: { createdAt: 'asc' } }),
      prisma.expense.groupBy({ by: ['category'], where: { ...expenseDateFilter, deletedAt: null }, _sum: { amount: true } }),
      prisma.fuelLog.findMany({ where: { ...fuelDateFilter, deletedAt: null }, select: { date: true, totalCost: true, liters: true }, orderBy: { date: 'asc' } }),
      this.getVehiclePerformance(startDate, endDate),
    ]);

    const completedTrips = await prisma.trip.count({ where: { ...dateFilter, deletedAt: null, status: 'COMPLETED' } });
    const cancelledTrips = await prisma.trip.count({ where: { ...dateFilter, deletedAt: null, status: 'CANCELLED' } });
    const onTripTrips = await prisma.trip.count({ where: { ...dateFilter, deletedAt: null, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } } });
    const revenueAgg = await prisma.trip.aggregate({ where: { ...dateFilter, deletedAt: null, status: 'COMPLETED' }, _sum: { revenue: true } });

    const tripsOverTimeMap = new Map<string, { count: number; revenue: number }>();
    (tripsOverTime as any[]).forEach((t: { createdAt: Date; status: string; revenue: number | null }) => {
      const dateKey = t.createdAt.toISOString().split('T')[0];
      const existing = tripsOverTimeMap.get(dateKey) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += t.revenue || 0;
      tripsOverTimeMap.set(dateKey, existing);
    });

    const totalVehicles = await prisma.vehicle.count({ where: { deletedAt: null } });
    const activeTrips = await prisma.trip.count({ where: { ...dateFilter, deletedAt: null, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } } });
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeTrips / totalVehicles) * 100) : 0;

    const totalRevenue = revenueAgg._sum?.revenue || 0;
    const totalExpenses = expensesAgg._sum?.amount || 0;
    const totalFuelCost = fuelAgg._sum?.totalCost || 0;
    const totalCost = totalExpenses + totalFuelCost;
    const profit = totalRevenue - totalCost;

    return {
      trips: { total: tripsAgg._count, completed: completedTrips, cancelled: cancelledTrips, onTrip: onTripTrips, averageRevenue: completedTrips > 0 ? totalRevenue / completedTrips : 0 },
      fuel: { totalCost: totalFuelCost, totalLiters: fuelAgg._sum?.liters || 0, averageCostPerLiter: fuelAgg._sum?.liters ? totalFuelCost / (fuelAgg._sum?.liters || 1) : 0 },
      expenses: { totalCost: totalExpenses, byCategory: expensesByCat.map((e: any) => ({ category: e.category, total: e._sum?.amount || 0 })) },
      revenue: { total: totalRevenue, net: profit, profit },
      fleetUtilization,
      vehiclePerformance,
      chartData: {
        tripsOverTime: Array.from(tripsOverTimeMap.entries()).map(([date, data]: [string, any]) => ({ date, ...data })),
        expensesByCategory: expensesByCat.map((e: any) => ({ category: e.category, total: e._sum?.amount || 0 })),
        fuelCostOverTime: fuelOverTime.map((f: any) => ({ date: f.date.toISOString().split('T')[0], cost: f.totalCost, liters: f.liters })),
      },
    };
  }

  async exportCsv(startDate?: string, endDate?: string, type: string = 'trips') {
    const dateFilter: any = {};
    if (startDate || endDate) { dateFilter.createdAt = {}; if (startDate) dateFilter.createdAt.gte = new Date(startDate); if (endDate) dateFilter.createdAt.lte = new Date(endDate); }

    if (type === 'trips') {
      const trips = await prisma.trip.findMany({
        where: { ...dateFilter, deletedAt: null },
        include: { vehicle: { select: { plateNumber: true } }, driver: { select: { firstName: true, lastName: true } } },
      });
      const headers = ['ID', 'Origin', 'Destination', 'Status', 'Vehicle', 'Driver', 'Revenue', 'Created'];
      const rows = trips.map((t: any) => [t.id, t.origin, t.destination, t.status, t.vehicle?.plateNumber || '', `${t.driver?.firstName || ''} ${t.driver?.lastName || ''}`, t.revenue || 0, t.createdAt.toISOString().split('T')[0]]);
      return { csv: generateCsv(headers, rows), filename: `trips_export_${new Date().toISOString().split('T')[0]}.csv` };
    }

    if (type === 'fuel') {
      const logs = await prisma.fuelLog.findMany({
        where: { ...dateFilter, deletedAt: null },
        include: { vehicle: { select: { plateNumber: true } } },
      });
      const headers = ['ID', 'Vehicle', 'Liters', 'Cost/Liter', 'Total Cost', 'Date'];
      const rows = logs.map((l: any) => [l.id, l.vehicle?.plateNumber || '', l.liters, l.costPerLiter, l.totalCost, l.date.toISOString().split('T')[0]]);
      return { csv: generateCsv(headers, rows), filename: `fuel_export_${new Date().toISOString().split('T')[0]}.csv` };
    }

    if (type === 'expenses') {
      const expenses = await prisma.expense.findMany({
        where: { ...dateFilter, deletedAt: null },
        include: { vehicle: { select: { plateNumber: true } } },
      });
      const headers = ['ID', 'Category', 'Description', 'Amount', 'Vehicle', 'Date'];
      const rows = expenses.map((e: any) => [e.id, e.category, e.description, e.amount, e.vehicle?.plateNumber || '', e.date.toISOString().split('T')[0]]);
      return { csv: generateCsv(headers, rows), filename: `expenses_export_${new Date().toISOString().split('T')[0]}.csv` };
    }

    return { csv: '', filename: 'export.csv' };
  }

  private async getVehiclePerformance(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate || endDate) { dateFilter.createdAt = {}; if (startDate) dateFilter.createdAt.gte = new Date(startDate); if (endDate) dateFilter.createdAt.lte = new Date(endDate); }

    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      select: {
        id: true, plateNumber: true, make: true, model: true, year: true,
        trips: { where: { ...dateFilter, deletedAt: null }, select: { status: true, revenue: true, cargoWeight: true } },
        fuelLogs: { where: { ...dateFilter, deletedAt: null }, select: { totalCost: true, liters: true } },
      },
    });

    return vehicles.map((v: any) => ({
      id: v.id,
      vehicle: `${v.plateNumber} - ${v.make} ${v.model}`,
      totalTrips: v.trips.length,
      completedTrips: v.trips.filter((t: any) => t.status === 'COMPLETED').length,
      totalRevenue: v.trips.reduce((sum: number, t: any) => sum + (t.revenue || 0), 0),
      totalFuelCost: v.fuelLogs.reduce((sum: number, f: any) => sum + f.totalCost, 0),
      totalLiters: v.fuelLogs.reduce((sum: number, f: any) => sum + f.liters, 0),
    }));
  }
}

export const reportService = new ReportService();
