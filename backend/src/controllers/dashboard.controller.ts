import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../types';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { vehicleType, region, status } = req.query as any;
      const stats = await dashboardService.getStats({ vehicleType, region, status });
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
