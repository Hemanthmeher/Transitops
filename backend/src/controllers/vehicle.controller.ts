import { Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { AuthRequest } from '../types';

export class VehicleController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await vehicleService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const vehicle = await vehicleService.findById(id);
      res.json({ success: true, data: vehicle });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const vehicle = await vehicleService.update(id, req.body);
      res.json({ success: true, data: vehicle });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await vehicleService.delete(id);
      res.json({ success: true, message: 'Vehicle deleted successfully.' });
    } catch (error) { next(error); }
  }

  async getAvailable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehicleService.getAvailable();
      res.json({ success: true, data: vehicles });
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await vehicleService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}

export const vehicleController = new VehicleController();
