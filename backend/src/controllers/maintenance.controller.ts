import { Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service';
import { AuthRequest } from '../types';

export class MaintenanceController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await maintenanceService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await maintenanceService.findById(id);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await maintenanceService.create(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async markDueSoon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await maintenanceService.markDueSoon(id);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await maintenanceService.updateStatus(id, 'COMPLETED', req.body);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const log = await maintenanceService.updateStatus(id, 'CANCELLED', req.body);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await maintenanceService.delete(id);
      res.json({ success: true, message: 'Maintenance log deleted.' });
    } catch (error) { next(error); }
  }

  async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await maintenanceService.getAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) { next(error); }
  }
}

export const maintenanceController = new MaintenanceController();
