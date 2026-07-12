import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { ExpenseCategory } from '@prisma/client';

export class ExpenseService {
  async findAll(params: {
    page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc';
    category?: ExpenseCategory; vehicleId?: number; startDate?: string; endDate?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: any = { deletedAt: null };
    if (params.category) where.category = params.category;
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = new Date(params.startDate);
      if (params.endDate) where.date.lte = new Date(params.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { vehicle: { select: { id: true, plateNumber: true } } },
      }),
      prisma.expense.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const expense = await prisma.expense.findUnique({ where: { id }, include: { vehicle: true } });
    if (!expense) throw new AppError('Expense not found.', 404);
    return expense;
  }

  async create(data: {
    vehicleId?: number; category: ExpenseCategory; description: string;
    amount: number; date: string; receiptUrl?: string; notes?: string;
  }) {
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new AppError('Vehicle not found.', 404);
    }

    return prisma.expense.create({
      data: { vehicleId: data.vehicleId, category: data.category, description: data.description, amount: data.amount, date: new Date(data.date), receiptUrl: data.receiptUrl, notes: data.notes },
      include: { vehicle: { select: { id: true, plateNumber: true } } },
    });
  }

  async update(id: number, data: { category?: ExpenseCategory; description?: string; amount?: number; date?: string; notes?: string }) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Expense not found.', 404);
    return prisma.expense.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
      include: { vehicle: { select: { id: true, plateNumber: true } } },
    });
  }

  async delete(id: number) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Expense not found.', 404);
    return prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getMonthlySummary() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const agg = await prisma.expense.aggregate({
      where: { deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
      _count: true,
    });

    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    });

    return {
      totalCost: agg._sum?.amount || 0,
      totalEntries: agg._count,
      byCategory: byCategory.map((e: { category: ExpenseCategory; _sum: { amount: number | null } }) => ({
        category: e.category,
        total: e._sum?.amount || 0,
      })),
    };
  }
}

export const expenseService = new ExpenseService();
