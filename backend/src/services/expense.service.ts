import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class ExpenseService {
  async findAll(query: { page?: number; limit?: number; tripId?: number; category?: string; startDate?: string; endDate?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};
    if (query.tripId) where.tripId = query.tripId;
    if (query.category) where.category = query.category as any;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          trip: { select: { id: true, origin: true, destination: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { trip: true },
    });
    if (!expense) throw new NotFoundError('Expense');
    return expense;
  }

  async create(data: {
    tripId?: number;
    category: string;
    amount: number;
    description: string;
    date?: string;
    receiptUrl?: string | null;
  }) {
    return prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        category: data.category as any,
      },
    });
  }

  async update(id: number, data: any) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense');

    return prisma.expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async delete(id: number) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense');

    return prisma.expense.delete({ where: { id } });
  }
}
