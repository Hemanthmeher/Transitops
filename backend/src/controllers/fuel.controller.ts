import { Response, NextFunction } from 'express';
import { fuelService } from '../services/fuel.service';
import { AuthRequest } from '../types';

export class FuelController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await fuelService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await fuelService.findById(id);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await fuelService.create(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await fuelService.update(id, req.body);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await fuelService.delete(id);
      res.json({ success: true, message: 'Fuel log deleted.' });
    } catch (error) { next(error); }
  }

  async getMonthlySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await fuelService.getMonthlySummary();
      res.json({ success: true, data: summary });
    } catch (error) { next(error); }
  }
}

export const fuelController = new FuelController();
