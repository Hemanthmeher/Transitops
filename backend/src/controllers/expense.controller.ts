import { Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { AuthRequest } from '../types';

export class ExpenseController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await expenseService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const expense = await expenseService.findById(id);
      res.json({ success: true, data: expense });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.create(req.body);
      res.status(201).json({ success: true, data: expense });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const expense = await expenseService.update(id, req.body);
      res.json({ success: true, data: expense });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await expenseService.delete(id);
      res.json({ success: true, message: 'Expense deleted.' });
    } catch (error) { next(error); }
  }

  async getMonthlySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await expenseService.getMonthlySummary();
      res.json({ success: true, data: summary });
    } catch (error) { next(error); }
  }
}

export const expenseController = new ExpenseController();
