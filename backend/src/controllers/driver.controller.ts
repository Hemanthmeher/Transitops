import { Response, NextFunction } from 'express';
import { driverService } from '../services/driver.service';
import { AuthRequest } from '../types';

export class DriverController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await driverService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const driver = await driverService.findById(id);
      res.json({ success: true, data: driver });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.create(req.body);
      res.status(201).json({ success: true, data: driver });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const driver = await driverService.update(id, req.body);
      res.json({ success: true, data: driver });
    } catch (error) { next(error); }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const driver = await driverService.updateStatus(id, status);
      res.json({ success: true, data: driver });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await driverService.delete(id);
      res.json({ success: true, message: 'Driver deleted successfully.' });
    } catch (error) { next(error); }
  }

  async getAvailable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const drivers = await driverService.getAvailable();
      res.json({ success: true, data: drivers });
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await driverService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}

export const driverController = new DriverController();
