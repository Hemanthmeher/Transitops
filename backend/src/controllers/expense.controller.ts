import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { sendSuccess, sendPaginated } from '../utils/helpers';

const expenseService = new ExpenseService();

export class ExpenseController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, tripId, category, startDate, endDate } = req.query;
      const result = await expenseService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        tripId: tripId ? Number(tripId) : undefined,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.findById(Number(req.params.id));
      sendSuccess(res, expense);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.create(req.body);
      sendSuccess(res, expense, 'Expense created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.update(Number(req.params.id), req.body);
      sendSuccess(res, expense, 'Expense updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await expenseService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Expense deleted');
    } catch (error) {
      next(error);
    }
  }
}
